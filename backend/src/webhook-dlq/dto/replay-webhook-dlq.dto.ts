import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsUUID } from "class-validator";

export class ReplayWebhookDlqDto {
    @ApiProperty({ description: "ID of the user initiating the replay", required: false })
    @IsUUID()
    @IsOptional()
    initiatorId?: string;

    @ApiProperty({ description: "Type of initiator (system or user)", default: "user", required: false })
    @IsEnum(['system', 'user'])
    @IsOptional()
    initiatorType?: 'system' | 'user' = 'user';
}
