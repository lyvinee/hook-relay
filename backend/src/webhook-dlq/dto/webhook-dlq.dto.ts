import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsInt, IsJSON, IsOptional, IsString, IsUUID } from "class-validator";

export class WebhookDlqDto {
    @ApiProperty()
    @IsUUID()
    webhookDlqId: string;

    @ApiProperty()
    @IsUUID()
    webhookDeliveryId: string;

    @ApiProperty()
    @IsJSON()
    deliveryPayload: any;

    @ApiProperty()
    @IsDateString()
    deliveryTimestamp: Date;

    @ApiProperty()
    @IsString()
    deliveryStatus: string;

    @ApiProperty()
    @IsInt()
    deliveryAttempts: number;

    @ApiProperty({ required: false })
    @IsDateString()
    @IsOptional()
    deliveryRetryAfter?: Date | null;

    @ApiProperty({ required: false })
    @IsJSON()
    @IsOptional()
    deliveryError?: any;

    @ApiProperty({ required: false })
    @IsJSON()
    @IsOptional()
    deliveryResponse?: any;

    @ApiProperty()
    @IsInt()
    deliveryResponseStatus: number;

    @ApiProperty()
    @IsDateString()
    createdAt: Date;

    @ApiProperty()
    @IsDateString()
    updatedAt: Date;

    // Enriched properties from service
    @ApiProperty({ description: "Associated Webhook Event ID" })
    @IsUUID()
    eventId: string;

    @ApiProperty({ description: "Associated Webhook ID" })
    @IsUUID()
    webhookId: string;
}
