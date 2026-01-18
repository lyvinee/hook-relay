import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export const webhookResponseSchema = z.object({
    webhookId: z.string().uuid().describe("Unique identifier for the webhook"),
    clientId: z.string().uuid().describe("ID of the client owning this webhook"),
    endpointName: z.string().describe("Descriptive name for the endpoint"),
    targetUrl: z.string().url().describe("The URL to send the webhook payload to"),
    hmacSecret: z.string().nullable().optional().describe("Secret for HMAC signature verification"),
    retryPolicy: z.any().nullable().optional().describe("Retry policy configuration"),
    timeoutMs: z.number().nullable().default(5000).describe("Request timeout in milliseconds"),
    isActive: z.boolean().nullable().default(false).describe("Whether the webhook is active"),
    createdAt: z.preprocess((val) => val instanceof Date ? val.toISOString() : val, z.string().datetime().nullable()).describe("Creation timestamp"),
    updatedAt: z.preprocess((val) => val instanceof Date ? val.toISOString() : val, z.string().datetime().nullable()).describe("Last update timestamp"),
});

export class WebhookResponseDto extends createZodDto(webhookResponseSchema) { }
