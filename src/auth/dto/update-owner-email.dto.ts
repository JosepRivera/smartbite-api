import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export const UpdateOwnerEmailSchema = z.object({
	email: z.string().email("Formato de email inválido"),
});

export type UpdateOwnerEmailDto = z.infer<typeof UpdateOwnerEmailSchema>;

export class UpdateOwnerEmailDtoClass extends createZodDto(UpdateOwnerEmailSchema) {}
