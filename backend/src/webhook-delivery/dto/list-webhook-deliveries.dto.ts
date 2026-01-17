import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export const listWebhookDeliveriesSchema = z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(10),
    startDate: z.iso.datetime().optional(),
    endDate: z.iso.datetime().optional(),
    webhookEventId: z.uuid().optional(),
    status: z.enum(["pending", "success", "failed", "dlq"]).optional(),
});

export class ListWebhookDeliveriesDto extends createZodDto(listWebhookDeliveriesSchema) { }
