import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

@Processor('sample-queue')
export class JobsProcessor extends WorkerHost {
    async process(job: Job<any, any, string>): Promise<any> {
        console.log(`Processing job ${job.id} of type ${job.name} with data ${JSON.stringify(job.data)}...`);
        // Simulate some work
        await new Promise((resolve) => setTimeout(resolve, 1000));
        console.log(`Job ${job.id} completed.`);
        return {};
    }
}
