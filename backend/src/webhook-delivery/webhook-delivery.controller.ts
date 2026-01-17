import { Controller, Get, Param, ParseUUIDPipe, Query, UseGuards } from '@nestjs/common';
import { WebhookDeliveriesService } from './webhook-delivery.service';
import { ListWebhookDeliveriesDto } from './dto/list-webhook-deliveries.dto';
import { AuthGuard } from '@/common/guards/auth.guard';

@Controller('webhook-deliveries')
@UseGuards(AuthGuard)
export class WebhookDeliveriesController {
    constructor(private readonly webhookDeliveriesService: WebhookDeliveriesService) { }

    @Get()
    findAll(@Query() query: ListWebhookDeliveriesDto) {
        return this.webhookDeliveriesService.findAll(query);
    }

    @Get(':id')
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.webhookDeliveriesService.findOne(id);
    }
}
