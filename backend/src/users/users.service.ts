import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { DRIZZLE, type DbType } from "@/database/database.module";
import * as schema from "@/db/schema";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { ListUsersDto } from "./dto/list-users.dto";
import { eq, sql, and, like } from "drizzle-orm";

@Injectable()
export class UsersService {
    constructor(@Inject(DRIZZLE) private readonly db: DbType) { }

    async create(createUserDto: CreateUserDto) {
        const [user] = await this.db
            .insert(schema.users)
            .values({
                ...createUserDto,
                status: createUserDto.status || "active",
            })
            .returning();
        return user;
    }

    async findAll(query: ListUsersDto) {
        const { page, limit, email, role, status } = query;
        const offset = (page - 1) * limit;

        const whereConditions = [];

        if (email) {
            whereConditions.push(like(schema.users.email, `%${email}%`));
        }

        if (role) {
            whereConditions.push(eq(schema.users.role, role));
        }

        if (status) {
            whereConditions.push(eq(schema.users.status, status));
        }

        const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

        const [totalCount] = await this.db
            .select({ count: sql<number>`cast(count(*) as int)` })
            .from(schema.users)
            .where(whereClause);

        const data = await this.db.query.users.findMany({
            where: whereClause,
            limit: limit,
            offset: offset,
            orderBy: (users, { desc }) => [desc(users.createdAt)],
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
        const user = await this.db.query.users.findFirst({
            where: eq(schema.users.userId, id),
        });

        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        return user;
    }

    async update(id: string, updateUserDto: UpdateUserDto) {
        const [updatedUser] = await this.db
            .update(schema.users)
            .set({
                ...updateUserDto,
                updatedAt: new Date(),
            })
            .where(eq(schema.users.userId, id))
            .returning();

        if (!updatedUser) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        return updatedUser;
    }

    async updateStatus(id: string, status: typeof schema.userStatus.enumValues[number]) {
        const [updatedUser] = await this.db
            .update(schema.users)
            .set({
                status,
                updatedAt: new Date(),
            })
            .where(eq(schema.users.userId, id))
            .returning();

        if (!updatedUser) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        return updatedUser;
    }
}
