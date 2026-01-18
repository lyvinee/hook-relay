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
            status: "4XX",
            description: "Client Error (400, 401, 403, 404, etc)",
            type: ApiErrorDto,
        })
    );
}
