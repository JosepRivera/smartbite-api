import { createZodDto } from "nestjs-zod";
import { z } from "zod";

/**
 * Schema for refresh token request
 * @source Single source of truth for refresh token validation
 */
export const RefreshSchema = z.object({
	refresh_token: z.string().min(1, "El refresh token es requerido"),
});

/**
 * TypeScript type inferred directly from RefreshSchema
 * Use this in services for type safety
 */
export type Refresh = z.infer<typeof RefreshSchema>;

/**
 * NestJS DTO class for controller input validation
 * Inherits validation from RefreshSchema via createZodDto
 */
export class RefreshDto extends createZodDto(RefreshSchema) {}
