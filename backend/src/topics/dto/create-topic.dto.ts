import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsBoolean, IsOptional } from "class-validator";

export class CreateTopicDto {
    @ApiProperty({ description: "Display name of the topic" })
    @IsString()
    @IsNotEmpty()
    topicName: string;

    @ApiProperty({ description: "Unique slug/key for the topic" })
    @IsString()
    @IsNotEmpty()
    topicSlugId: string;
}
