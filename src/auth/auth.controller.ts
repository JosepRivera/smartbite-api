import { Body, Controller, Get, HttpCode, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Roles } from "@/common/decorators/roles.decorator";
import { RolesGuard } from "@/common/guards/roles.guard";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { JwtGuard } from "@/common/guards/jwt.guard";
// biome-ignore lint/style/useImportType: required for NestJS DI
import { AuthService } from "./auth.service";
import type { ForgotPasswordDtoClass } from "./dto/forgot-password.dto";
import type { LoginDtoClass } from "./dto/login.dto";
import type { RefreshDtoClass } from "./dto/refresh.dto";
import type { ResetPasswordDtoClass } from "./dto/reset-password.dto";
import type { UpdateOwnerEmailDtoClass } from "./dto/update-owner-email.dto";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post("login")
	@HttpCode(200)
	@ApiOperation({
		summary: "Login con usuario y contraseña",
		description:
			"Autentica al usuario y retorna access_token + refresh_token emitidos por Supabase Auth. " +
			"El JWT es válido para todas las rutas protegidas con JwtGuard.",
	})
	@ApiResponse({ status: 200, description: "Login exitoso. Retorna tokens y perfil del usuario." })
	@ApiResponse({ status: 401, description: "Credenciales inválidas o cuenta desactivada." })
	login(@Body() dto: LoginDtoClass) {
		return this.authService.login(dto);
	}

	@Post("logout")
	@HttpCode(204)
	@UseGuards(JwtGuard)
	@ApiBearerAuth("access-token")
	@ApiOperation({
		summary: "Cerrar sesión",
		description: "Invalida todas las sesiones activas del usuario en Supabase Auth.",
	})
	@ApiResponse({ status: 204, description: "Sesión cerrada correctamente." })
	@ApiResponse({ status: 401, description: "Token ausente o inválido." })
	async logout(@CurrentUser() user: { sub: string }) {
		await this.authService.logout(user.sub);
	}

	@Post("refresh")
	@HttpCode(200)
	@ApiOperation({
		summary: "Renovar access token",
		description:
			"Renueva el access_token usando el refresh_token. " +
			"Supabase rota el refresh_token en cada uso (refresh token rotation habilitado por defecto).",
	})
	@ApiResponse({ status: 200, description: "Tokens renovados correctamente." })
	@ApiResponse({ status: 401, description: "Refresh token inválido o expirado." })
	refresh(@Body() dto: RefreshDtoClass) {
		return this.authService.refresh(dto);
	}

	@Post("forgot-password")
	@HttpCode(200)
	@ApiOperation({
		summary: "Solicitar recuperación de contraseña",
		description:
			"Supabase envía un email con el link de recuperación. " +
			"Siempre retorna éxito para evitar email enumeration.",
	})
	@ApiResponse({ status: 200, description: "Instrucciones enviadas (si el email existe)." })
	forgotPassword(@Body() dto: ForgotPasswordDtoClass) {
		return this.authService.forgotPassword(dto);
	}

	@Post("reset-password")
	@HttpCode(200)
	@UseGuards(JwtGuard)
	@ApiBearerAuth("access-token")
	@ApiOperation({
		summary: "Cambiar contraseña con token de recuperación",
		description:
			"El usuario llega acá con el JWT de recovery que Supabase envió por email. " +
			"Enviar ese token en el header Authorization: Bearer <recovery_token>.",
	})
	@ApiResponse({ status: 200, description: "Contraseña actualizada correctamente." })
	@ApiResponse({ status: 401, description: "Token de recuperación inválido o expirado." })
	@ApiResponse({ status: 500, description: "Error interno al actualizar la contraseña." })
	resetPassword(@CurrentUser() user: { sub: string }, @Body() dto: ResetPasswordDtoClass) {
		return this.authService.resetPassword(user.sub, dto);
	}

	@Get("google")
	@ApiOperation({
		summary: "Obtener URL de login con Google",
		description:
			"Retorna la URL de OAuth de Google generada por Supabase. " +
			"El cliente abre esa URL en un browser o webview. " +
			"Prerequisito: Google OAuth configurado en el dashboard de Supabase.",
	})
	@ApiQuery({
		name: "redirect_to",
		required: false,
		description:
			"URL a la que Supabase redirige después del OAuth (debe ser un dominio permitido en Supabase)",
	})
	@ApiResponse({ status: 200, description: "URL de OAuth generada correctamente." })
	getGoogleUrl(@Query("redirect_to") redirectTo?: string) {
		const callbackUrl = redirectTo ?? `${process.env.SUPABASE_URL}/auth/v1/callback`;
		return this.authService.getGoogleOAuthUrl(callbackUrl);
	}

	@Get("callback")
	@ApiOperation({
		summary: "Callback de OAuth (Google)",
		description:
			"Supabase redirige acá después del login con Google con un `code` en la query. " +
			"Intercambia el code por tokens de sesión.",
	})
	@ApiQuery({ name: "code", required: true, description: "Código OAuth recibido de Supabase" })
	@ApiResponse({ status: 200, description: "Autenticación con Google exitosa. Retorna tokens." })
	@ApiResponse({ status: 401, description: "Código OAuth inválido o expirado." })
	callback(@Query("code") code: string) {
		return this.authService.exchangeOAuthCode(code);
	}

	@Patch("owner-email")
	@HttpCode(200)
	@UseGuards(JwtGuard, RolesGuard)
	@Roles("OWNER")
	@ApiBearerAuth("access-token")
	@ApiOperation({
		summary: "Actualizar Gmail del dueño",
		description:
			"Actualiza el email de Google del dueño en Supabase Auth. " +
			"Solo funciona mientras el dueño tiene una sesión activa. " +
			"Si ya perdió acceso al Gmail anterior, debe hacerlo desde el dashboard de Supabase.",
	})
	@ApiResponse({ status: 200, description: "Email actualizado correctamente." })
	@ApiResponse({ status: 401, description: "Token ausente o inválido." })
	@ApiResponse({ status: 403, description: "Rol sin permiso (requiere OWNER)." })
	@ApiResponse({ status: 500, description: "Error al actualizar en Supabase." })
	updateOwnerEmail(
		@CurrentUser() user: { sub: string },
		@Body() dto: UpdateOwnerEmailDtoClass,
	) {
		return this.authService.updateOwnerEmail(user.sub, dto);
	}
}
