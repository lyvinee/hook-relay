import { Module } from "@nestjs/common";
import { WebhookEventsService } from "./webhook-events.service";
import { WebhookEventsController } from "./webhook-events.controller";
import { BullModule } from '@nestjs/bullmq';
import { AuthModule } from "@/auth/auth.module";

@Module({
    imports: [
        AuthModule,
        BullModule.registerQueue({
            name: 'webhook-delivery',
        }),
    ],
    controllers: [WebhookEventsController],
    providers: [WebhookEventsService],
})
export class WebhookEventsModule { }
