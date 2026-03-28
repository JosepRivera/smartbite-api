import { createZodDto } from "nestjs-zod";
import { z } from "zod";

/**
 * Schema for login credentials
 * @source Single source of truth for login request validation
 */
export const LoginSchema = z.object({
	username: z.string().min(1, "El usuario es requerido"),
	password: z.string().min(1, "La contraseña es requerida"),
});

/**
 * TypeScript type inferred directly from LoginSchema
 * Use this in services for type safety
 */
export type Login = z.infer<typeof LoginSchema>;

/**
 * NestJS DTO class for controller input validation
 * Inherits validation from LoginSchema via createZodDto
 */
export class LoginDto extends createZodDto(LoginSchema) {}
