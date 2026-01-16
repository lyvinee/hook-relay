import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { UsersModule } from "./users/users.module";
import { DatabaseService } from "./database/database.service";
import { DatabaseModule } from "./database/database.module";
import { EnvModule } from "./env/env.module";
import { PasswordModule } from './password/password.module';
import { AuthModule } from './auth/auth.module';
import { NotificationService } from './notification/notification.service';
import { NotificationModule } from './notification/notification.module';

import { ClientsModule } from "./clients/clients.module";
import { WebhooksModule } from "./webhooks/webhooks.module";
import { WebhookEventsModule } from "./webhook-events/webhook-events.module";

@Module({
  imports: [
    DatabaseModule,
    EnvModule,
    UsersModule,
    PasswordModule,
    AuthModule,
    NotificationModule,
    ClientsModule,
    WebhooksModule,
    WebhookEventsModule,
  ],
  controllers: [AppController],
  providers: [AppService, DatabaseService, NotificationService],
})
export class AppModule { }
