import { ApiProperty } from "@nestjs/swagger";

export class ClientResponseDto {
    @ApiProperty({ description: "Unique identifier of the client" })
    clientId: string;

    @ApiProperty({ description: "The name of the client" })
    name: string;

    @ApiProperty({ description: "Unique slug for the client" })
    slugName: string;

    @ApiProperty({ description: "Whether the client is active", nullable: true })
    isActive?: boolean | null;

    @ApiProperty({ description: "Date when the client was created", nullable: true })
    createdAt?: string | null;

    @ApiProperty({ description: "Date when the client was last updated", nullable: true })
    updatedAt?: string | null;
}
