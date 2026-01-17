import { Test, TestingModule } from '@nestjs/testing';
import { WebhookDlqService } from './webhook-dlq.service';
import { DRIZZLE } from '@/database/database.module';
import { NotFoundException } from '@nestjs/common';

const mockDb = {
    select: jest.fn(),
    query: {
        webhookDlq: {
            findFirst: jest.fn(),
        },
    },
};

describe('WebhookDlqService', () => {
    let service: WebhookDlqService;

    beforeEach(async () => {
        jest.clearAllMocks();
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                WebhookDlqService,
                { provide: DRIZZLE, useValue: mockDb },
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
});
