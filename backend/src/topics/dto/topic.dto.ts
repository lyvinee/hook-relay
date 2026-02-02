import { ApiProperty } from "@nestjs/swagger";

export class TopicDto {
    @ApiProperty({ description: "Unique ID of the topic" })
    topicId: string;

    @ApiProperty({ description: "Display name of the topic" })
    topicName: string;

    @ApiProperty({ description: "Unique slug/key for the topic" })
    topicSlugId: string;

    @ApiProperty({ description: "Whether the topic is active" })
    isActive: boolean;

    @ApiProperty({ description: "Creation timestamp" })
    createdAt: Date;

    @ApiProperty({ description: "Last update timestamp" })
    updatedAt: Date;
}
