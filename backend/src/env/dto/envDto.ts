import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export const envSchema = z
  .object({
    PORT: z.coerce.number({ error: "PORT is required" }),
    NODE_ENV: z.enum(["development", "production", "test"], {
      error: "NODE_ENV is required",
    }),
    DATABASE_URL: z.string({ error: "DATABASE_URL is required" }),
  })
  .strip();

export type AppEnvConfig = z.infer<typeof envSchema>;

export const saneDefaults: Partial<Record<keyof AppEnvConfig, string>> = {
  PORT: "5000",
  NODE_ENV: "development",
  DATABASE_URL: process.env.DATABASE_URL,
};

export class EnvDto extends createZodDto(envSchema) {}
