import { createZodDto } from "nestjs-zod";
import { z } from "zod";

/**
 * Schema for logout request
 * @source Single source of truth for logout validation
 */
export const LogoutSchema = z.object({
	refresh_token: z.string().min(1, "El refresh token es requerido"),
});

/**
 * TypeScript type inferred directly from LogoutSchema
 * Use this in services for type safety
 */
export type Logout = z.infer<typeof LogoutSchema>;

/**
 * NestJS DTO class for controller input validation
 * Inherits validation from LogoutSchema via createZodDto
 */
export class LogoutDto extends createZodDto(LogoutSchema) {}
