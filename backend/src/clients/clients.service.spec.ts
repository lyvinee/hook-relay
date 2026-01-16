import { Test, TestingModule } from "@nestjs/testing";
import { ClientsService } from "./clients.service";
import { DRIZZLE } from "@/database/database.module";
import { NotFoundException } from "@nestjs/common";
import { CreateClientDto } from "./dto/create-client.dto";
import { UpdateClientDto } from "./dto/update-client.dto";

const mockDb = {
    query: {
        clients: {
            findMany: jest.fn(),
            findFirst: jest.fn(),
        },
    },
    insert: jest.fn(),
    select: jest.fn(),
    update: jest.fn(),
};

describe("ClientsService", () => {
    let service: ClientsService;

    beforeEach(async () => {
        jest.clearAllMocks();
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ClientsService,
                { provide: DRIZZLE, useValue: mockDb },
            ],
        }).compile();

        service = module.get<ClientsService>(ClientsService);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    describe("create", () => {
        it("should create a new client", async () => {
            const createDto: CreateClientDto = {
                name: "Test Client",
                slugName: "test-client",
                isActive: true,
            };
            const createdClient = { clientId: "1", ...createDto };

            mockDb.insert.mockReturnValue({
                values: jest.fn().mockReturnValue({
                    returning: jest.fn().mockResolvedValue([createdClient]),
                }),
            });

            const result = await service.create(createDto);
            expect(result).toEqual(createdClient);
        });
    });

    describe("findAll", () => {
        it("should return paginated clients", async () => {
            const query = { page: 1, limit: 10 };
            const clients = [{ clientId: "1", name: "Test Client" }];
            const count = 1;

            mockDb.select.mockReturnValue({
                from: jest.fn().mockResolvedValue([{ count }]),
            });
            mockDb.query.clients.findMany.mockResolvedValue(clients);

            const result = await service.findAll(query);
            expect(result.data).toEqual(clients);
            expect(result.meta.total).toBe(count);
            expect(result.meta.page).toBe(1);
        });
    });

    describe("findOne", () => {
        it("should return a client if found", async () => {
            const client = { clientId: "1", name: "Test Client" };
            mockDb.query.clients.findFirst.mockResolvedValue(client);

            const result = await service.findOne("1");
            expect(result).toEqual(client);
        });

        it("should throw NotFoundException if client not found", async () => {
            mockDb.query.clients.findFirst.mockResolvedValue(null);

            await expect(service.findOne("1")).rejects.toThrow(NotFoundException);
        });
    });

    describe("update", () => {
        it("should update and return the client", async () => {
            const updateDto: UpdateClientDto = { isActive: false };
            const updatedClient = { clientId: "1", name: "Test Client", isActive: false };

            mockDb.update.mockReturnValue({
                set: jest.fn().mockReturnValue({
                    where: jest.fn().mockReturnValue({
                        returning: jest.fn().mockResolvedValue([updatedClient]),
                    }),
                }),
            });

            const result = await service.update("1", updateDto);
            expect(result).toEqual(updatedClient);
            expect(result.isActive).toBe(false);
        });

        it("should throw NotFoundException if client to update not found", async () => {
            mockDb.update.mockReturnValue({
                set: jest.fn().mockReturnValue({
                    where: jest.fn().mockReturnValue({
                        returning: jest.fn().mockResolvedValue([]),
                    }),
                }),
            });

            await expect(service.update("1", { isActive: false })).rejects.toThrow(
                NotFoundException,
            );
        });
    });
});
