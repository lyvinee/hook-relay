import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsNumber, IsOptional, IsString, Min } from "class-validator";
import { userRole, userStatus } from "@/db/schema";
import { Type } from "class-transformer";

export class ListUsersDto {
    @ApiPropertyOptional({ description: "Page number", default: 1 })
    @IsNumber()
    @Min(1)
    @Type(() => Number)
    @IsOptional()
    page: number = 1;

    @ApiPropertyOptional({ description: "Items per page", default: 10 })
    @IsNumber()
    @Min(1)
    @Type(() => Number)
    @IsOptional()
    limit: number = 10;

    @ApiPropertyOptional({ description: "Filter by email (partial match)" })
    @IsString()
    @IsOptional()
    email?: string;

    @ApiPropertyOptional({ description: "Filter by role", enum: userRole.enumValues })
    @IsEnum(userRole.enumValues)
    @IsOptional()
    role?: typeof userRole.enumValues[number];

    @ApiPropertyOptional({ description: "Filter by status", enum: userStatus.enumValues })
    @IsEnum(userStatus.enumValues)
    @IsOptional()
    status?: typeof userStatus.enumValues[number];
}
