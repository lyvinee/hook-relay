import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export const createClientSchema = z
    .object({
        name: z.string().min(1, "Name is required").max(200),
        slugName: z.string().min(1, "Slug name is required").max(200),
        isActive: z.boolean().optional().default(false),
    })
    .strip();

export class CreateClientDto extends createZodDto(createClientSchema) { }
