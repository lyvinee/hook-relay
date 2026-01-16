import { AuthService } from "@/auth/auth.service";
import { LoginDto } from "@/auth/dto/loginBodyDto";
import { LoginResponseDto } from "@/auth/dto/loginResponseDto";
import { Body, Controller, Post, Res, UseInterceptors, Req, UnauthorizedException, Inject } from "@nestjs/common";
import { ApiBadRequestResponse, ApiBody } from "@nestjs/swagger";
import { ZodResponse, ZodSerializerDto, ZodSerializerInterceptor } from "nestjs-zod";
import { ValidationErrorResponse } from "@/common/dto/validation-error.dto";
import type { Response, Request } from "express";
import { EnvDto } from "@/env/dto/envDto";

@Controller("auth")
@UseInterceptors(ZodSerializerInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService, @Inject() private readonly config: EnvDto) { }

  @Post("login")
  @ApiBody({ type: LoginDto })
  @ZodResponse({
    type: LoginResponseDto,
    status: 200,
    description: "Login successful",
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
  @ZodResponse({
    type: LoginResponseDto,
    status: 200,
    description: "Refresh successful",
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
}
