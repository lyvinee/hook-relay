import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export const webhookResponseSchema = z.object({
    webhookId: z.string().uuid(),
    clientId: z.string().uuid(),
    endpointName: z.string(),
    targetUrl: z.string().url(),
    hmacSecret: z.string().nullable().optional(),
    retryPolicy: z.record(z.string(), z.any()).nullable().optional(),
    timeoutMs: z.number().nullable().default(5000),
    isActive: z.boolean().default(false),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export class WebhookResponseDto extends createZodDto(webhookResponseSchema) { }
