import { ApiProperty } from "@nestjs/swagger";

export class ValidationErrorItem {
    @ApiProperty({ description: "Path to the field that failed validation", example: ["email"] })
    path: (string | number)[];

    @ApiProperty({ description: "Validation error message", example: "Invalid email" })
    message: string;

    @ApiProperty({ description: "Zod error code", example: "invalid_string" })
    code: string;
}

export class ValidationErrorResponse {
    @ApiProperty({ example: 400 })
    statusCode: number;

    @ApiProperty({ example: "Validation failed" })
    message: string;

    @ApiProperty({ type: [ValidationErrorItem] })
    errors: ValidationErrorItem[];
}
