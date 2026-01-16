import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export const loginResponseSchema = z
  .object({
    accessToken: z.string({ error: "token is required" }),
  })
  .strip();

export class LoginResponseDto extends createZodDto(loginResponseSchema) { }
