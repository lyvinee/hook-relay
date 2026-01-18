import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export const loginBodySchema = z
  .object({
    email: z.email({ error: "email is required" }).describe("The user's email address"),
    password: z
      .string()
      .min(8, { error: "password is required" })
      .superRefine((arg, ctx) => {
        if (arg.length < 8) {
          ctx.addIssue({
            code: "too_small",
            minimum: 8,
            origin: "string",
            message: "password must be at least 8 characters",
            path: ["password"],
          });
        }

        if (!arg.match(/[A-Z]/)) {
          ctx.addIssue({
            code: "invalid_format",
            format: "uppercase",
            origin: "string",
            message: "password must contain at least one uppercase letter",
            path: ["password"],
          });
        }

        if (!arg.match(/[a-z]/)) {
          ctx.addIssue({
            code: "invalid_format",
            format: "lowercase",
            origin: "string",
            message: "password must contain at least one lowercase letter",
            path: ["password"],
          });
        }

        if (!arg.match(/\d/)) {
          ctx.addIssue({
            code: "invalid_format",
            format: "number",
            origin: "string",
            message: "password must contain at least one number",
            path: ["password"],
          });
        }
      }).describe("The user's password (min 8 chars, 1 uppercase, 1 lowercase, 1 number)"),
  })
  .strip();

export class LoginDto extends createZodDto(loginBodySchema) { }
