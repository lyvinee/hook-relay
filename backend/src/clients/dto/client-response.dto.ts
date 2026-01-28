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

  @ApiProperty({
    description: "Date when the client was created",
    nullable: true,
  })
  createdAt?: string | null;

  @ApiProperty({
    description: "Date when the client was last updated",
    nullable: true,
  })
  updatedAt?: string | null;
}

export class PaginationMetaDto {
  @ApiProperty({ description: "Total number of items" })
  total: number;

  @ApiProperty({ description: "Current page number" })
  page: number;

  @ApiProperty({ description: "Number of items per page" })
  limit: number;

  @ApiProperty({ description: "Total number of pages" })
  totalPages: number;
}

export class PaginatedClientResponseDto {
  @ApiProperty({ type: [ClientResponseDto], description: "List of clients" })
  data: ClientResponseDto[];

  @ApiProperty({ description: "Pagination metadata" })
  meta: PaginationMetaDto;
}
