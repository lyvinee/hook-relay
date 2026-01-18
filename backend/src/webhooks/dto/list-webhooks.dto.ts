import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export const listWebhooksSchema = z.object({
    page: z.coerce.number().min(1).default(1).describe("Page number"),
    limit: z.coerce.number().min(1).max(100).default(10).describe("Items per page"),
    startDate: z.string().datetime().optional().describe("Filter by creation date (start)"),
    endDate: z.string().datetime().optional().describe("Filter by creation date (end)"),
    clientId: z.string().uuid().optional().describe("Filter by Client ID"),
    webhookId: z.string().uuid().optional().describe("Filter by Webhook ID"),
});

export class ListWebhooksDto extends createZodDto(listWebhooksSchema) { }
