import { Body, Controller, HttpCode, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { JwtGuard } from "@/common/guards/jwt.guard";
// biome-ignore lint/style/useImportType: required for NestJS DI
import { AuthService } from "./auth.service";
import type { LoginDto } from "./dto/login.dto";
import type { LogoutDto } from "./dto/logout.dto";
import type { RefreshDto } from "./dto/refresh.dto";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post("login")
	@HttpCode(200)
	@ApiOperation({ summary: "Iniciar sesión", description: "Autentica al usuario y devuelve un access token y un refresh token." })
	@ApiResponse({ status: 200, description: "Login exitoso. Devuelve access_token y refresh_token." })
	@ApiResponse({ status: 400, description: "Campos requeridos faltantes o inválidos." })
	@ApiResponse({ status: 401, description: "Credenciales incorrectas." })
	@ApiResponse({ status: 403, description: "Cuenta desactivada." })
	login(@Body() dto: LoginDto) {
		return this.authService.login(dto);
	}

	@Post("refresh")
	@HttpCode(200)
	@ApiOperation({ summary: "Renovar tokens", description: "Rota el refresh token y emite un nuevo par de tokens. El token enviado queda revocado." })
	@ApiResponse({ status: 200, description: "Tokens renovados correctamente." })
	@ApiResponse({ status: 401, description: "Refresh token inválido, revocado o expirado." })
	refresh(@Body() dto: RefreshDto) {
		return this.authService.refresh(dto);
	}

	@Post("logout")
	@HttpCode(200)
	@UseGuards(JwtGuard)
	@ApiBearerAuth("access-token")
	@ApiOperation({ summary: "Cerrar sesión", description: "Revoca el refresh token de la sesión actual." })
	@ApiResponse({ status: 200, description: "Sesión cerrada correctamente." })
	@ApiResponse({ status: 401, description: "Token ausente, inválido o expirado." })
	logout(@Body() dto: LogoutDto, @CurrentUser() user: { sub: string }) {
		return this.authService.logout(dto, user.sub);
	}
}
