import { Module } from '@nestjs/common';
import { WebhookDlqController } from './webhook-dlq.controller';
import { WebhookDlqService } from './webhook-dlq.service';
import { AuthModule } from '@/auth/auth.module';
import { DatabaseModule } from '@/database/database.module';

@Module({
    imports: [
        AuthModule,
        DatabaseModule,
    ],
    controllers: [WebhookDlqController],
    providers: [WebhookDlqService],
})
export class WebhookDlqModule { }
