import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export const createWebhookEventSchema = z.object({
    webhookId: z.uuid(),
    topicId: z.uuid(),
    eventPayload: z.record(z.string(), z.any()),
    webhookIdempotencyKey: z.string().min(1),
});

export class CreateWebhookEventDto extends createZodDto(createWebhookEventSchema) { }
