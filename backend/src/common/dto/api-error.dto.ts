import { ApiProperty } from "@nestjs/swagger";

export class ApiErrorDto {
    @ApiProperty({ example: 400 })
    statusCode: number;

    @ApiProperty({ example: "2024-01-01T00:00:00.000Z" })
    timestamp: string;

    @ApiProperty({ example: "/api/path" })
    path: string;

    @ApiProperty({
        example: "ErrorMessage",
        oneOf: [{ type: "string" }, { type: "object" }],
    })
    message: string | object;

    @ApiProperty({ example: "ErrorType" })
    error: string;
}
