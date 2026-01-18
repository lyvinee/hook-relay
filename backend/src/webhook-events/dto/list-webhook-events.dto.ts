import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsInt, IsOptional, IsUUID, Max, Min } from "class-validator";
import { Type } from "class-transformer";

export class ListWebhookEventsDto {
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

    @ApiProperty({ description: "Filter by client ID", required: false })
    @IsUUID()
    @IsOptional()
    clientId?: string;

    @ApiProperty({ description: "Filter by webhook ID", required: false })
    @IsUUID()
    @IsOptional()
    webhookId?: string;
}
