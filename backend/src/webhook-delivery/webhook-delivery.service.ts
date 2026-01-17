import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DRIZZLE, type DbType } from '@/database/database.module';
import * as schema from '@/db/schema';
import { ListWebhookDeliveriesDto } from './dto/list-webhook-deliveries.dto';
import { and, desc, eq, gte, lte, sql } from 'drizzle-orm';

@Injectable()
export class WebhookDeliveriesService {
    constructor(@Inject(DRIZZLE) private readonly db: DbType) { }

    async findAll(query: ListWebhookDeliveriesDto) {
        const { page, limit, startDate, endDate, webhookEventId, status } = query;
        const offset = (page - 1) * limit;

        const filters = [];

        if (webhookEventId) {
            filters.push(eq(schema.webhookDeliveries.webhookEventId, webhookEventId));
        }

        if (status) {
            filters.push(eq(schema.webhookDeliveries.deliveryStatus, status));
        }

        if (startDate) {
            filters.push(gte(schema.webhookDeliveries.createdAt, new Date(startDate)));
        }

        if (endDate) {
            filters.push(lte(schema.webhookDeliveries.createdAt, new Date(endDate)));
        }

        const whereClause = filters.length > 0 ? and(...filters) : undefined;

        const [totalCount] = await this.db
            .select({ count: sql<number>`cast(count(*) as int)` })
            .from(schema.webhookDeliveries)
            .where(whereClause);

        const data = await this.db
            .select()
            .from(schema.webhookDeliveries)
            .where(whereClause)
            .limit(limit)
            .offset(offset)
            .orderBy(desc(schema.webhookDeliveries.createdAt));

        return {
            data,
            meta: {
                total: totalCount?.count ?? 0,
                page,
                limit,
                totalPages: Math.ceil((totalCount?.count ?? 0) / limit),
            },
        };
    }

    async findOne(id: string) {
        const delivery = await this.db.query.webhookDeliveries.findFirst({
            where: eq(schema.webhookDeliveries.webhookDeliveryId, id),
            with: {
                event: true,
                dlq: true,
            },
        });

        if (!delivery) {
            throw new NotFoundException(`Webhook Delivery with ID ${id} not found`);
        }

        return delivery;
    }
}
