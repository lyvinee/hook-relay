import { Test, TestingModule } from "@nestjs/testing";
import { WebhookEventsService } from "./webhook-events.service";
import { DRIZZLE } from "@/database/database.module";
import { NotFoundException } from "@nestjs/common";
import { CreateWebhookEventDto } from "./dto/create-webhook-event.dto";
import { ListWebhookEventsDto } from "./dto/list-webhook-events.dto";
import { sql } from "drizzle-orm";

const mockDb = {
    query: {
        webhookEvents: {
            findFirst: jest.fn(),
        },
        webhooks: {
            findFirst: jest.fn(),
        }
    },
    insert: jest.fn(),
    select: jest.fn(),
};

describe("WebhookEventsService", () => {
    let service: WebhookEventsService;

    beforeEach(async () => {
        jest.clearAllMocks();
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                WebhookEventsService,
                { provide: DRIZZLE, useValue: mockDb },
            ],
        }).compile();

        service = module.get<WebhookEventsService>(WebhookEventsService);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    describe("create", () => {
        const createDto: CreateWebhookEventDto = {
            webhookId: "wh-123",
            topicId: "tp-123",
            eventPayload: { test: "data" },
            webhookIdempotencyKey: "key-123",
        };

        it("should create a new event", async () => {
            const createdEvent = { webhookEventId: "1", ...createDto, eventTimestamp: new Date() };

            mockDb.insert.mockReturnValue({
                values: jest.fn().mockReturnValue({
                    returning: jest.fn().mockResolvedValue([createdEvent]),
                }),
            });

            const result = await service.create(createDto);
            expect(result).toEqual(createdEvent);
        });

        it("should return existing event on duplicate key (idempotency)", async () => {
            const existingEvent = { webhookEventId: "1", ...createDto, eventTimestamp: new Date() };

            // Simulate unique violation error
            const error: any = new Error("Unique violation");
            error.code = "23505";

            mockDb.insert.mockReturnValue({
                values: jest.fn().mockReturnValue({
                    returning: jest.fn().mockRejectedValue(error),
                }),
            });

            mockDb.query.webhookEvents.findFirst.mockResolvedValue(existingEvent);

            const result = await service.create(createDto);
            expect(result).toEqual(existingEvent);
            expect(mockDb.query.webhookEvents.findFirst).toHaveBeenCalled();
        });

        it("should throw error for other errors", async () => {
            const error = new Error("Some other error");
            mockDb.insert.mockReturnValue({
                values: jest.fn().mockReturnValue({
                    returning: jest.fn().mockRejectedValue(error),
                }),
            });

            await expect(service.create(createDto)).rejects.toThrow(error);
        });
    });

    describe("findAll", () => {
        it("should return paginated events", async () => {
            const query: ListWebhookEventsDto = { page: 1, limit: 10 };
            const events = [{ webhookEventId: "1" }];
            const count = 1;

            // Mocking the count query
            // The service uses await this.db.select({ count: ... }).from(...)
            // which returns Promise<[{ count: number }]>

            // Mocking the data query
            // The service uses await this.db.select().from(...).limit...

            // The service actually makes two calls. We need to mock select implementation cleanly.
            // Since `select` returns a builder, we need to chain mocked methods.

            // Mock chain for count query
            const countChain = {
                from: jest.fn().mockReturnValue({
                    where: jest.fn().mockResolvedValue([{ count }]),
                })
            };
            // Chain for data query: select -> from -> where -> limit -> offset -> orderBy -> resolve
            const dataChain = Promise.resolve(events);
            // We need to support property access on the promise for chaining before resolution??
            // Actually, the service code:
            /*
                const [countRes] = await this.db.select(...).from(...).where(...);
                const result = await this.db.select().from(...).where(...).limit(...)...;
            */

            // Simplified mock for select:
            mockDb.select.mockImplementation((fields) => {
                if (fields && fields.count) {
                    return {
                        from: jest.fn().mockReturnValue({
                            where: jest.fn().mockResolvedValue([{ count }])
                        })
                    }
                }
                return {
                    from: jest.fn().mockReturnValue({
                        where: jest.fn().mockReturnValue({
                            limit: jest.fn().mockReturnValue({
                                offset: jest.fn().mockReturnValue({
                                    orderBy: jest.fn().mockResolvedValue(events)
                                })
                            })
                        })
                    })
                }
            });

            const result = await service.findAllRefined(query);
            expect(result.data).toEqual(events);
            expect(result.meta.total).toBe(count);
        });

        it("should handle clientId filter with join", async () => {
            const query: ListWebhookEventsDto = { page: 1, limit: 10, clientId: "client-123" };
            const events = [{ webhookEventId: "1" }]; // logic grabs .event from joined result
            const rawResult = [{ event: events[0] }];
            const count = 1;

            mockDb.select.mockImplementation((fields) => {
                if (fields && fields.count) {
                    return {
                        from: jest.fn().mockReturnValue({
                            innerJoin: jest.fn().mockReturnValue({
                                where: jest.fn().mockResolvedValue([{ count }])
                            })
                        })
                    }
                }
                return {
                    from: jest.fn().mockReturnValue({
                        innerJoin: jest.fn().mockReturnValue({
                            where: jest.fn().mockReturnValue({
                                limit: jest.fn().mockReturnValue({
                                    offset: jest.fn().mockReturnValue({
                                        orderBy: jest.fn().mockResolvedValue(rawResult)
                                    })
                                })
                            })
                        })
                    })
                }
            });

            const result = await service.findAllRefined(query);
            expect(result.data).toEqual(events);
            expect(result.meta.total).toBe(count);
        });
    });

    describe("findOne", () => {
        it("should return an event if found", async () => {
            const event = { webhookEventId: "1" };
            mockDb.query.webhookEvents.findFirst.mockResolvedValue(event);

            const result = await service.findOne("1");
            expect(result).toEqual(event);
        });

        it("should throw NotFoundException if not found", async () => {
            mockDb.query.webhookEvents.findFirst.mockResolvedValue(null);

            await expect(service.findOne("1")).rejects.toThrow(NotFoundException);
        });
    });
});
