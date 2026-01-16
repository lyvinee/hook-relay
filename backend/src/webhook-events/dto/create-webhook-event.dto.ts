import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export const createWebhookEventSchema = z.object({
    webhookId: z.string().uuid(),
    topicId: z.string().uuid(),
    eventPayload: z.record(z.string(), z.any()),
    webhookIdempotencyKey: z.string().min(1),
});

export class CreateWebhookEventDto extends createZodDto(createWebhookEventSchema) { }
