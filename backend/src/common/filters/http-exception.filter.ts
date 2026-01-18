import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(HttpExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        const status =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR;

        const message =
            exception instanceof HttpException
                ? exception.getResponse()
                : 'Internal server error';

        if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
            this.logger.error(
                `Internal Server Error: ${exception instanceof Error ? exception.message : exception}`,
                exception instanceof Error ? exception.stack : undefined,
            );
        }

        // Handle the structure of the message if it's an object (NestJS default)
        let errorMessage: string | object = message;
        let errorType = 'Error';

        if (typeof message === 'object' && message !== null) {
            const msgObj = message as any;
            if (msgObj.message) {
                errorMessage = msgObj.message;
            }
            if (msgObj.error) {
                errorType = msgObj.error;
            }
        } else {
            errorMessage = message;
            if (exception instanceof HttpException) {
                errorType = exception.name;
            }
        }


        response.status(status).json({
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            message: errorMessage,
            error: errorType,
        });
    }
}
