import { ApiProperty } from "@nestjs/swagger";
import { userRole, userStatus } from "@/db/schema";

export class UserResponseDto {
    @ApiProperty({ description: "The unique identifier of the user" })
    userId: string;

    @ApiProperty({ description: "The email of the user" })
    email: string;

    @ApiProperty({ description: "The role of the user", enum: userRole.enumValues })
    role: typeof userRole.enumValues[number];

    @ApiProperty({ description: "The status of the user", enum: userStatus.enumValues })
    status: typeof userStatus.enumValues[number];

    @ApiProperty({ description: "When the user was activated", required: false, nullable: true })
    activatedAt: Date | null;

    @ApiProperty({ description: "When the user was created" })
    createdAt: Date;

    @ApiProperty({ description: "When the user was last updated" })
    updatedAt: Date;
}
