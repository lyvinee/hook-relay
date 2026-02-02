import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsBoolean, IsOptional } from "class-validator";

export class UpdateTopicDto {
    @ApiProperty({ description: "Display name of the topic" })
    @IsString()
    @IsNotEmpty()
    @IsOptional()
    topicName?: string;

    @ApiProperty({ description: "Whether the topic is active" })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}
