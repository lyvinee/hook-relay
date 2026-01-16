import { Module } from "@nestjs/common";
import { WebhooksService } from "./webhooks.service";
import { WebhooksController } from "./webhooks.controller";
import { DatabaseModule } from "@/database/database.module";
import { AuthModule } from "@/auth/auth.module";

@Module({
    imports: [DatabaseModule, AuthModule],
    controllers: [WebhooksController],
    providers: [WebhooksService],
})
export class WebhooksModule { }
