import { Controller, Get, Param, ParseUUIDPipe, Query, UseGuards, Post, Body } from '@nestjs/common';
import { WebhookDlqService } from './webhook-dlq.service';
import { ListWebhookDlqDto } from './dto/list-webhook-dlq.dto';
import { ReplayWebhookDlqDto } from './dto/replay-webhook-dlq.dto';
import { AuthGuard } from '@/common/guards/auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';

@ApiTags('Webhook DLQ')
@ApiBearerAuth()
@Controller('webhook-dlq')
@UseGuards(AuthGuard)
export class WebhookDlqController {
    constructor(private readonly webhookDlqService: WebhookDlqService) { }

    @Get()

    @ApiOperation({
        summary: 'List failed deliveries',
        description: 'Retrieves a paginated list of failed webhook deliveries currently in the Dead Letter Queue.',
        operationId: 'listWebhookDlq'
    })
    findAll(@Query() query: ListWebhookDlqDto) {
        return this.webhookDlqService.findAll(query);
    }

    @Post(':id/replay')
    @ApiOperation({
        summary: 'Retry failed delivery',
        description: 'Manually triggers a retry for a specific failed webhook delivery from the Dead Letter Queue.',
        operationId: 'replayWebhookDlq'
    })
    @ApiBody({ type: ReplayWebhookDlqDto })
    replay(@Param('id', ParseUUIDPipe) id: string, @Body() body: ReplayWebhookDlqDto) {
        return this.webhookDlqService.replay(id, body);
    }

    @Get(':id')
    @ApiOperation({
        summary: 'Get DLQ item details',
        description: 'Fetches details of a specific failed delivery record from the Dead Letter Queue.',
        operationId: 'getWebhookDlqById'
    })
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.webhookDlqService.findOne(id);
    }
}
