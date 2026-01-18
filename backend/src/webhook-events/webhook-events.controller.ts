import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    Query,
    UseGuards,
    UseInterceptors,
} from "@nestjs/common";
import { WebhookEventsService } from "./webhook-events.service";
import { CreateWebhookEventDto } from "./dto/create-webhook-event.dto";
import { ListWebhookEventsDto } from "./dto/list-webhook-events.dto";
import { WebhookEventResponseDto } from "./dto/webhook-event-response.dto";
import { ZodSerializerDto, ZodSerializerInterceptor, ZodResponse } from "nestjs-zod";
import { AuthGuard } from "@/common/guards/auth.guard";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { ApiStandardResponse } from "@/common/decorators/api-standard-response.decorator";

@ApiTags("Webhook Events")
@ApiBearerAuth()
@ApiStandardResponse()
@Controller("webhook-events")
@UseInterceptors(ZodSerializerInterceptor)
@UseGuards(AuthGuard)
export class WebhookEventsController {
    constructor(private readonly webhookEventsService: WebhookEventsService) { }

    @Post()
    @Post()
    @ApiOperation({
        summary: "Ingest new event",
        description: "Accepts a new event payload and processes it for distribution to relevant webhook subscriptions.",
        operationId: "createWebhookEvent"
    })
    @ZodResponse({
        type: WebhookEventResponseDto,
        status: 201,
        description: "Webhook event created successfully",
    })
    @ZodSerializerDto(WebhookEventResponseDto)
    create(@Body() createWebhookEventDto: CreateWebhookEventDto) {
        return this.webhookEventsService.create(createWebhookEventDto);
    }

    @Get()
    @ApiOperation({
        summary: "List occurred events",
        description: "Retrieves a paginated log of events that have been ingested into the system.",
        operationId: "listWebhookEvents"
    })
    findAll(@Query() query: ListWebhookEventsDto) {
        // Calling the refined method we implemented
        return this.webhookEventsService.findAllRefined(query);
    }

    @Get(":id")
    @ApiOperation({
        summary: "Get event details",
        description: "Retrieves the full payload and metadata for a specific event.",
        operationId: "getWebhookEventById"
    })
    @ZodResponse({
        type: WebhookEventResponseDto,
        status: 200,
        description: "Webhook event details retrieved successfully",
    })
    @ZodSerializerDto(WebhookEventResponseDto)
    findOne(@Param("id") id: string) {
        return this.webhookEventsService.findOne(id);
    }
}
