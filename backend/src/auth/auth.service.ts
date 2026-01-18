import { type DbType, DRIZZLE } from "@/database/database.module";
import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import * as schema from "@/db/schema";
import { eq } from "drizzle-orm";
import { PasswordHasher } from "@/password/passwordHasher.abstract";
import { JwtService } from "@nestjs/jwt";
import { EnvDto } from "@/env/dto/envDto";

@Injectable()
export class AuthService {
  constructor(
    @Inject(DRIZZLE) private readonly db: DbType,
    private readonly pwdHasher: PasswordHasher,
    @Inject() private readonly config: EnvDto,
    private readonly jwtService: JwtService,
  ) { }

  async login(email: string, password: string): Promise<{ accessToken: string, refreshToken: string }> {
    const user = await this.db.query.users.findFirst({
      where: eq(schema.users.email, email),
      columns: {
        userId: true,
        status: true,
        email: true,
        role: true
      },
      with: {
        authMethods: {
          where: eq(schema.authMethods.methodType, "password")
        }
      }
    });

    if (!user || user.status !== "active" || user.authMethods.length <= 0) {
      // Use generic error to prevent user enumeration
      throw new UnauthorizedException("Invalid credentials");
    }

    const secretHash = user.authMethods[0].secretHash;
    if (!secretHash) {
      // specific case where password is missing but user exists - arguably system error or forbidden
      // stick to safe defaults
      throw new UnauthorizedException("Invalid credentials");
    }

    const isValid = await this.pwdHasher.verify(password, secretHash);
    if (!isValid) throw new UnauthorizedException("Invalid credentials");

    return this.createSession(user.userId);
  }

  async refresh(refreshToken: string): Promise<{ accessToken: string, refreshToken: string }> {
    const lookupHash = this.pwdHasher.lookupHash(refreshToken);

    const existingSession = await this.db.query.refreshTokenSessions.findFirst({
      where: eq(schema.refreshTokenSessions.lookupHash, lookupHash),
      with: {
        authSession: true
      }
    });

    if (!existingSession) {
      throw new UnauthorizedException("Invalid refresh token");
    }

    // Verify the actual token against the slow hash
    const isValid = await this.pwdHasher.verify(refreshToken, existingSession.tokenHash);
    if (!isValid) throw new UnauthorizedException("Invalid refresh token");

    // Check if already rotated or expired
    if (existingSession.rotatedAt || new Date() > existingSession.expiresAt) {
      // Logic for unauthorized/reuse detection could go here (e.g. invalidate all user sessions)
      throw new UnauthorizedException("Invalid refresh token");
    }

    // Check if the underlying auth session is still valid
    if (!existingSession.authSession || existingSession.authSession.status !== "active" || new Date() > existingSession.authSession.expiresAt) {
      throw new UnauthorizedException("Session expired");
    }

    // Create new refresh token
    const newRefreshToken = this.pwdHasher.createToken();
    const newRefreshTokenHash = await this.pwdHasher.hash(newRefreshToken);
    const newLookupHash = this.pwdHasher.lookupHash(newRefreshToken);

    // Rotate: Invalidate old refresh session, create new one attached to SAME auth session
    await this.db.transaction(async (tx) => {
      await tx.update(schema.refreshTokenSessions).set({
        rotatedAt: new Date(),
      }).where(eq(schema.refreshTokenSessions.refreshTokenSessionId, existingSession.refreshTokenSessionId));

      await tx.insert(schema.refreshTokenSessions).values({
        tokenHash: newRefreshTokenHash,
        lookupHash: newLookupHash,
        authSessionId: existingSession.authSessionId,
        expiresAt: new Date(Date.now() + this.config.AUTH_SESSION_VALIDITY_IN_SECONDS * 1000), // aligning refresh token validity with session or config
      });
    });

    const payload = { uId: existingSession.authSession.userId, authSessionId: existingSession.authSessionId };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  private async createSession(userId: string): Promise<{ accessToken: string, refreshToken: string }> {
    const refreshToken = this.pwdHasher.createToken();
    const refreshTokenHash = await this.pwdHasher.hash(refreshToken);
    const lookupHash = this.pwdHasher.lookupHash(refreshToken);

    const response = await this.db.transaction(async (tx) => {
      const authSessionRaw = await tx.insert(schema.authSessions).values({
        expiresAt: new Date(Date.now() + this.config.AUTH_SESSION_VALIDITY_IN_SECONDS * 1000),
        userId: userId,
        status: "active",
      }).returning({ authSessionId: schema.authSessions.authSessionId });

      const authSessionId = authSessionRaw.at(0)?.authSessionId;

      if (!authSessionId) throw new InternalServerErrorException("Failed to create session");

      await tx.insert(schema.refreshTokenSessions).values({
        tokenHash: refreshTokenHash,
        lookupHash,
        authSessionId,
        expiresAt: new Date(Date.now() + this.config.AUTH_SESSION_VALIDITY_IN_SECONDS * 1000),
      });

      return { authSessionId, refreshToken };
    });

    const payload = { uId: userId, authSessionId: response.authSessionId };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      refreshToken: response.refreshToken,
    };
  }
  async validateSession(authSessionId: string): Promise<{ userId: string; role: string; email: string }> {
    const session = await this.db.query.authSessions.findFirst({
      where: eq(schema.authSessions.authSessionId, authSessionId),
      with: {
        user: true,
      },
    });

    if (!session || session.status !== "active") {
      throw new UnauthorizedException("Session invalid or expired");
    }

    if (new Date() > session.expiresAt) {
      await this.db.update(schema.authSessions)
        .set({ status: "expired" })
        .where(eq(schema.authSessions.authSessionId, authSessionId));

      throw new UnauthorizedException("Session expired");
    }

    return {
      userId: session.user.userId,
      role: session.user.role,
      email: session.user.email,
    };
  }
}
