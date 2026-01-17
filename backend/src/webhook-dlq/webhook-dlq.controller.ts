import { Controller, Get, Param, ParseUUIDPipe, Query, UseGuards } from '@nestjs/common';
import { WebhookDlqService } from './webhook-dlq.service';
import { ListWebhookDlqDto } from './dto/list-webhook-dlq.dto';
import { AuthGuard } from '@/common/guards/auth.guard';

@Controller('webhook-dlq')
@UseGuards(AuthGuard)
export class WebhookDlqController {
    constructor(private readonly webhookDlqService: WebhookDlqService) { }

    @Get()
    findAll(@Query() query: ListWebhookDlqDto) {
        return this.webhookDlqService.findAll(query);
    }

    @Get(':id')
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.webhookDlqService.findOne(id);
    }
}
