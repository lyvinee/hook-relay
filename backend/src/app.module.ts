import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { UsersModule } from "./users/users.module";
import { DatabaseService } from "./database/database.service";
import { DatabaseModule } from "./database/database.module";
import { EnvModule } from "./env/env.module";
import { PasswordModule } from './password/password.module';

@Module({
  imports: [DatabaseModule, EnvModule, UsersModule, PasswordModule],
  controllers: [AppController],
  providers: [AppService, DatabaseService],
})
export class AppModule {}
