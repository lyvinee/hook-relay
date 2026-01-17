import { Test, TestingModule } from '@nestjs/testing';
import { WebhookDlqController } from './webhook-dlq.controller';
import { WebhookDlqService } from './webhook-dlq.service';
import { AuthGuard } from '@/common/guards/auth.guard';

const mockService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
};

describe('WebhookDlqController', () => {
    let controller: WebhookDlqController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [WebhookDlqController],
            providers: [
                { provide: WebhookDlqService, useValue: mockService },
            ],
        })
            .overrideGuard(AuthGuard)
            .useValue({ canActivate: () => true })
            .compile();

        controller = module.get<WebhookDlqController>(WebhookDlqController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('findAll', () => {
        it('should call service.findAll', async () => {
            const query = { page: 1, limit: 10 };
            await controller.findAll(query);
            expect(mockService.findAll).toHaveBeenCalledWith(query);
        });
    });

    describe('findOne', () => {
        it('should call service.findOne', async () => {
            const id = 'uuid-123';
            await controller.findOne(id);
            expect(mockService.findOne).toHaveBeenCalledWith(id);
        });
    });
});
