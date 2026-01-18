import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { UsersService } from "@/users/users.service";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "@/common/guards/auth.guard";
import { ApiStandardResponse } from "@/common/decorators/api-standard-response.decorator";
import { CreateUserDto } from "./dto/create-user.dto";
import { ListUsersDto } from "./dto/list-users.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UserResponseDto } from "./dto/user-response.dto";

@ApiTags("Users")
@ApiBearerAuth()
@ApiStandardResponse()
@UseGuards(AuthGuard)
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  @ApiOperation({
    summary: "Create a new user",
    description: "Creates a new user with the provided details.",
    operationId: "createUser",
  })
  @ApiResponse({
    type: UserResponseDto,
    status: 201,
    description: "User created successfully",
  })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({
    summary: "List users with pagination and filters",
    description: "Retrieves a paginated list of users. Supports filtering by email, role, and status.",
    operationId: "listUsers",
  })
  findAll(@Query() query: ListUsersDto) {
    return this.usersService.findAll(query);
  }

  @Get(":id")
  @ApiOperation({
    summary: "Retrieve user details",
    description: "Fetches the details of a specific user identified by their UUID.",
    operationId: "getUserById",
  })
  @ApiResponse({
    type: UserResponseDto,
    status: 200,
    description: "User details retrieved successfully",
  })
  findOne(@Param("id") id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(":id")
  @ApiOperation({
    summary: "Update user information",
    description: "Updates the details of an existing user.",
    operationId: "updateUser",
  })
  @ApiResponse({
    type: UserResponseDto,
    status: 200,
    description: "User updated successfully",
  })
  update(@Param("id") id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Post(":id/enable")
  @ApiOperation({
    summary: "Enable a user",
    description: "Sets the user status to active.",
    operationId: "enableUser",
  })
  @ApiResponse({
    type: UserResponseDto,
    status: 200,
    description: "User enabled successfully",
  })
  enable(@Param("id") id: string) {
    return this.usersService.updateStatus(id, "active");
  }

  @Post(":id/disable")
  @ApiOperation({
    summary: "Disable a user",
    description: "Sets the user status to disabled.",
    operationId: "disableUser",
  })
  @ApiResponse({
    type: UserResponseDto,
    status: 200,
    description: "User disabled successfully",
  })
  disable(@Param("id") id: string) {
    return this.usersService.updateStatus(id, "disabled");
  }
}
