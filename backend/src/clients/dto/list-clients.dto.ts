import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsOptional, Max, Min } from "class-validator";
import { Type } from "class-transformer";

export class ListClientsDto {
    @ApiProperty({ description: "Page number for pagination", default: 1, required: false })
    @IsInt()
    @Min(1)
    @Type(() => Number)
    @IsOptional()
    page: number = 1;

    @ApiProperty({ description: "Number of items per page", default: 10, required: false })
    @IsInt()
    @Min(1)
    @Max(100)
    @Type(() => Number)
    @IsOptional()
    limit: number = 10;
}
