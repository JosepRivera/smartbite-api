import {
	Injectable,
	InternalServerErrorException,
	NotFoundException,
	UnauthorizedException,
} from "@nestjs/common";
import { env } from "@/config/env";
// biome-ignore lint/style/useImportType: required for NestJS DI
import { PrismaService } from "@/prisma/prisma.service";
// biome-ignore lint/style/useImportType: required for NestJS DI
import { SupabaseService } from "@/supabase/supabase.service";
import type { ForgotPasswordDto } from "./dto/forgot-password.dto";
import type { LoginDto } from "./dto/login.dto";
import type { RefreshDto } from "./dto/refresh.dto";
import type { ResetPasswordDto } from "./dto/reset-password.dto";
import type { UpdateOwnerEmailDto } from "./dto/update-owner-email.dto";

@Injectable()
export class AuthService {
	constructor(
		private readonly supabase: SupabaseService,
		private readonly prisma: PrismaService,
	) {}

	/**
	 * Login con usuario y contraseña.
	 * El email en Supabase Auth es sintético: {username}@smartbite.local.
	 * Supabase genera y firma el JWT — nosotros NO manejamos el JWT.
	 */
	async login(dto: LoginDto) {
		const email = `${dto.username}@smartbite.local`;

		const { data, error } = await this.supabase.admin.auth.signInWithPassword({
			email,
			password: dto.password,
		});

		if (error || !data.session) {
			throw new UnauthorizedException("Credenciales inválidas");
		}

		const user = await this.prisma.user.findUnique({
			where: { id: data.user.id },
			select: {
				id: true,
				name: true,
				username: true,
				role: true,
				isActive: true,
			},
		});

		if (!user) {
			throw new NotFoundException("Perfil de usuario no encontrado");
		}

		if (!user.isActive) {
			// Invalidar sesión recién creada — usuario desactivado
			await this.supabase.admin.auth.admin.signOut(data.user.id);
			throw new UnauthorizedException("Cuenta desactivada. Contactá al administrador.");
		}

		return {
			access_token: data.session.access_token,
			refresh_token: data.session.refresh_token,
			expires_in: data.session.expires_in,
			user,
		};
	}

	/**
	 * Cierra todas las sesiones activas del usuario.
	 * El JwtGuard ya validó el token antes de llegar acá.
	 */
	async logout(userId: string) {
		await this.supabase.admin.auth.admin.signOut(userId);
	}

	/**
	 * Renueva el access token con un refresh token válido.
	 * Supabase rota el refresh token en cada uso (refresh token rotation).
	 */
	async refresh(dto: RefreshDto) {
		// Usamos la REST API de Supabase directamente para renovar con solo el refresh_token.
		// El admin client tiene persistSession: false, así que no podemos usar refreshSession()
		// sin un access_token válido. La REST API no requiere el access_token previo.
		const response = await fetch(`${env.SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				apikey: env.SUPABASE_SERVICE_ROLE_KEY,
			},
			body: JSON.stringify({ refresh_token: dto.refresh_token }),
		});

		if (!response.ok) {
			throw new UnauthorizedException("Refresh token inválido o expirado");
		}

		const session = (await response.json()) as {
			access_token: string;
			refresh_token: string;
			expires_in: number;
		};

		return {
			access_token: session.access_token,
			refresh_token: session.refresh_token,
			expires_in: session.expires_in,
		};
	}

	/**
	 * Envía un email de recuperación de contraseña.
	 * Supabase gestiona el envío del email y el link de recuperación.
	 *
	 * Siempre retorna éxito para evitar email enumeration attacks.
	 */
	async forgotPassword(dto: ForgotPasswordDto) {
		// No lanzamos error si el email no existe — evita enumeration
		await this.supabase.admin.auth.resetPasswordForEmail(dto.email, {
			// El link en el email redirige acá. El cliente maneja el reset.
			redirectTo: env.CORS_ORIGIN ? `${env.CORS_ORIGIN}/reset-password` : undefined,
		});

		return {
			message: "Si el email existe, recibirás las instrucciones de recuperación.",
		};
	}

	/**
	 * Actualiza la contraseña del usuario autenticado.
	 * El usuario llega acá con el JWT de recovery que Supabase envió por email.
	 * JwtGuard valida el token y extrae el sub (userId).
	 */
	async resetPassword(userId: string, dto: ResetPasswordDto) {
		const { error } = await this.supabase.admin.auth.admin.updateUserById(userId, {
			password: dto.password,
		});

		if (error) {
			throw new InternalServerErrorException("Error actualizando la contraseña");
		}

		return { message: "Contraseña actualizada correctamente." };
	}

	/**
	 * Genera la URL de OAuth para Google.
	 * El cliente (web/mobile) abre esta URL en un browser o webview.
	 * Supabase redirige a /auth/callback después de la autenticación.
	 *
	 * Prerequisito: configurar el provider de Google en el dashboard de Supabase.
	 */
	async getGoogleOAuthUrl(redirectTo: string) {
		const { data, error } = await this.supabase.admin.auth.signInWithOAuth({
			provider: "google",
			options: {
				redirectTo,
				queryParams: {
					access_type: "offline",
					prompt: "consent",
				},
			},
		});

		if (error || !data.url) {
			throw new InternalServerErrorException("Error generando URL de OAuth");
		}

		return { url: data.url };
	}

	/**
	 * Intercambia el código de OAuth (PKCE) por una sesión.
	 * El cliente envía el `code` que Supabase incluyó en el callback URL.
	 *
	 * Restricción: solo la cuenta Google del primer OWNER registrado puede acceder.
	 * Cualquier otra cuenta Google recibe 401.
	 */
	async exchangeOAuthCode(code: string) {
		const { data, error } = await this.supabase.admin.auth.exchangeCodeForSession(code);

		if (error || !data.session) {
			throw new UnauthorizedException("Código OAuth inválido o expirado");
		}

		// Verificar que no haya otro OWNER registrado con distinto ID
		const existingOwner = await this.prisma.user.findFirst({
			where: { role: "OWNER" },
		});

		if (existingOwner && existingOwner.id !== data.user.id) {
			// Invalidar la sesión recién creada antes de rechazar
			await this.supabase.admin.auth.admin.signOut(data.user.id);
			throw new UnauthorizedException("Solo el dueño registrado puede acceder con Google.");
		}

		// Primera vez — crear perfil OWNER en nuestra BD
		const existing = await this.prisma.user.findUnique({
			where: { id: data.user.id },
		});

		if (!existing) {
			await this.prisma.user.create({
				data: {
					id: data.user.id,
					name: data.user.user_metadata?.full_name ?? data.user.email ?? "Usuario Google",
					username: data.user.email?.split("@")[0] ?? data.user.id.slice(0, 8),
					role: "OWNER",
				},
			});
		}

		return {
			access_token: data.session.access_token,
			refresh_token: data.session.refresh_token,
			expires_in: data.session.expires_in,
		};
	}

	/**
	 * Actualiza el email de Google del dueño en Supabase Auth.
	 * Solo funciona mientras el dueño tiene una sesión activa con su Gmail actual.
	 * Si pierde acceso al Gmail anterior, debe hacerse manualmente en el dashboard de Supabase.
	 */
	async updateOwnerEmail(userId: string, dto: UpdateOwnerEmailDto) {
		const { error } = await this.supabase.admin.auth.admin.updateUserById(userId, {
			email: dto.email,
			email_confirm: true,
		});

		if (error) {
			throw new InternalServerErrorException("Error actualizando el email");
		}

		return { message: "Email actualizado. Usá el nuevo Gmail para iniciar sesión." };
	}
}
