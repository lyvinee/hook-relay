import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { TopicsService } from "./topics.service";
import { AuthGuard } from "../common/guards/auth.guard";
import { CreateTopicDto } from "./dto/create-topic.dto";
import { UpdateTopicDto } from "./dto/update-topic.dto";
import { TopicDto } from "./dto/topic.dto";
import { ListTopicsDto } from "./dto/list-topics.dto";
import { PaginatedTopicResponseDto } from "./dto/paginated-topic-response.dto";

@ApiTags("topics")
@Controller("topics")
@UseGuards(AuthGuard)
export class TopicsController {
    constructor(private readonly topicsService: TopicsService) { }

    @Post()
    @ApiOperation({ summary: "Create a new topic" })
    @ApiResponse({ status: 201, description: "The topic has been successfully created.", type: TopicDto })
    create(@Body() createTopicDto: CreateTopicDto) {
        return this.topicsService.create(createTopicDto);
    }

    @Get()
    @ApiOperation({ summary: "List all active topics" })
    @ApiResponse({ status: 200, description: "Return all active topics.", type: PaginatedTopicResponseDto })
    findAll(@Query() query: ListTopicsDto) {
        return this.topicsService.findAll(query);
    }

    @Get(":id")
    @ApiOperation({ summary: "Get a topic by id" })
    @ApiResponse({ status: 200, description: "Return the topic.", type: TopicDto })
    findOne(@Param("id") id: string) {
        return this.topicsService.findOne(id);
    }

    @Patch(":id")
    @ApiOperation({ summary: "Update a topic" })
    @ApiResponse({ status: 200, description: "The topic has been successfully updated.", type: TopicDto })
    update(@Param("id") id: string, @Body() updateTopicDto: UpdateTopicDto) {
        return this.topicsService.update(id, updateTopicDto);
    }

    @Delete(":id")
    @ApiOperation({ summary: "Soft delete a topic" })
    @ApiResponse({ status: 200, description: "The topic has been successfully deleted.", type: TopicDto })
    remove(@Param("id") id: string) {
        return this.topicsService.remove(id);
    }
}
