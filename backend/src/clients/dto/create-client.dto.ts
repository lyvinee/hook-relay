import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export const createClientSchema = z
    .object({
        name: z.string().min(1, "Name is required").max(200).describe("The name of the client"),
        slugName: z.string().min(1, "Slug name is required").max(200).describe("Unique slug for the client"),
        isActive: z.boolean().optional().default(false).describe("Whether the client is active"),
    })
    .strip();

export class CreateClientDto extends createZodDto(createClientSchema) { }
