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
import { ZodSerializerDto, ZodSerializerInterceptor, ZodResponse } from "nestjs-zod";
import { AuthGuard } from "@/common/guards/auth.guard";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { ApiStandardResponse } from "@/common/decorators/api-standard-response.decorator";

@ApiTags("Clients")
@ApiBearerAuth()
@ApiStandardResponse()
@Controller("clients")
@UseInterceptors(ZodSerializerInterceptor)
@UseGuards(AuthGuard)
export class ClientsController {
    constructor(private readonly clientsService: ClientsService) { }

    @Post()
    @ApiOperation({
        summary: "Register a new client",
        description: "Creates a new client record in the system using the provided name and slug. Returns the created client details.",
        operationId: "createClient",
    })
    @ZodResponse({
        type: ClientResponseDto,
        status: 201,
        description: "Client created successfully",
    })
    @ZodSerializerDto(ClientResponseDto)
    create(@Body() createClientDto: CreateClientDto) {
        return this.clientsService.create(createClientDto);
    }

    @Get()
    @ApiOperation({
        summary: "List clients with pagination",
        description: "Retrieves a paginated list of clients. Supports `page` and `limit` query parameters. Returns client data along with pagination metadata.",
        operationId: "listClients",
    })
    findAll(@Query() query: ListClientsDto) {
        return this.clientsService.findAll(query);
    }

    @Get(":id")
    @ApiOperation({
        summary: "Retrieve client details",
        description: "Fetches the details of a specific client identified by their UUID.",
        operationId: "getClientById",
    })
    @ZodResponse({
        type: ClientResponseDto,
        status: 200,
        description: "Client details retrieved successfully",
    })
    @ZodSerializerDto(ClientResponseDto)
    findOne(@Param("id") id: string) {
        return this.clientsService.findOne(id);
    }

    @Patch(":id")
    @ApiOperation({
        summary: "Update client information",
        description: "Updates the details of an existing client. Only provided fields are updated. Automatically updates the `updatedAt` timestamp.",
        operationId: "updateClient",
    })
    @ZodResponse({
        type: ClientResponseDto,
        status: 200,
        description: "Client updated successfully",
    })
    @ZodSerializerDto(ClientResponseDto)
    update(@Param("id") id: string, @Body() updateClientDto: UpdateClientDto) {
        return this.clientsService.update(id, updateClientDto);
    }
}
