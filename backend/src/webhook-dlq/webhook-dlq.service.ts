import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DRIZZLE, type DbType } from '@/database/database.module';
import * as schema from '@/db/schema';
import { ListWebhookDlqDto } from './dto/list-webhook-dlq.dto';
import { and, desc, eq, gte, lte, sql } from 'drizzle-orm';

@Injectable()
export class WebhookDlqService {
    constructor(@Inject(DRIZZLE) private readonly db: DbType) { }

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
}
