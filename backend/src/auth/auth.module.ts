import { AuthController } from "@/auth/auth.controller";
import { AuthService } from "@/auth/auth.service";
import { EnvModule } from "@/env/env.module";
import { PasswordModule } from "@/password/password.module";
import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { EnvDto } from "@/env/dto/envDto";

@Module({
  providers: [AuthService],
  exports: [AuthService, JwtModule],
  controllers: [AuthController],
  imports: [
    EnvModule,
    PasswordModule,
    JwtModule.registerAsync({
      imports: [EnvModule],
      useFactory: async (config: EnvDto) => ({
        secret: config.JWT_SECRET,
        signOptions: { expiresIn: config.JWT_EXPIRY },
      }),
      inject: [EnvDto],
    }),
  ],
})
export class AuthModule { }
