import { ApiProperty } from "@nestjs/swagger";

export class WebhookResponseDto {
  @ApiProperty({ description: "Unique identifier for the webhook" })
  webhookId: string;

  @ApiProperty({ description: "Secret for HMAC signature verification" })
  hmacSecret: string;
}
