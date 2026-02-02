import { ApiProperty } from "@nestjs/swagger";
import { WebhookDlqDto } from "./webhook-dlq.dto";
import { PaginationMetaDto } from "@/clients/dto/client-response.dto";

export class PaginatedWebhookDlqResponseDto {
    @ApiProperty({ type: [WebhookDlqDto], description: "List of DLQ entries" })
    data: WebhookDlqDto[];

    @ApiProperty({ description: "Pagination metadata" })
    meta: PaginationMetaDto;
}
