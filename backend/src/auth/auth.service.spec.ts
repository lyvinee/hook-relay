import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "./auth.service";
import { DRIZZLE } from "@/database/database.module";
import { PasswordHasher } from "@/password/passwordHasher.abstract";
import { EnvDto } from "@/env/dto/envDto";
import { UnauthorizedException, InternalServerErrorException } from "@nestjs/common";
import { eq } from "drizzle-orm";

import { JwtService } from "@nestjs/jwt";

const mockDb = {
  query: {
    users: { findFirst: jest.fn() },
    refreshTokenSessions: { findFirst: jest.fn() },
    authSessions: { findFirst: jest.fn() },
  },
  transaction: jest.fn(),
  update: jest.fn(),
  insert: jest.fn(),
  set: jest.fn(),
  where: jest.fn(),
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

const mockJwtService = {
  sign: jest.fn(),
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
        { provide: JwtService, useValue: mockJwtService },
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
      mockJwtService.sign.mockReturnValue("mocked_access_token");

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

      expect(result).toHaveProperty("accessToken", "mocked_access_token");
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
        authSession: { userId: "uid", status: "active", expiresAt: new Date(Date.now() + 10000) },
        expiresAt: new Date(Date.now() + 10000)
      });
      mockPasswordHasher.verify.mockResolvedValue(true);
      mockPasswordHasher.createToken.mockReturnValue("new_token");
      mockConfig.AUTH_SESSION_VALIDITY_IN_SECONDS = 3600;

      // Mock transaction flow
      mockDb.transaction.mockImplementation(async (cb) => {
        const tx = {
          update: jest.fn().mockReturnValue({
            set: jest.fn().mockReturnValue({
              where: jest.fn().mockResolvedValue({})
            })
          }),
          insert: jest.fn().mockReturnValue({
            values: jest.fn().mockResolvedValue({})
          }),
        };
        return cb(tx);
      });

      const result = await service.refresh("valid_token");
      expect(result.refreshToken).toBe("new_token");
      // Should sign with the SAME authSessionId
      expect(mockJwtService.sign).toHaveBeenCalledWith(expect.objectContaining({ authSessionId: "sid" }));
    });
  });
  describe("validateSession", () => {
    it("should return user details if session is valid", async () => {
      mockDb.query.authSessions.findFirst.mockResolvedValue({
        status: "active",
        expiresAt: new Date(Date.now() + 10000),
        user: { userId: "uid", role: "user", email: "test@example.com" }
      });

      const result = await service.validateSession("sid");
      expect(result).toEqual({ userId: "uid", role: "user", email: "test@example.com" });
    });

    it("should throw if session not found", async () => {
      mockDb.query.authSessions.findFirst.mockResolvedValue(null);
      await expect(service.validateSession("sid")).rejects.toThrow(UnauthorizedException);
    });

    it("should throw if session is not active", async () => {
      mockDb.query.authSessions.findFirst.mockResolvedValue({ status: "expired" });
      await expect(service.validateSession("sid")).rejects.toThrow(UnauthorizedException);
    });

    it("should expire session and throw if time has passed", async () => {
      mockDb.query.authSessions.findFirst.mockResolvedValue({
        status: "active",
        expiresAt: new Date(Date.now() - 1000), // Expired
        authSessionId: "sid"
      });

      mockDb.update.mockReturnThis();
      mockDb.set.mockReturnThis();
      mockDb.where.mockResolvedValue({});

      await expect(service.validateSession("sid")).rejects.toThrow(UnauthorizedException);

      // Verify we called update to expire it
      expect(mockDb.update).toHaveBeenCalled();
      expect(mockDb.set).toHaveBeenCalledWith({ status: "expired" });
    });
  });
});
