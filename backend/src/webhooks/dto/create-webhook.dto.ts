import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export const createWebhookSchema = z
    .object({
        clientId: z.string().uuid().describe("The ID of the client owning this webhook"),
        endpointName: z.string().min(1, "Endpoint name is required").max(200).describe("A descriptive name for the endpoint (e.g. 'Order Created')"),
        targetUrl: z.string().url("Invalid target URL").max(200).describe("The URL to send the webhook payload to"),
        hmacSecret: z.string().max(200).optional().describe("Secret for HMAC signature verification"),
        retryPolicy: z.record(z.string(), z.any()).optional().describe("Retry policy configuration"),
        timeoutMs: z.number().int().positive().default(5000).describe("Request timeout in milliseconds"),
        isActive: z.boolean().default(true).describe("Whether the webhook is active"),
    })
    .strip();

export class CreateWebhookDto extends createZodDto(createWebhookSchema) { }
