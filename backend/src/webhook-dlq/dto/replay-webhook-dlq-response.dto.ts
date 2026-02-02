import { ApiProperty } from "@nestjs/swagger";

export class ReplayWebhookDlqResponseDto {
    @ApiProperty({ description: "Status of the replay action" })
    status: string;

    @ApiProperty({ description: "ID of the delivery if it already succeeded", required: false })
    deliveryId?: string;
}
