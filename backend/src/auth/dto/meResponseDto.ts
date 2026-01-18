import { ApiProperty } from "@nestjs/swagger";

export class MeResponseDto {
    @ApiProperty({ description: "The unique identifier of the user" })
    userId: string;

    @ApiProperty({ description: "The role of the user (e.g. admin, user)" })
    role: string;

    @ApiProperty({ description: "The email address of the user" })
    email: string;
}
