import {
    Inject,
    Injectable,
    NotFoundException,
    Logger,
} from "@nestjs/common";
import { DRIZZLE, type DbType } from "@/database/database.module";
import * as schema from "@/db/schema";
import { CreateWebhookEventDto } from "./dto/create-webhook-event.dto";
import { ListWebhookEventsDto } from "./dto/list-webhook-events.dto";
import { and, desc, eq, gte, lte, sql } from "drizzle-orm";

import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class WebhookEventsService {
    private readonly logger = new Logger(WebhookEventsService.name);

    constructor(
        @Inject(DRIZZLE) private readonly db: DbType,
        @InjectQueue('webhook-delivery') private readonly deliveryQueue: Queue
    ) { }

    async create(createWebhookEventDto: CreateWebhookEventDto) {
        try {
            const [event] = await this.db
                .insert(schema.webhookEvents)
                .values({
                    ...createWebhookEventDto,
                    eventTimestamp: new Date(),
                })
                .returning();

            this.logger.log(`Job placed for sending: ${event.webhookEventId}`);

            const webhook = await this.db.query.webhooks.findFirst({
                where: eq(schema.webhooks.webhookId, event.webhookId)
            });

            const retryPolicy = webhook?.retryPolicy as any || {};

            await this.deliveryQueue.add('deliver-webhook', { eventId: event.webhookEventId }, {
                attempts: retryPolicy.maxRetries || 3,
                backoff: {
                    type: 'exponential',
                    delay: retryPolicy.initialDelayMs || 1000,
                },
                removeOnComplete: true, // Optional: keep queue clean
                removeOnFail: false // Keep failed jobs for inspection
            });

            return event;
        } catch (error: any) {
            // Postgres error code 23505 is for unique_violation
            if (error?.code === "23505") {
                // Idempotency: If duplicate key, return the existing event
                const existingEvent = await this.db.query.webhookEvents.findFirst({
                    where: eq(schema.webhookEvents.webhookIdempotencyKey, createWebhookEventDto.webhookIdempotencyKey)
                });

                if (existingEvent) {
                    return existingEvent;
                }
            }
            throw error;
        }
    }

    // Redoing findAll to be more robust
    async findAllRefined(query: ListWebhookEventsDto) {
        const { page, limit, startDate, endDate, clientId, webhookId } = query;
        const offset = (page - 1) * limit;

        const filters = [];

        if (webhookId) filters.push(eq(schema.webhookEvents.webhookId, webhookId));
        if (startDate) filters.push(gte(schema.webhookEvents.createdAt, new Date(startDate)));
        if (endDate) filters.push(lte(schema.webhookEvents.createdAt, new Date(endDate)));

        let baseWhere = filters.length > 0 ? and(...filters) : undefined;

        // If clientId provided, we filter by it.
        if (clientId) {
            // We must join.
            const result = await this.db.select({
                event: schema.webhookEvents
            })
                .from(schema.webhookEvents)
                .innerJoin(schema.webhooks, eq(schema.webhookEvents.webhookId, schema.webhooks.webhookId))
                .where(and(baseWhere, eq(schema.webhooks.clientId, clientId)))
                .limit(limit)
                .offset(offset)
                .orderBy(desc(schema.webhookEvents.createdAt));

            const [countRes] = await this.db.select({ count: sql<number>`cast(count(*) as int)` })
                .from(schema.webhookEvents)
                .innerJoin(schema.webhooks, eq(schema.webhookEvents.webhookId, schema.webhooks.webhookId))
                .where(and(baseWhere, eq(schema.webhooks.clientId, clientId)));

            return {
                data: result.map(r => r.event),
                meta: {
                    total: countRes?.count ?? 0,
                    page,
                    limit,
                    totalPages: Math.ceil((countRes?.count ?? 0) / limit),
                }
            };
        } else {
            // No join needed
            const result = await this.db.select()
                .from(schema.webhookEvents)
                .where(baseWhere)
                .limit(limit)
                .offset(offset)
                .orderBy(desc(schema.webhookEvents.createdAt));

            const [countRes] = await this.db.select({ count: sql<number>`cast(count(*) as int)` })
                .from(schema.webhookEvents)
                .where(baseWhere);

            return {
                data: result,
                meta: {
                    total: countRes?.count ?? 0,
                    page,
                    limit,
                    totalPages: Math.ceil((countRes?.count ?? 0) / limit),
                }
            };
        }
    }

    async findOne(id: string) {
        const event = await this.db.query.webhookEvents.findFirst({
            where: eq(schema.webhookEvents.webhookEventId, id),
        });

        if (!event) {
            throw new NotFoundException(`Webhook Event with ID ${id} not found`);
        }

        return event;
    }
}
