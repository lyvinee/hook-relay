import { Module } from "@nestjs/common";
import { WebhookEventsService } from "./webhook-events.service";
import { WebhookEventsController } from "./webhook-events.controller";
import { AuthModule } from "@/auth/auth.module";

@Module({
    imports: [AuthModule],
    controllers: [WebhookEventsController],
    providers: [WebhookEventsService],
})
export class WebhookEventsModule { }
