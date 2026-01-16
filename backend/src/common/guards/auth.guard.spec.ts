import { AuthGuard } from "./auth.guard";
import { TestingModule, Test } from "@nestjs/testing";
import { AuthService } from "@/auth/auth.service";
import { UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

describe("AuthGuard", () => {
    let guard: AuthGuard;
    let authService: AuthService;
    let jwtService: JwtService;

    const mockAuthService = {
        validateSession: jest.fn(),
    };

    const mockJwtService = {
        verifyAsync: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthGuard,
                { provide: AuthService, useValue: mockAuthService },
                { provide: JwtService, useValue: mockJwtService },
            ],
        }).compile();

        guard = module.get<AuthGuard>(AuthGuard);
        authService = module.get<AuthService>(AuthService);
        jwtService = module.get<JwtService>(JwtService);
    });

    it("should be defined", () => {
        expect(guard).toBeDefined();
    });

    it("should return true for valid token and session", async () => {
        const context = {
            switchToHttp: () => ({
                getRequest: () => ({
                    headers: { authorization: "Bearer valid_token" },
                }),
            }),
        } as any;

        mockJwtService.verifyAsync.mockResolvedValue({ authSessionId: "sid" });
        mockAuthService.validateSession.mockResolvedValue({ userId: "uid" });

        expect(await guard.canActivate(context)).toBe(true);
        expect(authService.validateSession).toHaveBeenCalledWith("sid");
    });

    it("should throw UnauthorizedException for missing token", async () => {
        const context = {
            switchToHttp: () => ({
                getRequest: () => ({
                    headers: {},
                }),
            }),
        } as any;

        await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
    });

    it("should throw UnauthorizedException for invalid token", async () => {
        const context = {
            switchToHttp: () => ({
                getRequest: () => ({
                    headers: { authorization: "Bearer invalid_token" },
                }),
            }),
        } as any;

        mockJwtService.verifyAsync.mockRejectedValue(new Error("Invalid"));

        await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
    });
});
