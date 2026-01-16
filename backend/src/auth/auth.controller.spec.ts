import { Test, TestingModule } from "@nestjs/testing";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { EnvDto } from "@/env/dto/envDto";
import { UnauthorizedException } from "@nestjs/common";
import { Response, Request } from "express";
import { JwtService } from "@nestjs/jwt";

const mockAuthService = {
  login: jest.fn(),
  refresh: jest.fn(),
};

const mockConfig = {
  NODE_ENV: "test",
  AUTH_SESSION_VALIDITY_IN_SECONDS: 3600,
};

const mockJwtService = {};

describe("AuthController", () => {
  let controller: AuthController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: EnvDto, useValue: mockConfig },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("login", () => {
    it("should return access token and set refresh cookie", async () => {
      mockAuthService.login.mockResolvedValue({
        accessToken: "access_token",
        refreshToken: "refresh_token",
      });

      const res = {
        cookie: jest.fn(),
      } as unknown as Response;

      const body = { email: "test@example.com", password: "password" };
      const result = await controller.login(body, res);

      expect(mockAuthService.login).toHaveBeenCalledWith(body.email, body.password);
      expect(result).toEqual({ accessToken: "access_token" });
      expect(res.cookie).toHaveBeenCalledWith("refreshToken", "refresh_token", {
        httpOnly: true,
        secure: false, // test environment
        sameSite: "strict",
        maxAge: 3600000,
      });
    });
  });

  describe("refresh", () => {
    it("should throw UnauthorizedException if cookie is missing", async () => {
      const req = { cookies: {} } as unknown as Request;
      const res = { cookie: jest.fn() } as unknown as Response;

      await expect(controller.refresh(req, res)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it("should rotate info and return new access token", async () => {
      mockAuthService.refresh.mockResolvedValue({
        accessToken: "new_access",
        refreshToken: "new_refresh",
      });

      const req = {
        cookies: { refreshToken: "old_refresh" },
      } as unknown as Request;
      const res = {
        cookie: jest.fn(),
      } as unknown as Response;

      const result = await controller.refresh(req, res);

      expect(mockAuthService.refresh).toHaveBeenCalledWith("old_refresh");
      expect(result).toEqual({ accessToken: "new_access" });
      expect(res.cookie).toHaveBeenCalledWith("refreshToken", "new_refresh", {
        httpOnly: true,
        secure: false,
        sameSite: "strict",
        maxAge: 3600000,
      });
    });
  });

  describe("me", () => {
    it("should return user from request", async () => {
      const user = { userId: "uid", role: "admin", email: "test@example.com" };
      const req = { user } as any;

      const result = await controller.me(req);
      expect(result).toEqual(user);
    });
  });
});
