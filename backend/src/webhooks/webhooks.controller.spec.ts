import { Test, TestingModule } from "@nestjs/testing";
import { WebhooksController } from "./webhooks.controller";
import { WebhooksService } from "./webhooks.service";
import { CreateWebhookDto } from "./dto/create-webhook.dto";
import { UpdateWebhookDto } from "./dto/update-webhook.dto";
import { AuthGuard } from "@/common/guards/auth.guard";
import { EnvDto } from "@/env/dto/envDto";

const mockWebhooksService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
};

const mockAuthGuard = {
    canActivate: jest.fn(() => true),
};

const mockConfig = {};

describe("WebhooksController", () => {
    let controller: WebhooksController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [WebhooksController],
            providers: [
                { provide: WebhooksService, useValue: mockWebhooksService },
                { provide: EnvDto, useValue: mockConfig },
            ],
        })
            .overrideGuard(AuthGuard)
            .useValue(mockAuthGuard)
            .compile();

        controller = module.get<WebhooksController>(WebhooksController);
    });

    it("should be defined", () => {
        expect(controller).toBeDefined();
    });

    describe("create", () => {
        it("should call service.create", async () => {
            const dto: CreateWebhookDto = {
                clientId: "client-1",
                endpointName: "Test",
                targetUrl: "https://example.com",
                isActive: true,
                timeoutMs: 5000,
            };
            await controller.create(dto);
            expect(mockWebhooksService.create).toHaveBeenCalledWith(dto);
        });
    });

    describe("findAll", () => {
        it("should call service.findAll", async () => {
            const query = { page: 1, limit: 10 };
            await controller.findAll(query);
            expect(mockWebhooksService.findAll).toHaveBeenCalledWith(query);
        });
    });

    describe("findOne", () => {
        it("should call service.findOne", async () => {
            await controller.findOne("1");
            expect(mockWebhooksService.findOne).toHaveBeenCalledWith("1");
        });
    });

    describe("update", () => {
        it("should call service.update", async () => {
            const dto: UpdateWebhookDto = { isActive: false };
            await controller.update("1", dto);
            expect(mockWebhooksService.update).toHaveBeenCalledWith("1", dto);
        });
    });
});
