import { ArgonPasswordHasher } from "@/password/argonPasswordHasher";
import { PasswordHasher } from "@/password/passwordHasher.abstract";
import { Module } from "@nestjs/common";

@Module({
  providers: [
    {
      provide: PasswordHasher,
      useClass: ArgonPasswordHasher,
    },
  ],
  exports: [PasswordHasher],
})
export class PasswordModule {}
