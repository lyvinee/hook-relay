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
import { ZodSerializerDto, ZodSerializerInterceptor } from "nestjs-zod";
import { AuthGuard } from "@/common/guards/auth.guard";
import { ApiTags } from "@nestjs/swagger";

@ApiTags("Webhooks")
@Controller("webhooks")
@UseInterceptors(ZodSerializerInterceptor)
@UseGuards(AuthGuard)
export class WebhooksController {
    constructor(private readonly webhooksService: WebhooksService) { }

    @Post()
    @ZodSerializerDto(WebhookResponseDto)
    create(@Body() createWebhookDto: CreateWebhookDto) {
        return this.webhooksService.create(createWebhookDto);
    }

    @Get()
    findAll(@Query() query: ListWebhooksDto) {
        return this.webhooksService.findAll(query);
    }

    @Get(":id")
    @ZodSerializerDto(WebhookResponseDto)
    findOne(@Param("id") id: string) {
        return this.webhooksService.findOne(id);
    }

    @Patch(":id")
    @ZodSerializerDto(WebhookResponseDto)
    update(@Param("id") id: string, @Body() updateWebhookDto: UpdateWebhookDto) {
        return this.webhooksService.update(id, updateWebhookDto);
    }
}
