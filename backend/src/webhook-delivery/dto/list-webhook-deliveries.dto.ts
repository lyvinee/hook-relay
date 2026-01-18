import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export const listWebhookDeliveriesSchema = z.object({
    page: z.coerce.number().min(1).default(1).describe("Page number"),
    limit: z.coerce.number().min(1).max(100).default(10).describe("Items per page"),
    startDate: z.iso.datetime().optional().describe("Filter by start date (ISO 8601)"),
    endDate: z.iso.datetime().optional().describe("Filter by end date (ISO 8601)"),
    webhookEventId: z.uuid().optional().describe("Filter by specific webhook event ID"),
    status: z.enum(["pending", "success", "failed", "dlq"]).optional().describe("Filter by delivery status"),
});

export class ListWebhookDeliveriesDto extends createZodDto(listWebhookDeliveriesSchema) { }
