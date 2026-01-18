import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export const createWebhookEventSchema = z.object({
    webhookId: z.uuid().describe("ID of the webhook destination"),
    topicId: z.uuid().describe("ID of the topic"),
    eventPayload: z.record(z.string(), z.any()).describe("Payload for the event"),
    webhookIdempotencyKey: z.string().min(1).describe("Idempotency key for the event"),
});

export class CreateWebhookEventDto extends createZodDto(createWebhookEventSchema) { }
