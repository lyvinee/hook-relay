import { ApiProperty } from "@nestjs/swagger";
import { PaginationMetaDto } from "@/clients/dto/client-response.dto";

export class WebhookCreatedDto {
  @ApiProperty({ description: "Unique identifier for the webhook" })
  webhookId: string;

  @ApiProperty({ description: "Secret for HMAC signature verification" })
  hmacSecret: string;
}

export class WebhookDto {
  @ApiProperty({ description: "Unique identifier for the webhook" })
  webhookId: string;

  @ApiProperty({ description: "The ID of the client owning this webhook" })
  clientId: string;

  @ApiProperty({ description: "A descriptive name for the endpoint" })
  endpointName: string;

  @ApiProperty({ description: "The URL to send the webhook payload to" })
  targetUrl: string;

  @ApiProperty({ description: "Retry policy configuration", required: false, nullable: true })
  retryPolicy?: Record<string, any> | null;

  @ApiProperty({ description: "Request timeout in milliseconds" })
  timeoutMs: number;

  @ApiProperty({ description: "Whether the webhook is active", nullable: true })
  isActive?: boolean | null;

  @ApiProperty({ description: "Date when the webhook was created", nullable: true, type: String, format: 'date-time' })
  createdAt?: string | null;

  @ApiProperty({ description: "Date when the webhook was last updated", nullable: true, type: String, format: 'date-time' })
  updatedAt?: string | null;
}

export class PaginatedWebhookResponseDto {
  @ApiProperty({ type: [WebhookDto], description: "List of webhooks" })
  data: WebhookDto[];

  @ApiProperty({ description: "Pagination metadata" })
  meta: PaginationMetaDto;
}
