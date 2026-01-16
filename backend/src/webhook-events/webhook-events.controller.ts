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
import { ZodSerializerDto, ZodSerializerInterceptor } from "nestjs-zod";
import { AuthGuard } from "@/common/guards/auth.guard";
import { ApiTags } from "@nestjs/swagger";

@ApiTags("Webhook Events")
@Controller("webhook-events")
@UseInterceptors(ZodSerializerInterceptor)
@UseGuards(AuthGuard)
export class WebhookEventsController {
    constructor(private readonly webhookEventsService: WebhookEventsService) { }

    @Post()
    @ZodSerializerDto(WebhookEventResponseDto)
    create(@Body() createWebhookEventDto: CreateWebhookEventDto) {
        return this.webhookEventsService.create(createWebhookEventDto);
    }

    @Get()
    findAll(@Query() query: ListWebhookEventsDto) {
        // Calling the refined method we implemented
        return this.webhookEventsService.findAllRefined(query);
    }

    @Get(":id")
    @ZodSerializerDto(WebhookEventResponseDto)
    findOne(@Param("id") id: string) {
        return this.webhookEventsService.findOne(id);
    }
}
