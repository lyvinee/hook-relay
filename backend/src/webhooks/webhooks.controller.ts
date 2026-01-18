import {
    Body,
    Controller,
    Get,
    Param,
    Patch,
    Post,
    Query,
    UseGuards,
    UseInterceptors,
} from "@nestjs/common";
import { WebhooksService } from "./webhooks.service";
import { CreateWebhookDto } from "./dto/create-webhook.dto";
import { UpdateWebhookDto } from "./dto/update-webhook.dto";
import { ListWebhooksDto } from "./dto/list-webhooks.dto";
import { WebhookResponseDto } from "./dto/webhook-response.dto";
import { ZodSerializerDto, ZodSerializerInterceptor, ZodResponse } from "nestjs-zod";
import { AuthGuard } from "@/common/guards/auth.guard";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { ApiStandardResponse } from "@/common/decorators/api-standard-response.decorator";

@ApiTags("Webhooks")
@ApiBearerAuth()
@ApiStandardResponse()
@Controller("webhooks")
@UseInterceptors(ZodSerializerInterceptor)
@UseGuards(AuthGuard)
export class WebhooksController {
    constructor(private readonly webhooksService: WebhooksService) { }

    @Post()
    @Post()
    @ApiOperation({
        summary: "Register webhook endpoint",
        description: "Registers a new webhook endpoint for a client to receive event notifications.",
        operationId: "createWebhook"
    })
    @ZodResponse({
        type: WebhookResponseDto,
        status: 201,
        description: "Webhook created successfully",
    })
    @ZodSerializerDto(WebhookResponseDto)
    create(@Body() createWebhookDto: CreateWebhookDto) {
        return this.webhooksService.create(createWebhookDto);
    }

    @Get()
    @ApiOperation({
        summary: "List registered webhooks",
        description: "Retrieves a paginated list of registered webhook endpoints for the authenticated client.",
        operationId: "listWebhooks"
    })
    findAll(@Query() query: ListWebhooksDto) {
        return this.webhooksService.findAll(query);
    }

    @Get(":id")
    @ApiOperation({
        summary: "Get webhook details",
        description: "Fetches configuration details for a specific webhook endpoint.",
        operationId: "getWebhookById"
    })
    @ZodResponse({
        type: WebhookResponseDto,
        status: 200,
        description: "Webhook details retrieved successfully",
    })
    @ZodSerializerDto(WebhookResponseDto)
    findOne(@Param("id") id: string) {
        return this.webhooksService.findOne(id);
    }

    @Patch(":id")
    @ApiOperation({
        summary: "Update webhook configuration",
        description: "Modifies settings for an existing webhook endpoint, such as the target URL or active status.",
        operationId: "updateWebhook"
    })
    @ZodResponse({
        type: WebhookResponseDto,
        status: 200,
        description: "Webhook updated successfully",
    })
    @ZodSerializerDto(WebhookResponseDto)
    update(@Param("id") id: string, @Body() updateWebhookDto: UpdateWebhookDto) {
        return this.webhooksService.update(id, updateWebhookDto);
    }
}
