import { applyDecorators } from "@nestjs/common";
import { ApiResponse } from "@nestjs/swagger";
import { ApiErrorDto } from "../dto/api-error.dto";

export function ApiStandardResponse(options?: {
    status?: number;
    description?: string;
}) {
    return applyDecorators(
        ApiResponse({
            status: 500,
            description: "Internal Server Error",
            type: ApiErrorDto,
        }),
        ApiResponse({
            status: 400,
            description: "Bad Request",
            type: ApiErrorDto,
        }),
        ApiResponse({
            status: 401,
            description: "Unauthorized",
            type: ApiErrorDto,
        }),
        ApiResponse({
            status: 403,
            description: "Forbidden",
            type: ApiErrorDto,
        }),
        ApiResponse({
            status: 404,
            description: "Not Found",
            type: ApiErrorDto,
        }),
        ApiResponse({
            status: 409,
            description: "Conflict",
            type: ApiErrorDto,
        }),
        ApiResponse({
            status: 422,
            description: "Unprocessable Entity",
            type: ApiErrorDto,
        }),
        ApiResponse({
            status: 429,
            description: "Too Many Requests",
            type: ApiErrorDto,
        }),
        ApiResponse({
            status: 500,
            description: "Internal Server Error",
            type: ApiErrorDto,
        })
    );
}
