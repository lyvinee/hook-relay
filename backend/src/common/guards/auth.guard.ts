import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from "@nestjs/common";
import { Request } from "express";
import { AuthService } from "@/auth/auth.service";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private readonly authService: AuthService,
        private readonly jwtService: JwtService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        // FIXME: This is written to disable security for development/testing purposes. Remove this when moving to prod.
        // const DISABLE_SECURITY = true;
        // if (DISABLE_SECURITY) {
        //     return true;
        // }

        const request = context.switchToHttp().getRequest<Request>();
        const token = this.extractTokenFromHeader(request);
        if (!token) {
            throw new UnauthorizedException();
        }

        try {
            const payload = await this.jwtService.verifyAsync(token) as {
                authSessionId: string;
            };

            const user = await this.authService.validateSession(payload.authSessionId);

            request.user = user;
        } catch {
            throw new UnauthorizedException();
        }
        return true;
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(" ") ?? [];
        return type === "Bearer" ? token : undefined;
    }
}
