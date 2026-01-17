import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export const envSchema = z
  .object({
    PORT: z.coerce.number({ error: "PORT is required" }),
    NODE_ENV: z.enum(["development", "production", "test"], {
      error: "NODE_ENV is required",
    }),
    JWT_SECRET: z.string({ error: "JWT_SECRET is required" }),
    JWT_EXPIRY: z.coerce.number({ error: "JWT_EXPIRY is required" }),
    AUTH_SESSION_VALIDITY_IN_SECONDS: z.coerce.number({ error: "AUTH_SESSION_VALIDITY_IN_SECONDS is required" }),
    REFRESH_TOKEN_VALIDITY_IN_SECONDS: z.coerce.number({ error: "REFRESH_TOKEN_VALIDITY_IN_SECONDS is required" }),
    WEBHOOK_DELIVERY_CONCURRENCY: z.coerce.number().optional().default(3),
  })
  .strip();

export type AppEnvConfig = z.infer<typeof envSchema>;

export const saneDefaults: Partial<Record<keyof AppEnvConfig, string>> = {
  PORT: "5000",
  NODE_ENV: "development",
  JWT_EXPIRY: process.env.JWT_EXPIRY,
  JWT_SECRET: process.env.JWT_SECRET,
  AUTH_SESSION_VALIDITY_IN_SECONDS: process.env.AUTH_SESSION_VALIDITY_IN_SECONDS || (60 * 60 * 24 * 14).toString(),
  REFRESH_TOKEN_VALIDITY_IN_SECONDS: process.env.REFRESH_TOKEN_VALIDITY_IN_SECONDS || (60 * 60 * 24 * 30).toString(),
  WEBHOOK_DELIVERY_CONCURRENCY: process.env.WEBHOOK_DELIVERY_CONCURRENCY || "3",
};

export class EnvDto extends createZodDto(envSchema) { }
