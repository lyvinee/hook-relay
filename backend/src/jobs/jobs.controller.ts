import { Controller, Post, Body } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Controller('jobs')
export class JobsController {
    constructor(@InjectQueue('sample-queue') private readonly sampleQueue: Queue) { }

    @Post('test')
    async addJob(@Body() body: any) {
        const job = await this.sampleQueue.add('test-job', body);
        return {
            message: 'Job added to queue',
            jobId: job.id,
            data: body,
        };
    }
}
