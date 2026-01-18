import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export const webhookEventResponseSchema = z.object({
    webhookEventId: z.string().uuid().describe("Unique identifier for the webhook event"),
    webhookId: z.string().uuid().describe("ID of the webhook destination"),
    topicId: z.string().uuid().describe("ID of the topic"),
    eventPayload: z.any().describe("Payload of the event"),
    eventTimestamp: z.preprocess((val) => val instanceof Date ? val.toISOString() : val, z.string().datetime()).describe("Timestamp when the event occurred"),
    webhookIdempotencyKey: z.string().describe("Idempotency key"),
    createdAt: z.preprocess((val) => val instanceof Date ? val.toISOString() : val, z.string().datetime().nullable()).describe("Creation timestamp"),
    updatedAt: z.preprocess((val) => val instanceof Date ? val.toISOString() : val, z.string().datetime().nullable().optional()).describe("Last update timestamp"),
});

export class WebhookEventResponseDto extends createZodDto(webhookEventResponseSchema) { }
