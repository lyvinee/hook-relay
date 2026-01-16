import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { DRIZZLE, type DbType } from "@/database/database.module";
import * as schema from "@/db/schema";
import { CreateClientDto } from "./dto/create-client.dto";
import { UpdateClientDto } from "./dto/update-client.dto";
import { eq, sql } from "drizzle-orm";
import { ListClientsDto } from "./dto/list-clients.dto";

@Injectable()
export class ClientsService {
    constructor(@Inject(DRIZZLE) private readonly db: DbType) { }

    async create(createClientDto: CreateClientDto) {
        const [client] = await this.db
            .insert(schema.clients)
            .values(createClientDto)
            .returning();
        return client;
    }

    async findAll(query: ListClientsDto) {
        const { page, limit } = query;
        const offset = (page - 1) * limit;

        const [totalCount] = await this.db
            .select({ count: sql<number>`cast(count(*) as int)` })
            .from(schema.clients);

        const data = await this.db.query.clients.findMany({
            limit: limit,
            offset: offset,
            orderBy: (clients, { desc }) => [desc(clients.createdAt)],
        });

        return {
            data,
            meta: {
                total: totalCount.count,
                page,
                limit,
                totalPages: Math.ceil(totalCount.count / limit),
            },
        };
    }

    async findOne(id: string) {
        const client = await this.db.query.clients.findFirst({
            where: eq(schema.clients.clientId, id),
        });

        if (!client) {
            throw new NotFoundException(`Client with ID ${id} not found`);
        }

        return client;
    }

    async update(id: string, updateClientDto: UpdateClientDto) {
        const [updatedClient] = await this.db
            .update(schema.clients)
            .set({
                ...updateClientDto,
                updatedAt: new Date(),
            })
            .where(eq(schema.clients.clientId, id))
            .returning();

        if (!updatedClient) {
            throw new NotFoundException(`Client with ID ${id} not found`);
        }

        return updatedClient;
    }
}
