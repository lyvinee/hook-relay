import { Test, TestingModule } from "@nestjs/testing";
import { ClientsController } from "./clients.controller";
import { ClientsService } from "./clients.service";
import { CreateClientDto } from "./dto/create-client.dto";
import { UpdateClientDto } from "./dto/update-client.dto";
import { AuthGuard } from "@/common/guards/auth.guard";
import { EnvDto } from "@/env/dto/envDto";

const mockClientsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
};

const mockAuthGuard = {
    canActivate: jest.fn(() => true),
};

const mockConfig = {};

describe("ClientsController", () => {
    let controller: ClientsController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ClientsController],
            providers: [
                { provide: ClientsService, useValue: mockClientsService },
                { provide: EnvDto, useValue: mockConfig },
            ],
        })
            .overrideGuard(AuthGuard)
            .useValue(mockAuthGuard)
            .compile();

        controller = module.get<ClientsController>(ClientsController);
    });

    it("should be defined", () => {
        expect(controller).toBeDefined();
    });

    describe("create", () => {
        it("should call service.create", async () => {
            const dto: CreateClientDto = { name: "Test", slugName: "test", isActive: true };
            await controller.create(dto);
            expect(mockClientsService.create).toHaveBeenCalledWith(dto);
        });
    });

    describe("findAll", () => {
        it("should call service.findAll", async () => {
            const query = { page: 1, limit: 10 };
            await controller.findAll(query);
            expect(mockClientsService.findAll).toHaveBeenCalledWith(query);
        });
    });

    describe("findOne", () => {
        it("should call service.findOne", async () => {
            await controller.findOne("1");
            expect(mockClientsService.findOne).toHaveBeenCalledWith("1");
        });
    });

    describe("update", () => {
        it("should call service.update", async () => {
            const dto: UpdateClientDto = { isActive: false };
            await controller.update("1", dto);
            expect(mockClientsService.update).toHaveBeenCalledWith("1", dto);
        });
    });
});
