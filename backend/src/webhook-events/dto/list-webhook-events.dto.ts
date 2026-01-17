import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export const listWebhookEventsSchema = z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(10),
    startDate: z.iso.datetime().optional(),
    endDate: z.iso.datetime().optional(),
    clientId: z.uuid().optional(),
    webhookId: z.uuid().optional(),
});

export class ListWebhookEventsDto extends createZodDto(listWebhookEventsSchema) { }
