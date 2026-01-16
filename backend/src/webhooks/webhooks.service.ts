import {
    ConflictException,
    Inject,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { DRIZZLE, type DbType } from "@/database/database.module";
import * as schema from "@/db/schema";
import { CreateWebhookDto } from "./dto/create-webhook.dto";
import { UpdateWebhookDto } from "./dto/update-webhook.dto";
import { ListWebhooksDto } from "./dto/list-webhooks.dto";
import { and, desc, eq, gte, lte, sql } from "drizzle-orm";

@Injectable()
export class WebhooksService {
    constructor(@Inject(DRIZZLE) private readonly db: DbType) { }

    async create(createWebhookDto: CreateWebhookDto) {
        try {
            const [webhook] = await this.db
                .insert(schema.webhooks)
                .values(createWebhookDto)
                .returning();
            return webhook;
        } catch (error: any) {
            // Postgres error code 23505 is for unique_violation
            if (error?.code === "23505") {
                throw new ConflictException(
                    "A webhook with this target URL already exists for this client.",
                );
            }
            throw error;
        }
    }

    async findAll(query: ListWebhooksDto) {
        const { page, limit, startDate, endDate, clientId, webhookId } = query;
        const offset = (page - 1) * limit;

        const filters = [];

        if (clientId) {
            filters.push(eq(schema.webhooks.clientId, clientId));
        }

        if (webhookId) {
            filters.push(eq(schema.webhooks.webhookId, webhookId));
        }

        if (startDate) {
            filters.push(gte(schema.webhooks.createdAt, new Date(startDate)));
        }

        if (endDate) {
            filters.push(lte(schema.webhooks.createdAt, new Date(endDate)));
        }

        const whereClause = filters.length > 0 ? and(...filters) : undefined;

        const [totalCount] = await this.db
            .select({ count: sql<number>`cast(count(*) as int)` })
            .from(schema.webhooks)
            .where(whereClause);

        const data = await this.db.query.webhooks.findMany({
            where: whereClause,
            limit: limit,
            offset: offset,
            orderBy: (webhooks, { desc }) => [desc(webhooks.createdAt)],
        });

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
        const webhook = await this.db.query.webhooks.findFirst({
            where: eq(schema.webhooks.webhookId, id),
        });

        if (!webhook) {
            throw new NotFoundException(`Webhook with ID ${id} not found`);
        }

        return webhook;
    }

    async update(id: string, updateWebhookDto: UpdateWebhookDto) {
        const [updatedWebhook] = await this.db
            .update(schema.webhooks)
            .set({
                ...updateWebhookDto,
                updatedAt: new Date(),
            })
            .where(eq(schema.webhooks.webhookId, id))
            .returning();

        if (!updatedWebhook) {
            throw new NotFoundException(`Webhook with ID ${id} not found`);
        }

        return updatedWebhook;
    }
}
