import { IsEmail, IsString, MinLength, Matches } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class LoginDto {
  @ApiProperty({ description: "The user's email address" })
  @IsEmail({}, { message: "email is required" })
  email: string;

  @ApiProperty({ description: "The user's password (min 8 chars, 1 uppercase, 1 lowercase, 1 number)" })
  @IsString({ message: "password is required" })
  @MinLength(8, { message: "password must be at least 8 characters" })
  @Matches(/[A-Z]/, { message: "password must contain at least one uppercase letter" })
  @Matches(/[a-z]/, { message: "password must contain at least one lowercase letter" })
  @Matches(/\d/, { message: "password must contain at least one number" })
  password: string;
}
