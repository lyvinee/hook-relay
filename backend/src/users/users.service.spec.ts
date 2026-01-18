import { Test, TestingModule } from "@nestjs/testing";
import { UsersService } from "./users.service";
import { DRIZZLE } from "@/database/database.module";
import { CreateUserDto } from "./dto/create-user.dto";
import { NotFoundException } from "@nestjs/common";

describe("UsersService", () => {
  let service: UsersService;
  let dbMock: any;

  const mockUser = {
    userId: "uuid",
    email: "test@example.com",
    role: "user",
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    dbMock = {
      insert: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      returning: jest.fn().mockResolvedValue([mockUser]),
      select: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      query: {
        users: {
          findMany: jest.fn().mockResolvedValue([mockUser]),
          findFirst: jest.fn().mockResolvedValue(mockUser),
        },
      },
      update: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: DRIZZLE, useValue: dbMock },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("create", () => {
    it("should create a user", async () => {
      const dto: CreateUserDto = { email: "test@example.com", role: "user" };
      const result = await service.create(dto);
      expect(result).toEqual(mockUser);
      expect(dbMock.insert).toHaveBeenCalled();
    });
  });

  describe("findAll", () => {
    it("should return paginated users", async () => {
      dbMock.select().from().where.mockResolvedValueOnce([{ count: 1 }]);
      const result = await service.findAll({ page: 1, limit: 10 });
      expect(result.data).toEqual([mockUser]);
      expect(result.meta.total).toBe(1);
    });
  });

  describe("findOne", () => {
    it("should return a user", async () => {
      const result = await service.findOne("uuid");
      expect(result).toEqual(mockUser);
    });

    it("should throw NotFoundException if user not found", async () => {
      dbMock.query.users.findFirst.mockResolvedValue(null);
      await expect(service.findOne("uuid")).rejects.toThrow(NotFoundException);
    });
  });

  describe("update", () => {
    it("should update a user", async () => {
      const dto = { email: "updated@example.com" };
      const updatedUser = { ...mockUser, ...dto };
      dbMock.returning.mockResolvedValueOnce([updatedUser]);

      const result = await service.update("uuid", dto);
      expect(result).toEqual(updatedUser);
    });

    it("should throw NotFoundException if user not found during update", async () => {
      dbMock.returning.mockResolvedValueOnce([]);
      await expect(service.update("uuid", { email: "updated@example.com" })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("updateStatus", () => {
    it("should update a user status", async () => {
      const updatedUser = { ...mockUser, status: "disabled" };
      dbMock.returning.mockResolvedValueOnce([updatedUser]);

      const result = await service.updateStatus("uuid", "disabled");
      expect(result).toEqual(updatedUser);
    });
  });
});
