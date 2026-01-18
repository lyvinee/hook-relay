import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsEnum, IsInt, IsOptional, IsUUID, Max, Min } from "class-validator";
import { Type } from "class-transformer";

export class ListWebhookDeliveriesDto {
    @ApiProperty({ description: "Page number", default: 1, required: false })
    @IsInt()
    @Min(1)
    @Type(() => Number)
    @IsOptional()
    page: number = 1;

    @ApiProperty({ description: "Items per page", default: 10, required: false })
    @IsInt()
    @Min(1)
    @Max(100)
    @Type(() => Number)
    @IsOptional()
    limit: number = 10;

    @ApiProperty({ description: "Filter by start date (ISO 8601)", required: false })
    @IsDateString()
    @IsOptional()
    startDate?: string;

    @ApiProperty({ description: "Filter by end date (ISO 8601)", required: false })
    @IsDateString()
    @IsOptional()
    endDate?: string;

    @ApiProperty({ description: "Filter by specific webhook event ID", required: false })
    @IsUUID()
    @IsOptional()
    webhookEventId?: string;

    @ApiProperty({ description: "Filter by delivery status", enum: ["pending", "success", "failed", "dlq"], required: false })
    @IsEnum(["pending", "success", "failed", "dlq"])
    @IsOptional()
    status?: "pending" | "success" | "failed" | "dlq";
}
