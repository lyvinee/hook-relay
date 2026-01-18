import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class CreateClientDto {
    @ApiProperty({ description: "The name of the client" })
    @IsString()
    @MinLength(1, { message: "Name is required" })
    @MaxLength(200)
    name: string;

    @ApiProperty({ description: "Unique slug for the client" })
    @IsString()
    @MinLength(1, { message: "Slug name is required" })
    @MaxLength(200)
    slugName: string;

    @ApiProperty({ description: "Whether the client is active", default: false, required: false })
    @IsBoolean()
    @IsOptional()
    isActive: boolean = false;
}
