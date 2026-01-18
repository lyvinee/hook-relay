import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export const replayWebhookDlqSchema = z.object({
    initiatorId: z.string().uuid().optional().describe("ID of the user initiating the replay"),
    initiatorType: z.enum(['system', 'user']).default('user').optional().describe("Type of initiator (system or user)"),
});

export class ReplayWebhookDlqDto extends createZodDto(replayWebhookDlqSchema) { }
