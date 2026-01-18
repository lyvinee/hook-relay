import { Test, TestingModule } from "@nestjs/testing";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { AuthGuard } from "@/common/guards/auth.guard";

describe("UsersController", () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUser = {
    userId: "uuid",
    email: "test@example.com",
    role: "user",
    status: "active",
  };

  const mockUsersService = {
    create: jest.fn().mockResolvedValue(mockUser),
    findAll: jest.fn().mockResolvedValue({ data: [mockUser], meta: { total: 1 } }),
    findOne: jest.fn().mockResolvedValue(mockUser),
    update: jest.fn().mockResolvedValue(mockUser),
    updateStatus: jest.fn().mockResolvedValue(mockUser),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("create", () => {
    it("should create a user", async () => {
      const dto: CreateUserDto = { email: "test@example.com", role: "user" };
      expect(await controller.create(dto)).toEqual(mockUser);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe("findAll", () => {
    it("should return users", async () => {
      const query = { page: 1, limit: 10 };
      expect(await controller.findAll(query)).toEqual({
        data: [mockUser],
        meta: { total: 1 },
      });
      expect(service.findAll).toHaveBeenCalledWith(query);
    });
  });

  describe("findOne", () => {
    it("should return a user", async () => {
      expect(await controller.findOne("uuid")).toEqual(mockUser);
      expect(service.findOne).toHaveBeenCalledWith("uuid");
    });
  });

  describe("update", () => {
    it("should update a user", async () => {
      const dto = { email: "updated@example.com" };
      expect(await controller.update("uuid", dto)).toEqual(mockUser);
      expect(service.update).toHaveBeenCalledWith("uuid", dto);
    });
  });

  describe("enable", () => {
    it("should enable a user", async () => {
      expect(await controller.enable("uuid")).toEqual(mockUser);
      expect(service.updateStatus).toHaveBeenCalledWith("uuid", "active");
    });
  });

  describe("disable", () => {
    it("should disable a user", async () => {
      expect(await controller.disable("uuid")).toEqual(mockUser);
      expect(service.updateStatus).toHaveBeenCalledWith("uuid", "disabled");
    });
  });
});
