import { IsEnum, IsNumber, IsString, IsOptional } from "class-validator";
import { Type } from "class-transformer";

export enum Environment {
  Development = "development",
  Production = "production",
  Test = "test",
}

export class EnvDto {
  @Type(() => Number)
  @IsNumber()
  PORT: number = 5000;

  @IsEnum(Environment)
  NODE_ENV: Environment = Environment.Development;

  @IsString()
  JWT_SECRET: string;

  @Type(() => Number)
  @IsNumber()
  JWT_EXPIRY: number;

  @Type(() => Number)
  @IsNumber()
  AUTH_SESSION_VALIDITY_IN_SECONDS: number = 60 * 60 * 24 * 14;

  @Type(() => Number)
  @IsNumber()
  REFRESH_TOKEN_VALIDITY_IN_SECONDS: number = 60 * 60 * 24 * 30;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  WEBHOOK_DELIVERY_CONCURRENCY: number = 3;

  @IsString()
  @IsOptional()
  REDIS_HOST: string = "localhost";

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  REDIS_PORT: number = 6379;
}

export const saneDefaults: Record<string, any> = {
  PORT: "5000",
  NODE_ENV: "development",
  JWT_EXPIRY: process.env.JWT_EXPIRY,
  JWT_SECRET: process.env.JWT_SECRET,
  AUTH_SESSION_VALIDITY_IN_SECONDS: process.env.AUTH_SESSION_VALIDITY_IN_SECONDS || (60 * 60 * 24 * 14).toString(),
  REFRESH_TOKEN_VALIDITY_IN_SECONDS: process.env.REFRESH_TOKEN_VALIDITY_IN_SECONDS || (60 * 60 * 24 * 30).toString(),
  WEBHOOK_DELIVERY_CONCURRENCY: process.env.WEBHOOK_DELIVERY_CONCURRENCY || "3",
  REDIS_HOST: process.env.REDIS_HOST || 'localhost',
  REDIS_PORT: process.env.REDIS_PORT || '6379',
};
