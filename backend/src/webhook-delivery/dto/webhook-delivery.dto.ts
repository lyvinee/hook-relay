import { ApiProperty } from "@nestjs/swagger";

export class WebhookDeliveryDto {
    @ApiProperty({ description: "Unique identifier for the webhook delivery" })
    webhookDeliveryId: string;

    @ApiProperty({ description: "ID of the associated webhook event" })
    webhookEventId: string;

    @ApiProperty({ description: "ID of the destination webhook" })
    webhookId: string;

    @ApiProperty({ description: "Delivery status", enum: ["pending", "success", "failed", "dlq"] })
    deliveryStatus: "pending" | "success" | "failed" | "dlq";

    @ApiProperty({ description: "HTTP status code of the response", nullable: true })
    statusCode?: number | null;

    @ApiProperty({ description: "Time taken for the request in milliseconds", nullable: true })
    duration?: number | null;

    @ApiProperty({ description: "Request payload sent", nullable: true })
    requestPayload?: any;

    @ApiProperty({ description: "Request headers sent", nullable: true })
    requestHeaders?: any;

    @ApiProperty({ description: "Response body received", nullable: true })
    responseBody?: any;

    @ApiProperty({ description: "Response headers received", nullable: true })
    responseHeaders?: any;

    @ApiProperty({ description: "Error message if any", nullable: true })
    errorMessage?: string | null;

    @ApiProperty({ description: "Next scheduled retry time", nullable: true })
    nextRetryAt?: Date | null;

    @ApiProperty({ description: "Creation timestamp" })
    createdAt: Date;

    @ApiProperty({ description: "Last update timestamp" })
    updatedAt: Date;
}
