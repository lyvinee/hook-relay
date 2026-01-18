import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsInt, IsOptional, IsUUID, Max, Min } from "class-validator";
import { Type } from "class-transformer";

export class ListWebhooksDto {
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

    @ApiProperty({ description: "Filter by creation date (start)", required: false })
    @IsDateString()
    @IsOptional()
    startDate?: string;

    @ApiProperty({ description: "Filter by creation date (end)", required: false })
    @IsDateString()
    @IsOptional()
    endDate?: string;

    @ApiProperty({ description: "Filter by Client ID", required: false })
    @IsUUID()
    @IsOptional()
    clientId?: string;

    @ApiProperty({ description: "Filter by Webhook ID", required: false })
    @IsUUID()
    @IsOptional()
    webhookId?: string;
}
