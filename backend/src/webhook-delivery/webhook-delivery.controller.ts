import { Controller, Get, Param, ParseUUIDPipe, Query, UseGuards } from '@nestjs/common';
import { WebhookDeliveriesService } from './webhook-delivery.service';
import { ListWebhookDeliveriesDto } from './dto/list-webhook-deliveries.dto';
import { AuthGuard } from '@/common/guards/auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ApiStandardResponse } from '@/common/decorators/api-standard-response.decorator';

@ApiTags('Webhook Deliveries')
@ApiBearerAuth()
@ApiStandardResponse()
@Controller('webhook-deliveries')
@UseGuards(AuthGuard)
export class WebhookDeliveriesController {
    constructor(private readonly webhookDeliveriesService: WebhookDeliveriesService) { }

    @Get()

    @ApiOperation({
        summary: 'Retrieve delivery logs',
        description: 'Fetches a paginated history of webhook delivery attempts, including status and timestamps.',
        operationId: 'listWebhookDeliveries'
    })
    findAll(@Query() query: ListWebhookDeliveriesDto) {
        return this.webhookDeliveriesService.findAll(query);
    }

    @Get(':id')
    @ApiOperation({
        summary: 'Get delivery details',
        description: 'Retrieves detailed information about a specific webhook delivery attempt.',
        operationId: 'getWebhookDeliveryById'
    })
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.webhookDeliveriesService.findOne(id);
    }
}
