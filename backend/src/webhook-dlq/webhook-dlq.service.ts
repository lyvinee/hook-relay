import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DRIZZLE, type DbType } from '@/database/database.module';
import * as schema from '@/db/schema';
import { ListWebhookDlqDto } from './dto/list-webhook-dlq.dto';
import { and, desc, eq, gte, lte, sql } from 'drizzle-orm';

import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class WebhookDlqService {
    constructor(
        @Inject(DRIZZLE) private readonly db: DbType,
        @InjectQueue('webhook-delivery') private readonly deliveryQueue: Queue
    ) { }

    async findAll(query: ListWebhookDlqDto) {
        const { page, limit, startDate, endDate, webhookEventId, webhookId } = query;
        const offset = (page - 1) * limit;

        const filters = [];

        if (webhookEventId) {
            // Need to join through webhookDeliveries probably, as dlq references delivery
            // schema.webhookDlq -> webhookDeliveryId -> webhookDeliveries -> webhookEventId
            // This makes filtering by eventId a bit complex without joining.
            // Actually, schema.webhookDlq DOES NOT have webhookEventId directly.
            // It has webhookDeliveryId.
            // So we need to join webhookDeliveries to filter by webhookEventId.
        }

        // Let's support the basic filters first that are on the table or easy to join.
        // webhookDlq has: webhookDlqId, webhookDeliveryId, deliveryPayload, etc.

        let baseWhere = undefined;

        // To filter by proper event/webhook ID we definitely need joins.
        // For simplicity of this iteration, let's filter by time.
        if (startDate) {
            filters.push(gte(schema.webhookDlq.createdAt, new Date(startDate)));
        }

        if (endDate) {
            filters.push(lte(schema.webhookDlq.createdAt, new Date(endDate)));
        }

        // Construct query with joins if needed
        const queryBuilder = this.db.select({
            dlq: schema.webhookDlq,
            delivery: schema.webhookDeliveries,
            event: schema.webhookEvents,
        }).from(schema.webhookDlq)
            .innerJoin(schema.webhookDeliveries, eq(schema.webhookDlq.webhookDeliveryId, schema.webhookDeliveries.webhookDeliveryId))
            .innerJoin(schema.webhookEvents, eq(schema.webhookDeliveries.webhookEventId, schema.webhookEvents.webhookEventId));

        if (webhookId) {
            filters.push(eq(schema.webhookEvents.webhookId, webhookId));
        }

        if (webhookEventId) {
            filters.push(eq(schema.webhookEvents.webhookEventId, webhookEventId));
        }

        if (filters.length > 0) {
            queryBuilder.where(and(...filters));
        }

        // Count query
        // This is getting complex for a count. Let's simplify.
        // If no complex filters, just count table.
        // If complex filters, we need the joins.

        const countQueryBuilder = this.db.select({ count: sql<number>`cast(count(*) as int)` })
            .from(schema.webhookDlq)
            .innerJoin(schema.webhookDeliveries, eq(schema.webhookDlq.webhookDeliveryId, schema.webhookDeliveries.webhookDeliveryId))
            .innerJoin(schema.webhookEvents, eq(schema.webhookDeliveries.webhookEventId, schema.webhookEvents.webhookEventId));

        if (filters.length > 0) {
            countQueryBuilder.where(and(...filters));
        }

        const [totalCount] = await countQueryBuilder;

        const data = await queryBuilder
            .limit(limit)
            .offset(offset)
            .orderBy(desc(schema.webhookDlq.createdAt));

        return {
            data: data.map(d => ({
                ...d.dlq,
                eventId: d.event.webhookEventId, // Enrich with useful info
                webhookId: d.event.webhookId
            })),
            meta: {
                total: totalCount?.count ?? 0,
                page,
                limit,
                totalPages: Math.ceil((totalCount?.count ?? 0) / limit),
            },
        };
    }

    async findOne(id: string) {
        const entry = await this.db.query.webhookDlq.findFirst({
            where: eq(schema.webhookDlq.webhookDlqId, id),
            with: {
                delivery: {
                    with: {
                        event: true
                    }
                }
            },
        });

        if (!entry) {
            throw new NotFoundException(`DLQ Entry with ID ${id} not found`);
        }

        return entry;
    }

    async replay(id: string, dto: import('./dto/replay-webhook-dlq.dto').ReplayWebhookDlqDto) {
        const dlqEntry = await this.findOne(id);
        const eventId = dlqEntry.delivery.webhookEventId;

        // Check if there is already a pending or success delivery
        // We only want to prevent retry if it is currently pending or recently succeeded to avoid race conditions/spam
        const existingDelivery = await this.db.query.webhookDeliveries.findFirst({
            where: and(
                eq(schema.webhookDeliveries.webhookEventId, eventId),
                // Check for pending OR success
                // specific logic: "trigger can only be initiated when there is no pending or succeeded deliveries"
                // If succeeded, we should arguably just return "Already succeeded"
                // Checking for BOTH pending and success as blocking conditions
            ),
            orderBy: (deliveries, { desc }) => [desc(deliveries.createdAt)],
        });

        if (existingDelivery) {
            if (existingDelivery.deliveryStatus === 'pending') {
                throw new Error('A delivery is already in progress for this event.');
            }
            if (existingDelivery.deliveryStatus === 'success') {
                // If success, just return that it is success.
                return { status: 'Delivery already succeeded', deliveryId: existingDelivery.webhookDeliveryId };
            }
        }

        // Add to queue
        await this.deliveryQueue.add('deliver', {
            eventId,
            initiator: {
                type: dto.initiatorType || 'user',
                id: dto.initiatorId,
            }
        }, {
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 1000,
            },
        });

        return { status: 'Replay initiated' };
    }
}
