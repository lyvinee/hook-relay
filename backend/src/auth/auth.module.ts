import { AuthController } from "@/auth/auth.controller";
import { AuthService } from "@/auth/auth.service";
import { EnvModule } from "@/env/env.module";
import { PasswordModule } from "@/password/password.module";
import { Module } from "@nestjs/common";

@Module({
  providers: [AuthService],
  exports: [AuthService],
  controllers: [AuthController],
  imports: [EnvModule, PasswordModule],
})
export class AuthModule { }
