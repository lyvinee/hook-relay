import { ApiProperty } from "@nestjs/swagger";
import { WebhookDeliveryDto } from "./webhook-delivery.dto";
import { PaginationMetaDto } from "@/clients/dto/client-response.dto";

export class PaginatedWebhookDeliveryResponseDto {
    @ApiProperty({ type: [WebhookDeliveryDto], description: "List of webhook deliveries" })
    data: WebhookDeliveryDto[];

    @ApiProperty({ description: "Pagination metadata" })
    meta: PaginationMetaDto;
}
