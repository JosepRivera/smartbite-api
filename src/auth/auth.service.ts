import { createHash, randomBytes } from "node:crypto";
import { ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
import bcrypt from "bcrypt";
import { SignJWT } from "jose";
import ms from "ms";
import { env } from "@/config/env";
// biome-ignore lint/style/useImportType: required for NestJS DI
import { PrismaService, Role } from "@/prisma/prisma.service";
import type { Login } from "./dto/login.dto";
import type { Logout } from "./dto/logout.dto";
import type { Refresh } from "./dto/refresh.dto";

@Injectable()
export class AuthService {
	constructor(private readonly prisma: PrismaService) {}

	async login(dto: Login) {
		const user = await this.prisma.user.findUnique({
			where: { username: dto.username },
		});

		if (!user) {
			throw new UnauthorizedException("Credenciales incorrectas");
		}

		const passwordMatch = await bcrypt.compare(dto.password, user.password);

		if (!passwordMatch) {
			throw new UnauthorizedException("Credenciales incorrectas");
		}

		if (!user.isActive) {
			throw new ForbiddenException("Cuenta desactivada");
		}

		const accessToken = await this.signAccessToken(user.id, user.role);
		const { rawToken, tokenHash, expiresAt } = this.generateRefreshToken();

		await this.prisma.refreshToken.create({
			data: { userId: user.id, tokenHash, expiresAt },
		});

		return { access_token: accessToken, refresh_token: rawToken };
	}

	async refresh(dto: Refresh) {
		const tokenHash = this.hashToken(dto.refresh_token);

		const stored = await this.prisma.refreshToken.findUnique({
			where: { tokenHash },
			include: { user: true },
		});

		if (!stored) {
			throw new UnauthorizedException("Refresh token inválido");
		}

		if (stored.revokedAt !== null) {
			throw new UnauthorizedException("Refresh token revocado");
		}

		if (stored.expiresAt < new Date()) {
			throw new UnauthorizedException("Refresh token expirado");
		}

		const { rawToken, tokenHash: newHash, expiresAt } = this.generateRefreshToken();

		await this.prisma.$transaction(async (tx) => {
			await tx.refreshToken.update({
				where: { tokenHash },
				data: { revokedAt: new Date() },
			});
			await tx.refreshToken.create({
				data: { userId: stored.userId, tokenHash: newHash, expiresAt },
			});
		});

		const accessToken = await this.signAccessToken(stored.user.id, stored.user.role);

		return { access_token: accessToken, refresh_token: rawToken };
	}

	async logout(dto: Logout, userId: string) {
		const tokenHash = this.hashToken(dto.refresh_token);

		const stored = await this.prisma.refreshToken.findUnique({
			where: { tokenHash },
		});

		if (!stored || stored.userId !== userId) {
			throw new UnauthorizedException("Refresh token inválido");
		}

		await this.prisma.refreshToken.update({
			where: { tokenHash },
			data: { revokedAt: new Date() },
		});

		return { message: "Sesión cerrada" };
	}

	private async signAccessToken(userId: string, role: Role): Promise<string> {
		const secret = new TextEncoder().encode(env.JWT_SECRET);

		return new SignJWT({ sub: userId, role })
			.setProtectedHeader({ alg: "HS256" })
			.setIssuedAt()
			.setExpirationTime(env.JWT_ACCESS_TOKEN_TTL)
			.sign(secret);
	}

	private generateRefreshToken() {
		const rawToken = randomBytes(32).toString("hex");
		const tokenHash = this.hashToken(rawToken);
		const ttl = env.JWT_REFRESH_TOKEN_TTL as ms.StringValue;
		const expiresAt = new Date(Date.now() + ms(ttl));

		return { rawToken, tokenHash, expiresAt };
	}

	private hashToken(token: string): string {
		return createHash("sha256").update(token).digest("hex");
	}
}
