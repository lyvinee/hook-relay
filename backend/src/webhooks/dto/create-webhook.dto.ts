import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsInt, IsObject, IsOptional, IsPositive, IsString, IsUrl, IsUUID, MaxLength, MinLength } from "class-validator";
import { Type } from "class-transformer";

export class CreateWebhookDto {
    @ApiProperty({ description: "The ID of the client owning this webhook" })
    @IsUUID()
    clientId: string;

    @ApiProperty({ description: "A descriptive name for the endpoint (e.g. 'Order Created')" })
    @IsString()
    @MinLength(1, { message: "Endpoint name is required" })
    @MaxLength(200)
    endpointName: string;

    @ApiProperty({ description: "The URL to send the webhook payload to" })
    @IsUrl({}, { message: "Invalid target URL" })
    @MaxLength(200)
    targetUrl: string;

    @ApiProperty({ description: "Secret for HMAC signature verification", required: false })
    @IsString()
    @MaxLength(200)
    @IsOptional()
    hmacSecret?: string;

    @ApiProperty({ description: "Retry policy configuration", required: false })
    @IsObject()
    @IsOptional()
    retryPolicy?: Record<string, any>;

    @ApiProperty({ description: "Request timeout in milliseconds", default: 5000 })
    @IsInt()
    @IsPositive()
    @Type(() => Number)
    @IsOptional()
    timeoutMs: number = 5000;

    @ApiProperty({ description: "Whether the webhook is active", default: true })
    @IsBoolean()
    @IsOptional()
    isActive: boolean = true;
}
