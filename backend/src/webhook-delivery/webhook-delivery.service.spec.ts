import { Test, TestingModule } from '@nestjs/testing';
import { WebhookDeliveriesService } from './webhook-delivery.service';
import { DRIZZLE } from '@/database/database.module';
import { NotFoundException } from '@nestjs/common';

const mockDb = {
    select: jest.fn(),
    query: {
        webhookDeliveries: {
            findFirst: jest.fn(),
        },
    },
};

describe('WebhookDeliveriesService', () => {
    let service: WebhookDeliveriesService;

    beforeEach(async () => {
        jest.clearAllMocks();
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                WebhookDeliveriesService,
                { provide: DRIZZLE, useValue: mockDb },
            ],
        }).compile();

        service = module.get<WebhookDeliveriesService>(WebhookDeliveriesService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('findAll', () => {
        it('should return paginated deliveries', async () => {
            const deliveries = [{ webhookDeliveryId: '1' }];
            const count = 1;

            mockDb.select.mockImplementation((fields) => {
                if (fields && fields.count) {
                    return {
                        from: jest.fn().mockReturnValue({
                            where: jest.fn().mockResolvedValue([{ count }]),
                        }),
                    };
                }
                return {
                    from: jest.fn().mockReturnValue({
                        where: jest.fn().mockReturnValue({
                            limit: jest.fn().mockReturnValue({
                                offset: jest.fn().mockReturnValue({
                                    orderBy: jest.fn().mockResolvedValue(deliveries),
                                }),
                            }),
                        }),
                    }),
                };
            });

            const result = await service.findAll({ page: 1, limit: 10 });
            expect(result.data).toEqual(deliveries);
            expect(result.meta.total).toBe(count);
        });
    });

    describe('findOne', () => {
        it('should return delivery if found', async () => {
            const delivery = { webhookDeliveryId: '1' };
            mockDb.query.webhookDeliveries.findFirst.mockResolvedValue(delivery);

            const result = await service.findOne('1');
            expect(result).toEqual(delivery);
        });

        it('should throw NotFoundException if not found', async () => {
            mockDb.query.webhookDeliveries.findFirst.mockResolvedValue(null);

            await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
        });
    });
});
