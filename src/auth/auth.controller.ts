import { Body, Controller, HttpCode, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
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
	login(@Body() dto: LoginDto) {
		return this.authService.login(dto);
	}

	@Post("refresh")
	@HttpCode(200)
	refresh(@Body() dto: RefreshDto) {
		return this.authService.refresh(dto);
	}

	@Post("logout")
	@HttpCode(200)
	@UseGuards(JwtGuard)
	@ApiBearerAuth("access-token")
	logout(@Body() dto: LogoutDto, @CurrentUser() user: { sub: string }) {
		return this.authService.logout(dto, user.sub);
	}
}
