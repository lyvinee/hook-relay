import { Module } from "@nestjs/common";
import { ClientsService } from "./clients.service";
import { ClientsController } from "./clients.controller";
import { DatabaseModule } from "@/database/database.module";
import { AuthModule } from "@/auth/auth.module";

@Module({
    imports: [DatabaseModule, AuthModule],
    controllers: [ClientsController],
    providers: [ClientsService],
})
export class ClientsModule { }
