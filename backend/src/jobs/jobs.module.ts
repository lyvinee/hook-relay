import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { JobsProcessor } from './jobs.processor';
import { JobsController } from './jobs.controller';

@Module({
    imports: [
        BullModule.registerQueue({
            name: 'sample-queue',
        }),
    ],
    providers: [JobsProcessor],
    controllers: [JobsController],
})
export class JobsModule { }
