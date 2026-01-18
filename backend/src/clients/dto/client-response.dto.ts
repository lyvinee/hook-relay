import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export const clientResponseSchema = z.object({
    clientId: z.string().uuid().describe("Unique identifier of the client"),
    name: z.string().describe("The name of the client"),
    slugName: z.string().describe("Unique slug for the client"),
    isActive: z.boolean().nullable().describe("Whether the client is active"),
    createdAt: z.preprocess((val) => val instanceof Date ? val.toISOString() : val, z.string().datetime().nullable()).describe("Date when the client was created"),
    updatedAt: z.preprocess((val) => val instanceof Date ? val.toISOString() : val, z.string().datetime().nullable()).describe("Date when the client was last updated"),
});

export class ClientResponseDto extends createZodDto(clientResponseSchema) { }
