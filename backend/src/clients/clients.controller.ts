import {
    Body,
    Controller,
    Get,
    Param,
    Patch,
    Post,
    Query,
    UseGuards,
    UseInterceptors,
} from "@nestjs/common";
import { ClientsService } from "./clients.service";
import { CreateClientDto } from "./dto/create-client.dto";
import { UpdateClientDto } from "./dto/update-client.dto";
import { ListClientsDto } from "./dto/list-clients.dto";
import { ClientResponseDto } from "./dto/client-response.dto";
import { ZodSerializerDto, ZodSerializerInterceptor } from "nestjs-zod";
import { AuthGuard } from "@/common/guards/auth.guard";
import { ApiTags } from "@nestjs/swagger";

@ApiTags("Clients")
@Controller("clients")
@UseInterceptors(ZodSerializerInterceptor)
@UseGuards(AuthGuard)
export class ClientsController {
    constructor(private readonly clientsService: ClientsService) { }

    @Post()
    @ZodSerializerDto(ClientResponseDto)
    create(@Body() createClientDto: CreateClientDto) {
        return this.clientsService.create(createClientDto);
    }

    @Get()
    findAll(@Query() query: ListClientsDto) {
        return this.clientsService.findAll(query);
    }

    @Get(":id")
    @ZodSerializerDto(ClientResponseDto)
    findOne(@Param("id") id: string) {
        return this.clientsService.findOne(id);
    }

    @Patch(":id")
    @ZodSerializerDto(ClientResponseDto)
    update(@Param("id") id: string, @Body() updateClientDto: UpdateClientDto) {
        return this.clientsService.update(id, updateClientDto);
    }
}
