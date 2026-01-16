import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export const clientResponseSchema = z.object({
    clientId: z.string().uuid(),
    name: z.string(),
    slugName: z.string(),
    isActive: z.boolean().nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export class ClientResponseDto extends createZodDto(clientResponseSchema) { }
