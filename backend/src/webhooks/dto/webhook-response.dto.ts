import { ApiProperty } from "@nestjs/swagger";

export class WebhookResponseDto {
    @ApiProperty({ description: "Unique identifier for the webhook" })
    webhookId: string;

    @ApiProperty({ description: "ID of the client owning this webhook" })
    clientId: string;

    @ApiProperty({ description: "Descriptive name for the endpoint" })
    endpointName: string;

    @ApiProperty({ description: "The URL to send the webhook payload to" })
    targetUrl: string;

    @ApiProperty({ description: "Secret for HMAC signature verification", required: false, nullable: true })
    hmacSecret?: string | null;

    @ApiProperty({ description: "Retry policy configuration", required: false, nullable: true })
    retryPolicy?: any;

    @ApiProperty({ description: "Request timeout in milliseconds", default: 5000, nullable: true })
    timeoutMs?: number | null;

    @ApiProperty({ description: "Whether the webhook is active", default: false, nullable: true })
    isActive?: boolean | null;

    @ApiProperty({ description: "Creation timestamp" })
    createdAt: string;

    @ApiProperty({ description: "Last update timestamp" })
    updatedAt: string;
}
