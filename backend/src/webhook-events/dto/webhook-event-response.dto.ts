import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export const webhookEventResponseSchema = z.object({
    webhookEventId: z.string().uuid(),
    webhookId: z.string().uuid(),
    topicId: z.string().uuid(),
    eventPayload: z.record(z.string(), z.any()),
    eventTimestamp: z.date().or(z.string()),
    webhookIdempotencyKey: z.string(),
    createdAt: z.date().or(z.string()),
    updatedAt: z.date().or(z.string()).optional(),
});

export class WebhookEventResponseDto extends createZodDto(webhookEventResponseSchema) { }
