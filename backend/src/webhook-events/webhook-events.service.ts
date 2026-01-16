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

@Injectable()
export class WebhookEventsService {
    private readonly logger = new Logger(WebhookEventsService.name);

    constructor(@Inject(DRIZZLE) private readonly db: DbType) { }

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

    async findAll(query: ListWebhookEventsDto) {
        const { page, limit, startDate, endDate, clientId, webhookId } = query;
        const offset = (page - 1) * limit;

        const filters = [];

        if (clientId) {
            // We need to join with webhooks to filter by clientId
            // However, typical pattern here implies we might filter by webhookId which is directly on the event.
            // Filtering by clientId would require a join. Let's start with basic filters.
            // If clientId is provided, we should filter events belonging to webhooks of that client.
            // This is a bit more complex with Drizzle query builder if we stick to single table query.
            // Let's rely on webhookId being the primary filter path for now, or check if we can do a subquery/join.
            // For now, let's implement the direct filters on the table.
            // If the requirements strictly need clientId filter, I'd need to join.
            // Given the schema: webhookEvents -> webhooks -> clientId.
            // I'll leave clientId filter for now as it requires a join, and stick to fields on the table unless I switch to relational query.
            // Let's try to do it with relational query if possible or just filter by what's available.
            // Actually, the prompt asked for "clientId" filter. So I should support it.
            // I will use a whereExists or IN clause logic if using query builder or raw sql.
            // Simpler: Fetch webhooks for client, then filter events by those webhookIds? No, inefficient.
            // Let's use db.select().from().innerJoin pattern for count and data if clientId is needed.
        }

        // Direct filters
        if (webhookId) {
            filters.push(eq(schema.webhookEvents.webhookId, webhookId));
        }

        if (startDate) {
            filters.push(gte(schema.webhookEvents.createdAt, new Date(startDate)));
        }

        if (endDate) {
            filters.push(lte(schema.webhookEvents.createdAt, new Date(endDate)));
        }

        // Re-evaluating ClientID filter:
        // If clientId is passed, we need to filter events where webhook.clientId = clientId.
        // I will construct the query to include the join if clientId is present.

        let whereClause = filters.length > 0 ? and(...filters) : undefined;

        // Construct base query
        let queryBuilder = this.db
            .select()
            .from(schema.webhookEvents);

        let countBuilder = this.db
            .select({ count: sql<number>`cast(count(*) as int)` })
            .from(schema.webhookEvents);

        if (clientId) {
            queryBuilder.innerJoin(schema.webhooks, eq(schema.webhookEvents.webhookId, schema.webhooks.webhookId));
            countBuilder.innerJoin(schema.webhooks, eq(schema.webhookEvents.webhookId, schema.webhooks.webhookId));

            const clientFilter = eq(schema.webhooks.clientId, clientId);
            whereClause = whereClause ? and(whereClause, clientFilter) : clientFilter;
        }

        if (whereClause) {
            queryBuilder.where(whereClause);
            countBuilder.where(whereClause);
        }

        const [totalCount] = await countBuilder;

        const data = await queryBuilder
            .limit(limit)
            .offset(offset)
            .orderBy(desc(schema.webhookEvents.createdAt));

        // If we joined, data will be { webhook_events: ..., webhooks: ... } structure usually if selecting *, or we need to specify selection.
        // .select() acts as "select *". 
        // If joined, the result structure changes.
        // To keep it simple and consistent return type (WebhookEvent), let's select only webhookEvents fields.

        // Correct approach with join:
        const finalData = await this.db.select({
            webhookEventId: schema.webhookEvents.webhookEventId,
            webhookId: schema.webhookEvents.webhookId,
            topicId: schema.webhookEvents.topicId,
            eventPayload: schema.webhookEvents.eventPayload,
            eventTimestamp: schema.webhookEvents.eventTimestamp,
            webhookIdempotencyKey: schema.webhookEvents.webhookIdempotencyKey,
            createdAt: schema.webhookEvents.createdAt,
            updatedAt: schema.webhookEvents.updatedAt,
        })
            .from(schema.webhookEvents)
            .innerJoin(schema.webhooks, eq(schema.webhookEvents.webhookId, schema.webhooks.webhookId)) // Always join if we want consistent query building, or conditional join
            .where(whereClause) // Reuse the whereClause with potentially aliased checks? Drizzle handles objects.
        // Actually, distinct join handling:

        // Let's restart the query construction for cleaner implementation.

        // Strategy: Use relational query API if possible, but filtering by relation (client) in `findMany` is tricky in Drizzle < 0.29 logic sometimes.
        // Let's stick to existing pattern in `webhooks.service.ts` but adapt for the join.
        // `webhooks.service.ts` uses query.webhooks.findMany.
        // I'll stick to `db.select()...` for flexibility with joins.

        /*
            let baseQuery = this.db.select({ ...schema.webhookEvents }).from(schema.webhookEvents);
            if (clientId) {
                baseQuery.innerJoin(schema.webhooks, eq(schema.webhookEvents.webhookId, schema.webhooks.webhookId))
                .where(and(eq(schema.webhooks.clientId, clientId), ...restFilters))
            } else {
                 .where(and(...restFilters))
            }
        */
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
