import { ApiProperty } from "@nestjs/swagger";
import { TopicDto } from "./topic.dto";

export class PaginationMetaDto {
    @ApiProperty()
    totalItems: number;

    @ApiProperty()
    itemCount: number;

    @ApiProperty()
    itemsPerPage: number;

    @ApiProperty()
    totalPages: number;

    @ApiProperty()
    currentPage: number;
}

export class PaginatedTopicResponseDto {
    @ApiProperty({ type: [TopicDto], description: "List of topics" })
    data: TopicDto[];

    @ApiProperty({ description: "Pagination metadata" })
    meta: PaginationMetaDto;
}
