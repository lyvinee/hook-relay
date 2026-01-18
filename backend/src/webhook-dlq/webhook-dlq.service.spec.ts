import { Test, TestingModule } from '@nestjs/testing';
import { WebhookDlqService } from './webhook-dlq.service';
import { DRIZZLE } from '@/database/database.module';
import { NotFoundException } from '@nestjs/common';
import { getQueueToken } from '@nestjs/bullmq';

const mockDb = {
    select: jest.fn(),
    query: {
        webhookDlq: {
            findFirst: jest.fn(),
        },
        webhookDeliveries: { // Initialize as object, not mocked function yet, specific tests will mock methods
            findFirst: jest.fn(),
        }
    },
};

const mockQueue = {
    add: jest.fn(),
};

describe('WebhookDlqService', () => {
    let service: WebhookDlqService;

    beforeEach(async () => {
        jest.clearAllMocks();
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                WebhookDlqService,
                { provide: DRIZZLE, useValue: mockDb },
                { provide: getQueueToken('webhook-delivery'), useValue: mockQueue },
            ],
        }).compile();

        service = module.get<WebhookDlqService>(WebhookDlqService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('findAll', () => {
        it('should return paginated dlq entries', async () => {
            const dlqEntries = [
                {
                    dlq: { webhookDlqId: '1' },
                    event: { webhookEventId: 'ev-1', webhookId: 'wh-1' }
                }
            ];
            const count = 1;

            // Mock complex query builder chain
            const mockChain = {
                from: jest.fn().mockReturnValue({
                    innerJoin: jest.fn().mockReturnValue({
                        innerJoin: jest.fn().mockReturnValue({
                            where: jest.fn().mockReturnValue({
                                limit: jest.fn().mockReturnValue({
                                    offset: jest.fn().mockReturnValue({
                                        orderBy: jest.fn().mockResolvedValue(dlqEntries)
                                    })
                                })
                            }),
                            // branch without where
                            limit: jest.fn().mockReturnValue({
                                offset: jest.fn().mockReturnValue({
                                    orderBy: jest.fn().mockResolvedValue(dlqEntries)
                                })
                            })
                        })
                    })
                })
            };

            const mockCountChain = {
                from: jest.fn().mockReturnValue({
                    innerJoin: jest.fn().mockReturnValue({
                        innerJoin: jest.fn().mockReturnValue({
                            where: jest.fn().mockResolvedValue([{ count }]),
                            // branch without where (actually awaitable directly if no where)
                            then: (resolve: (val: any) => void) => resolve([{ count }])
                        })
                    })
                })
            };

            mockDb.select.mockImplementation((fields) => {
                if (fields && fields.count) {
                    return mockCountChain;
                }
                return mockChain;
            });

            const result = await service.findAll({ page: 1, limit: 10 });
            expect(result.data).toEqual([{ webhookDlqId: '1', eventId: 'ev-1', webhookId: 'wh-1' }]);
            expect(result.meta.total).toBe(count);
        });
    });

    describe('findOne', () => {
        it('should return entry if found', async () => {
            const entry = { webhookDlqId: '1' };
            mockDb.query.webhookDlq.findFirst.mockResolvedValue(entry);

            const result = await service.findOne('1');
            expect(result).toEqual(entry);
        });

        it('should throw NotFoundException if not found', async () => {
            mockDb.query.webhookDlq.findFirst.mockResolvedValue(null);

            await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
        });
    });

    describe('replay', () => {
        it('should throw error if delivery is pending', async () => {
            const dlqEntry = {
                delivery: { webhookEventId: 'ev-1' }
            };
            mockDb.query.webhookDlq.findFirst.mockResolvedValue(dlqEntry);

            const pendingDelivery = { deliveryStatus: 'pending' };
            // Ensure we are mocking the specific call
            mockDb.query.webhookDeliveries.findFirst.mockResolvedValue(pendingDelivery);

            await expect(service.replay('1', {})).rejects.toThrow('A delivery is already in progress for this event.');
        });

        it('should return success if delivery already succeeded', async () => {
            const dlqEntry = {
                delivery: { webhookEventId: 'ev-1' }
            };
            mockDb.query.webhookDlq.findFirst.mockResolvedValue(dlqEntry);

            const successDelivery = { deliveryStatus: 'success', webhookDeliveryId: 'del-1' };
            mockDb.query.webhookDeliveries.findFirst.mockResolvedValue(successDelivery);

            const result = await service.replay('1', {});
            expect(result).toEqual({ status: 'Delivery already succeeded', deliveryId: 'del-1' });
        });

        it('should add to queue if no pending/success delivery', async () => {
            const dlqEntry = {
                delivery: { webhookEventId: 'ev-1' }
            };
            mockDb.query.webhookDlq.findFirst.mockResolvedValue(dlqEntry);

            // Mock no existing delivery (or failed one)
            mockDb.query.webhookDeliveries.findFirst.mockResolvedValue(null);
            // Or use null to simulate "not found" which means no pending/success if we filtered by that in real query,
            // but the code actually queries existing deliveries and checks status.
            // If the query returns a failed delivery:
            mockDb.query.webhookDeliveries.findFirst.mockResolvedValue({ deliveryStatus: 'failed' });


            const dto = { initiatorId: 'user-1', initiatorType: 'user' as const };
            await service.replay('1', dto);

            expect(mockQueue.add).toHaveBeenCalledWith('deliver', {
                eventId: 'ev-1',
                initiator: { type: 'user', id: 'user-1' }
            }, expect.any(Object));
        });
    });
});
