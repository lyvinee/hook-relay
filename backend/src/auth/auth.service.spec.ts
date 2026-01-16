import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "./auth.service";
import { DRIZZLE } from "@/database/database.module";
import { PasswordHasher } from "@/password/passwordHasher.abstract";
import { EnvDto } from "@/env/dto/envDto";
import { UnauthorizedException, InternalServerErrorException } from "@nestjs/common";
import { eq } from "drizzle-orm";

const mockDb = {
  query: {
    users: { findFirst: jest.fn() },
    refreshTokenSessions: { findFirst: jest.fn() },
  },
  transaction: jest.fn(),
  update: jest.fn(),
  insert: jest.fn(),
};

const mockPasswordHasher = {
  verify: jest.fn(),
  hash: jest.fn(),
  lookupHash: jest.fn(),
  createToken: jest.fn(),
};

const mockConfig = {
  AUTH_SESSION_VALIDITY_IN_SECONDS: 3600,
  JWT_SECRET: "secret",
  JWT_EXPIRY: "1h",
};

describe("AuthService", () => {
  let service: AuthService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: DRIZZLE, useValue: mockDb },
        { provide: PasswordHasher, useValue: mockPasswordHasher },
        { provide: EnvDto, useValue: mockConfig },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("login", () => {
    it("should throw UnauthorizedException if user not found", async () => {
      mockDb.query.users.findFirst.mockResolvedValue(null);

      await expect(service.login("test@example.com", "password")).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it("should throw UnauthorizedException if user inactive", async () => {
      mockDb.query.users.findFirst.mockResolvedValue({ status: "disabled" });

      await expect(service.login("test@example.com", "password")).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it("should throw UnauthorizedException if password verification fails", async () => {
      mockDb.query.users.findFirst.mockResolvedValue({
        userId: "uid",
        status: "active",
        authMethods: [{ secretHash: "hash" }],
      });
      mockPasswordHasher.verify.mockResolvedValue(false);

      await expect(service.login("test@example.com", "wrong")).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it("should return tokens on success", async () => {
      mockDb.query.users.findFirst.mockResolvedValue({
        userId: "uid",
        status: "active",
        authMethods: [{ secretHash: "hash" }],
      });
      mockPasswordHasher.verify.mockResolvedValue(true);
      mockPasswordHasher.createToken.mockReturnValue("new_refresh_token");
      mockPasswordHasher.hash.mockResolvedValue("hashed_token");
      mockPasswordHasher.lookupHash.mockReturnValue("lookup_hash");

      // Mock transaction flow
      mockDb.transaction.mockImplementation(async (cb) => {
        const tx = {
          insert: jest.fn().mockReturnValue({
            values: jest.fn().mockReturnValue({
              returning: jest.fn().mockResolvedValue([{ authSessionId: "sid" }])
            })
          }),
        };
        return cb(tx);
      });

      const result = await service.login("test@example.com", "pass");

      expect(result).toHaveProperty("accessToken");
      expect(result).toHaveProperty("refreshToken", "new_refresh_token");
    });
  });

  describe("refresh", () => {
    it("should throw UnauthorizedException if session not found", async () => {
      mockPasswordHasher.lookupHash.mockReturnValue("lookup");
      mockDb.query.refreshTokenSessions.findFirst.mockResolvedValue(null);

      await expect(service.refresh("token")).rejects.toThrow(UnauthorizedException);
    });

    it("should rotate token on success", async () => {
      mockPasswordHasher.lookupHash.mockReturnValue("lookup");
      mockDb.query.refreshTokenSessions.findFirst.mockResolvedValue({
        tokenHash: "hash",
        refreshTokenSessionId: "rid",
        authSessionId: "sid",
        authSession: { userId: "uid" },
        expiresAt: new Date(Date.now() + 10000)
      });
      mockPasswordHasher.verify.mockResolvedValue(true);
      mockPasswordHasher.createToken.mockReturnValue("new_token");

      // Mock transaction for rotation and creation
      mockDb.transaction.mockImplementation(async (cb) => {
        const tx = {
          update: jest.fn().mockReturnThis(),
          set: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          insert: jest.fn().mockReturnValue({
            values: jest.fn().mockReturnValue({
              returning: jest.fn().mockResolvedValue([{ authSessionId: "new_sid" }])
            })
          }),
        };
        return cb(tx);
      });

      const result = await service.refresh("valid_token");
      expect(result.refreshToken).toBe("new_token");
    });
  });
});
