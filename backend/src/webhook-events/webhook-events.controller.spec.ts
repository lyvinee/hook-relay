import { Test, TestingModule } from "@nestjs/testing";
import { WebhookEventsController } from "./webhook-events.controller";
import { WebhookEventsService } from "./webhook-events.service";
import { CreateWebhookEventDto } from "./dto/create-webhook-event.dto";
import { ListWebhookEventsDto } from "./dto/list-webhook-events.dto";
import { AuthGuard } from "@/common/guards/auth.guard";

const mockService = {
    create: jest.fn(),
    findAllRefined: jest.fn(),
    findOne: jest.fn(),
};

const mockAuthGuard = {
    canActivate: jest.fn(() => true),
};

describe("WebhookEventsController", () => {
    let controller: WebhookEventsController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [WebhookEventsController],
            providers: [
                { provide: WebhookEventsService, useValue: mockService },
            ],
        })
            .overrideGuard(AuthGuard)
            .useValue(mockAuthGuard)
            .compile();

        controller = module.get<WebhookEventsController>(WebhookEventsController);
    });

    it("should be defined", () => {
        expect(controller).toBeDefined();
    });

    describe("create", () => {
        it("should call service.create", async () => {
            const dto: CreateWebhookEventDto = {
                webhookId: "1",
                topicId: "1",
                eventPayload: {},
                webhookIdempotencyKey: "key",
            };
            await controller.create(dto);
            expect(mockService.create).toHaveBeenCalledWith(dto);
        });
    });

    describe("findAll", () => {
        it("should call service.findAllRefined", async () => {
            const query: ListWebhookEventsDto = { page: 1, limit: 10 };
            await controller.findAll(query);
            expect(mockService.findAllRefined).toHaveBeenCalledWith(query);
        });
    });

    describe("findOne", () => {
        it("should call service.findOne", async () => {
            await controller.findOne("1");
            expect(mockService.findOne).toHaveBeenCalledWith("1");
        });
    });
});
