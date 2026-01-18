import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export const listClientsSchema = z
    .object({
        page: z.coerce.number().min(1).default(1).describe("Page number for pagination"),
        limit: z.coerce.number().min(1).max(100).default(10).describe("Number of items per page"),
    })
    .strip();

export class ListClientsDto extends createZodDto(listClientsSchema) { }
