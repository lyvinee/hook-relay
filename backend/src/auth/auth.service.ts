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
import jwt from "jsonwebtoken";
import { EnvDto } from "@/env/dto/envDto";

@Injectable()
export class AuthService {
  constructor(
    @Inject(DRIZZLE) private readonly db: DbType,
    private readonly pwdHasher: PasswordHasher,
    @Inject() private readonly config: EnvDto,
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

    // Rotate: Invalidate old session
    await this.db.transaction(async (tx) => {
      await tx.update(schema.refreshTokenSessions).set({
        rotatedAt: new Date(),
      }).where(eq(schema.refreshTokenSessions.refreshTokenSessionId, existingSession.refreshTokenSessionId));

      await tx.update(schema.authSessions).set({
        status: "expired"
      }).where(eq(schema.authSessions.authSessionId, existingSession.authSessionId));
    });

    return this.createSession(existingSession.authSession.userId);
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

    const payload = { uId: userId };
    const accessToken = jwt.sign(payload, this.config.JWT_SECRET, { expiresIn: this.config.JWT_EXPIRY });

    return {
      accessToken,
      refreshToken: response.refreshToken,
    };
  }
}
