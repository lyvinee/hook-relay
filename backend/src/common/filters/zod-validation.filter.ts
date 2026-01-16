import { ArgumentsHost, Catch, ExceptionFilter } from "@nestjs/common";
import { ZodValidationException } from "nestjs-zod";
import { ZodError } from "zod";

@Catch(ZodValidationException)
export class ZodValidationFilter implements ExceptionFilter<ZodValidationException> {
    catch(exception: ZodValidationException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const status = 400;

        const e = exception.getZodError()
        if (e instanceof ZodError) {
            return response.status(status).json({
                statusCode: status,
                message: "Validation failed",
                errors: e.issues.map((issue) => ({
                    path: issue.path,
                    message: issue.message,
                    code: issue.code,
                })),
            });
        }

        response.status(status).json({
            statusCode: status,
            message: "Validation failed",
            errors: "unknown",
        });
    }
}
