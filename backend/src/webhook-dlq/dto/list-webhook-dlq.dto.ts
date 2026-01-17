import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export const listWebhookDlqSchema = z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(10),
    startDate: z.iso.datetime().optional(),
    endDate: z.iso.datetime().optional(),
    webhookEventId: z.string().uuid().optional(),
    webhookId: z.string().uuid().optional(), // Might need join for this
});

export class ListWebhookDlqDto extends createZodDto(listWebhookDlqSchema) { }
