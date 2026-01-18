import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Inject, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { EnvDto } from '@/env/dto/envDto';
import { DRIZZLE, type DbType } from '@/database/database.module';
import * as schema from '@/db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

@Processor('webhook-delivery')
export class WebhookDeliveryProcessor extends WorkerHost {
    private readonly logger = new Logger(WebhookDeliveryProcessor.name);

    constructor(
        private readonly httpService: HttpService,
        private readonly env: EnvDto,
        @Inject(DRIZZLE) private readonly db: DbType,
    ) {
        super();
    }

    async process(job: Job<{ eventId: string; initiator?: { type: 'system' | 'user'; id?: string } }>): Promise<any> {
        const { eventId, initiator } = job.data;
        this.logger.log(`Processing webhook delivery for event: ${eventId}`);

        // 1. Fetch Event and Webhook details
        const event = await this.db.query.webhookEvents.findFirst({
            where: eq(schema.webhookEvents.webhookEventId, eventId),
            with: {
                webhook: true,
            },
        });

        if (!event || !event.webhook) {
            this.logger.error(`Event or Webhook not found for eventId: ${eventId}`);
            return;
        }

        const { webhook } = event;

        // 2. Create Delivery Record (Pending)
        const [delivery] = await this.db
            .insert(schema.webhookDeliveries)
            .values({
                webhookEventId: eventId,
                deliveryPayload: event.eventPayload,
                deliveryTimestamp: new Date(),
                deliveryStatus: 'pending',
                deliveryAttempts: job.attemptsMade + 1,
                createdBy: initiator?.type || 'system',
                createdById: initiator?.id,
            })
            .returning();

        const startTime = Date.now();
        try {
            // 3. Attempt Delivery
            const timeout = webhook.timeoutMs || 5000;

            // Serialize payload to ensure the hash matches the body exactly
            const stringPayload = JSON.stringify(event.eventPayload);

            // Compute HMAC Signature
            const signature = crypto
                .createHmac('sha256', webhook.hmacSecret || '')
                .update(stringPayload)
                .digest('hex');

            const response = await this.httpService.axiosRef.post(
                webhook.targetUrl,
                stringPayload, // Send the exact string we hashed
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Hook-Relay-Event-ID': eventId,
                        'X-Hook-Relay-Signature': `sha256=${signature}`,
                    },
                    timeout: timeout,
                    validateStatus: (status) => {
                        // Only resolve for 2xx and 3xx status codes
                        return status >= 200 && status < 400;
                    },
                },
            );

            const duration = Date.now() - startTime;
            const isSuccess = response.status >= 200 && response.status < 300;

            // 4. Update Delivery Record (Success/Fail)
            await this.db
                .update(schema.webhookDeliveries)
                .set({
                    deliveryStatus: isSuccess ? 'success' : 'failed',
                    deliveryResponse: {
                        status: response.status,
                        statusText: response.statusText,
                        headers: response.headers,
                        data: response.data,
                        duration,
                    },
                    deliveryResponseStatus: response.status,
                    updatedAt: new Date(),
                })
                .where(eq(schema.webhookDeliveries.webhookDeliveryId, delivery.webhookDeliveryId));

            if (!isSuccess) {
                throw new Error(`Webhook failed with status ${response.status}`);
            }

            this.logger.log(`Webhook delivered successfully to ${webhook.targetUrl}`);
            return { status: response.status };

        } catch (error: any) {
            const duration = Date.now() - startTime;

            // Update local delivery record with error
            await this.db
                .update(schema.webhookDeliveries)
                .set({
                    deliveryStatus: 'failed',
                    deliveryError: {
                        message: error.message,
                        code: error.code,
                        stack: error.stack,
                        duration,
                    },
                    updatedAt: new Date(),
                })
                .where(eq(schema.webhookDeliveries.webhookDeliveryId, delivery.webhookDeliveryId));

            this.logger.error(`Webhook delivery failed: ${error.message}`);
            throw error; // Propagate to BullMQ for retry
        }
    }

    @OnWorkerEvent('failed')
    async onFailed(job: Job, error: Error) {
        this.logger.error(`Job ${job.id} failed: ${error.message}`);
        // Check if this was the last attempt
        if (job.attemptsMade >= (job.opts.attempts || 0)) {
            this.logger.warn(`Job ${job.id} permanently failed after ${job.attemptsMade} attempts. Moving to DLQ.`);

            const { eventId } = job.data;
            const lastDelivery = await this.db.query.webhookDeliveries.findFirst({
                where: eq(schema.webhookDeliveries.webhookEventId, eventId),
                orderBy: (deliveries, { desc }) => [desc(deliveries.createdAt)],
            });

            if (lastDelivery) {
                await this.db.transaction(async (tx) => {
                    await tx.insert(schema.webhookDlq).values({
                        webhookDeliveryId: lastDelivery.webhookDeliveryId,
                        deliveryPayload: lastDelivery.deliveryPayload,
                        deliveryTimestamp: new Date(),
                        deliveryStatus: "dlq",
                        deliveryAttempts: job.attemptsMade,
                        deliveryError: { message: error.message },
                        deliveryResponse: lastDelivery.deliveryResponse,
                        deliveryResponseStatus: lastDelivery.deliveryResponseStatus,
                    });

                    await tx.update(schema.webhookDeliveries)
                        .set({ permanentlyFailedAt: new Date() })
                        .where(eq(schema.webhookDeliveries.webhookDeliveryId, lastDelivery.webhookDeliveryId));
                });
            } else {
                this.logger.warn(`[WebhookDeliveryProcessor] No delivery found for eventId: ${eventId}. Failed to move to DLQ.`);
            }
        }
    }
}
