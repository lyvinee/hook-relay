import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { HttpModule } from '@nestjs/axios';
import { EnvModule } from '@/env/env.module';
import { WebhookDeliveryProcessor } from './webhook-delivery.processor';

import { WebhookDeliveriesController } from './webhook-delivery.controller';
import { WebhookDeliveriesService } from './webhook-delivery.service';
import { AuthModule } from '@/auth/auth.module';

@Module({
    imports: [
        EnvModule,
        HttpModule,
        BullModule.registerQueue({
            name: 'webhook-delivery',
        }),
        AuthModule
    ],
    controllers: [WebhookDeliveriesController],
    providers: [WebhookDeliveryProcessor, WebhookDeliveriesService],
    exports: [BullModule, WebhookDeliveriesService],
})
export class WebhookDeliveryModule { }
