import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { HttpModule } from '@nestjs/axios';
import { EnvModule } from '@/env/env.module';
import { WebhookDeliveryProcessor } from './webhook-delivery.processor';

@Module({
    imports: [
        EnvModule,
        HttpModule,
        BullModule.registerQueue({
            name: 'webhook-delivery',
        }),
    ],
    providers: [WebhookDeliveryProcessor],
    exports: [BullModule],
})
export class WebhookDeliveryModule { }
