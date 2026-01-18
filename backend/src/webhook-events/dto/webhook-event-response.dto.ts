import { ApiProperty } from "@nestjs/swagger";

export class WebhookEventResponseDto {
    @ApiProperty({ description: "Unique identifier for the webhook event" })
    webhookEventId: string;

    @ApiProperty({ description: "ID of the webhook destination" })
    webhookId: string;

    @ApiProperty({ description: "ID of the topic" })
    topicId: string;

    @ApiProperty({ description: "Payload of the event" })
    eventPayload: Record<string, any>;

    @ApiProperty({ description: "Timestamp when the event occurred" })
    eventTimestamp: string;

    @ApiProperty({ description: "Idempotency key" })
    webhookIdempotencyKey: string;

    @ApiProperty({ description: "Creation timestamp" })
    createdAt: string;

    @ApiProperty({ description: "Last update timestamp", required: false, nullable: true })
    updatedAt?: string | null;
}
