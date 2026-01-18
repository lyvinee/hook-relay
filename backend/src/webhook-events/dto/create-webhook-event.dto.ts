import { ApiProperty } from "@nestjs/swagger";
import { IsObject, IsString, IsUUID, MinLength } from "class-validator";

export class CreateWebhookEventDto {
    @ApiProperty({ description: "ID of the webhook destination" })
    @IsUUID()
    webhookId: string;

    @ApiProperty({ description: "ID of the topic" })
    @IsUUID()
    topicId: string;

    @ApiProperty({ description: "Payload for the event" })
    @IsObject()
    eventPayload: Record<string, any>;

    @ApiProperty({ description: "Idempotency key for the event" })
    @IsString()
    @MinLength(1)
    webhookIdempotencyKey: string;
}
