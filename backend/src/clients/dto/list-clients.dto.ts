import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export const listClientsSchema = z
    .object({
        page: z.coerce.number().min(1).default(1),
        limit: z.coerce.number().min(1).max(100).default(10),
    })
    .strip();

export class ListClientsDto extends createZodDto(listClientsSchema) { }
