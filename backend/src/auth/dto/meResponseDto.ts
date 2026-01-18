import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export const meResponseSchema = z
    .object({
        userId: z.string().describe("The unique identifier of the user"),
        role: z.string().describe("The role of the user (e.g. admin, user)"),
        email: z.string().email().describe("The email address of the user"),
    })
    .describe("The user profile information");

export class MeResponseDto extends createZodDto(meResponseSchema) { }
