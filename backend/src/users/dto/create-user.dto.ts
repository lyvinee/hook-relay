import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsEmail, IsOptional } from "class-validator";
import { userRole, userStatus } from "@/db/schema";

export class CreateUserDto {
    @ApiProperty({ description: "The email of the user" })
    @IsEmail()
    email: string;

    @ApiProperty({ description: "The role of the user", enum: userRole.enumValues })
    @IsEnum(userRole.enumValues)
    role: typeof userRole.enumValues[number];

    @ApiProperty({ description: "The status of the user", enum: userStatus.enumValues, default: 'active' })
    @IsEnum(userStatus.enumValues)
    @IsOptional()
    status?: typeof userStatus.enumValues[number];
}
