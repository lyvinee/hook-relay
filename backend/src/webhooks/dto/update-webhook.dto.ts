import { createZodDto } from "nestjs-zod";
import { createWebhookSchema } from "./create-webhook.dto";

export const updateWebhookSchema = createWebhookSchema
    .partial()
    .strip();

export class UpdateWebhookDto extends createZodDto(updateWebhookSchema) { }
