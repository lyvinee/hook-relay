import { createZodDto } from "nestjs-zod";
import { createClientSchema } from "./create-client.dto";

export const updateClientSchema = createClientSchema.partial().strip();

export class UpdateClientDto extends createZodDto(updateClientSchema) { }
