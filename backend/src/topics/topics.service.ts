import { Inject, Injectable } from "@nestjs/common";
import { DRIZZLE, type DbType } from "../database/database.module";
import { topics } from "../db/schema";
import { eq, sql } from "drizzle-orm";

import { CreateTopicDto } from "./dto/create-topic.dto";
import { UpdateTopicDto } from "./dto/update-topic.dto";
import { ListTopicsDto } from "./dto/list-topics.dto";

@Injectable()
export class TopicsService {
    constructor(
        @Inject(DRIZZLE)
        private readonly db: DbType,
    ) { }

    async create(createTopicDto: CreateTopicDto) {
        const [topic] = await this.db.insert(topics).values(createTopicDto).returning();
        return topic;
    }

    async findAll(query: ListTopicsDto) {
        const { page = 1, limit = 10 } = query;
        const offset = (page - 1) * limit;

        const [countResult] = await this.db
            .select({ count: sql`count(*)` })
            .from(topics)
            .where(eq(topics.isActive, true));

        const totalItems = Number(countResult.count);
        const totalPages = Math.ceil(totalItems / limit);

        const data = await this.db
            .select()
            .from(topics)
            .where(eq(topics.isActive, true))
            .limit(limit)
            .offset(offset)
            .orderBy(topics.createdAt);

        return {
            data,
            meta: {
                totalItems,
                itemCount: data.length,
                itemsPerPage: limit,
                totalPages,
                currentPage: page,
            },
        };
    }

    async findOne(id: string) {
        const [topic] = await this.db.select().from(topics).where(eq(topics.topicId, id));
        return topic;
    }

    async update(id: string, updateTopicDto: UpdateTopicDto) {
        const [topic] = await this.db
            .update(topics)
            .set(updateTopicDto)
            .where(eq(topics.topicId, id))
            .returning();
        return topic;
    }

    async remove(id: string) {
        // Soft delete implementation
        const [topic] = await this.db
            .update(topics)
            .set({ isActive: false })
            .where(eq(topics.topicId, id))
            .returning();
        return topic;
    }
}
