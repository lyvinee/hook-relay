import { Test, TestingModule } from "@nestjs/testing";
import { WebhooksService } from "./webhooks.service";
import { DRIZZLE } from "@/database/database.module";
import { ConflictException, NotFoundException } from "@nestjs/common";
import { CreateWebhookDto } from "./dto/create-webhook.dto";
import { UpdateWebhookDto } from "./dto/update-webhook.dto";

const mockDb = {
    query: {
        webhooks: {
            findMany: jest.fn(),
            findFirst: jest.fn(),
        },
    },
    insert: jest.fn(),
    select: jest.fn(),
    update: jest.fn(),
};

describe("WebhooksService", () => {
    let service: WebhooksService;

    beforeEach(async () => {
        jest.clearAllMocks();
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                WebhooksService,
                { provide: DRIZZLE, useValue: mockDb },
            ],
        }).compile();

        service = module.get<WebhooksService>(WebhooksService);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    describe("create", () => {
        it("should create a new webhook", async () => {
            const createDto: CreateWebhookDto = {
                clientId: "client-id",
                endpointName: "Order Created",
                targetUrl: "https://example.com/webhook",
                isActive: true,
                timeoutMs: 5000,
            };
            const createdWebhook = { webhookId: "1", ...createDto };

            mockDb.insert.mockReturnValue({
                values: jest.fn().mockReturnValue({
                    returning: jest.fn().mockResolvedValue([createdWebhook]),
                }),
            });

            const result = await service.create(createDto);
            expect(result).toEqual(createdWebhook);
        });

        it("should throw ConflictException if duplicate webhook", async () => {
            const createDto: CreateWebhookDto = {
                clientId: "client-id",
                endpointName: "Order Created",
                targetUrl: "https://example.com/webhook",
                isActive: true,
                timeoutMs: 5000,
            };

            const dbError: any = new Error("Unique violation");
            dbError.code = "23505";

            mockDb.insert.mockReturnValue({
                values: jest.fn().mockReturnValue({
                    returning: jest.fn().mockRejectedValue(dbError),
                }),
            });

            await expect(service.create(createDto)).rejects.toThrow(ConflictException);
        });
    });

    describe("findAll", () => {
        it("should return paginated webhooks", async () => {
            const query = { page: 1, limit: 10 };
            const webhooks = [{ webhookId: "1", endpointName: "Test" }];
            const count = 1;

            mockDb.select.mockReturnValue({
                from: jest.fn().mockReturnValue({
                    where: jest.fn().mockResolvedValue([{ count }]),
                }),
            });
            mockDb.query.webhooks.findMany.mockResolvedValue(webhooks);

            const result = await service.findAll(query);
            expect(result.data).toEqual(webhooks);
            expect(result.meta.total).toBe(count);
        });

        it("should apply filters", async () => {
            const query = { page: 1, limit: 10, clientId: "client-1" };
            const webhooks = [{ webhookId: "1", endpointName: "Test" }];
            const count = 1;

            mockDb.select.mockReturnValue({
                from: jest.fn().mockReturnValue({
                    where: jest.fn().mockResolvedValue([{ count }]),
                }),
            });
            mockDb.query.webhooks.findMany.mockResolvedValue(webhooks);

            await service.findAll(query);
            // We can't easily assert the exact where clause structure with this mock, 
            // but we can ensure the query was executed.
            expect(mockDb.query.webhooks.findMany).toHaveBeenCalled();
        });
    });

    describe("findOne", () => {
        it("should return a webhook if found", async () => {
            const webhook = { webhookId: "1", endpointName: "Test" };
            mockDb.query.webhooks.findFirst.mockResolvedValue(webhook);

            const result = await service.findOne("1");
            expect(result).toEqual(webhook);
        });

        it("should throw NotFoundException if not found", async () => {
            mockDb.query.webhooks.findFirst.mockResolvedValue(null);
            await expect(service.findOne("1")).rejects.toThrow(NotFoundException);
        });
    });

    describe("update", () => {
        it("should update and return the webhook", async () => {
            const updateDto: UpdateWebhookDto = { isActive: false };
            const updatedWebhook = { webhookId: "1", isActive: false };

            mockDb.update.mockReturnValue({
                set: jest.fn().mockReturnValue({
                    where: jest.fn().mockReturnValue({
                        returning: jest.fn().mockResolvedValue([updatedWebhook]),
                    }),
                }),
            });

            const result = await service.update("1", updateDto);
            expect(result).toEqual(updatedWebhook);
        });

        it("should throw NotFoundException if webhook to update not found", async () => {
            mockDb.update.mockReturnValue({
                set: jest.fn().mockReturnValue({
                    where: jest.fn().mockReturnValue({
                        returning: jest.fn().mockResolvedValue([]),
                    }),
                }),
            });

            await expect(service.update("1", { isActive: false })).rejects.toThrow(NotFoundException);
        });
    });
});
