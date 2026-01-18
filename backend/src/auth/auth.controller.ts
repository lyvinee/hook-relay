import { AuthService } from "@/auth/auth.service";
import { LoginDto } from "@/auth/dto/loginBodyDto";
import { LoginResponseDto } from "@/auth/dto/loginResponseDto";
import { MeResponseDto } from "@/auth/dto/meResponseDto";
import { Body, Controller, Post, Res, UseInterceptors, Req, UnauthorizedException, Inject, Get, UseGuards } from "@nestjs/common";
import { ApiBadRequestResponse, ApiBody, ApiOperation, ApiTags, ApiCookieAuth } from "@nestjs/swagger";
import { ZodResponse, ZodSerializerDto, ZodSerializerInterceptor } from "nestjs-zod";
import { ValidationErrorResponse } from "@/common/dto/validation-error.dto";
import type { Response, Request } from "express";
import { EnvDto } from "@/env/dto/envDto";
import { AuthGuard } from "@/common/guards/auth.guard";
import { ApiStandardResponse } from "@/common/decorators/api-standard-response.decorator";

@ApiTags("Auth")
@ApiStandardResponse()
@Controller("auth")
@UseInterceptors(ZodSerializerInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService, @Inject() private readonly config: EnvDto) { }

  @Post("login")
  @ApiOperation({
    summary: "Authenticate user and create session",
    description: "Authenticates a user with email and password. On success, creates a new session, sets an HTTP-only refresh token cookie, and returns a short-lived access token.",
    operationId: "authLogin"
  })
  @ApiBody({ type: LoginDto })
  @ZodResponse({
    type: LoginResponseDto,
    status: 200,
    description: "Login successful. Access token returned in body, refresh token set in cookie.",
  })
  @ApiBadRequestResponse({
    type: ValidationErrorResponse,
    description: "Validation failed",
  })
  @ZodSerializerDto(LoginResponseDto)
  async login(@Body() body: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { accessToken, refreshToken } = await this.authService.login(body.email, body.password);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: this.config.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: this.config.AUTH_SESSION_VALIDITY_IN_SECONDS * 1000,
    });

    return { accessToken };
  }

  @Post("refresh")
  @ApiOperation({
    summary: "Refresh session and rotate tokens",
    description: "Uses a valid refresh token cookie to issue a new access token. Rotates the refresh token to maintain session security and extends the session validity.",
    operationId: "authRefresh"
  })
  @ApiCookieAuth("refreshToken")
  @ZodResponse({
    type: LoginResponseDto,
    status: 200,
    description: "Refresh successful. New access token returned in body, new refresh token set in cookie.",
  })
  @ZodSerializerDto(LoginResponseDto)
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = (req as any).cookies?.["refreshToken"];
    if (!refreshToken) {
      throw new UnauthorizedException("Invalid refresh token");
    }

    const tokens = await this.authService.refresh(refreshToken);

    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: this.config.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: this.config.AUTH_SESSION_VALIDITY_IN_SECONDS * 1000,
    });

    return { accessToken: tokens.accessToken };
  }

  @Get("me")
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: "Get current authenticated user",
    description: "Retrieves the profile information (User ID, Email, Role) of the currently authenticated user based on the valid access token.",
    operationId: "authGetMe"
  })
  @ZodResponse({
    type: MeResponseDto,
    status: 200,
    description: "Current user profile retrieved successfully",
  })
  async me(@Req() req: Request) {
    if (!req.user) {
      throw new UnauthorizedException("User not found");
    }

    return req.user;
  }
}
