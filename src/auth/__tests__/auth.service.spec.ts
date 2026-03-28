import { ForbiddenException, UnauthorizedException } from "@nestjs/common";
import bcrypt from "bcrypt";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthService } from "../auth.service";

vi.mock("@/config/env", () => ({
	env: {
		JWT_SECRET: "test-secret-at-least-32-characters-long!!",
		JWT_ACCESS_TOKEN_TTL: "15m",
		JWT_REFRESH_TOKEN_TTL: "7d",
		BCRYPT_ROUNDS: 4,
	},
}));

const mockPrisma = {
	user: {
		findUnique: vi.fn(),
	},
	refreshToken: {
		create: vi.fn(),
		findUnique: vi.fn(),
		update: vi.fn(),
	},
	$transaction: vi.fn(),
};

describe("AuthService", () => {
	let service: AuthService;

	beforeEach(() => {
		vi.clearAllMocks();
		mockPrisma.$transaction.mockImplementation(
			async (callback: (tx: typeof mockPrisma) => Promise<unknown>) => callback(mockPrisma),
		);
		service = new AuthService(mockPrisma as never);
	});

	// U-AUTH-2
	it("login() usuario inexistente → 401", async () => {
		mockPrisma.user.findUnique.mockResolvedValue(null);

		await expect(service.login({ username: "noexiste", password: "password" })).rejects.toThrow(
			UnauthorizedException,
		);
	});

	// U-AUTH-3
	it("login() password incorrecto → 401", async () => {
		const hashed = await bcrypt.hash("correct", 4);
		mockPrisma.user.findUnique.mockResolvedValue({
			id: "uuid-1",
			username: "test",
			password: hashed,
			isActive: true,
			role: "CASHIER",
		});

		await expect(service.login({ username: "test", password: "wrong" })).rejects.toThrow(
			UnauthorizedException,
		);
	});

	// U-AUTH-3 extra: cuenta desactivada → 403
	it("login() cuenta desactivada → 403", async () => {
		const hashed = await bcrypt.hash("pass123", 4);
		mockPrisma.user.findUnique.mockResolvedValue({
			id: "uuid-1",
			username: "test",
			password: hashed,
			isActive: false,
			role: "CASHIER",
		});

		await expect(service.login({ username: "test", password: "pass123" })).rejects.toThrow(
			ForbiddenException,
		);
	});

	// U-AUTH-4
	it("login() OK → devuelve tokens y guarda hash en DB", async () => {
		const hashed = await bcrypt.hash("pass123", 4);
		mockPrisma.user.findUnique.mockResolvedValue({
			id: "uuid-1",
			username: "owner",
			password: hashed,
			isActive: true,
			role: "OWNER",
		});
		mockPrisma.refreshToken.create.mockResolvedValue({});

		const result = await service.login({ username: "owner", password: "pass123" });

		expect(result).toHaveProperty("access_token");
		expect(result).toHaveProperty("refresh_token");

		expect(mockPrisma.refreshToken.create).toHaveBeenCalledWith({
			data: expect.objectContaining({
				userId: "uuid-1",
				tokenHash: expect.any(String),
				expiresAt: expect.any(Date),
			}),
		});

		// El hash guardado nunca debe ser igual al token crudo devuelto
		const savedHash = mockPrisma.refreshToken.create.mock.calls[0][0].data.tokenHash as string;
		expect(savedHash).not.toBe(result.refresh_token);
		expect(savedHash).toHaveLength(64); // SHA-256 hex
	});

	// U-AUTH-5
	it("refresh() token revocado → 401", async () => {
		mockPrisma.refreshToken.findUnique.mockResolvedValue({
			tokenHash: "some-hash",
			revokedAt: new Date(),
			expiresAt: new Date(Date.now() + 86_400_000),
			userId: "uuid-1",
			user: { id: "uuid-1", role: "OWNER" },
		});

		await expect(service.refresh({ refresh_token: "any-token" })).rejects.toThrow(
			UnauthorizedException,
		);
	});

	// U-AUTH-5 extra: token expirado → 401
	it("refresh() token expirado → 401", async () => {
		mockPrisma.refreshToken.findUnique.mockResolvedValue({
			tokenHash: "some-hash",
			revokedAt: null,
			expiresAt: new Date(Date.now() - 1000),
			userId: "uuid-1",
			user: { id: "uuid-1", role: "OWNER" },
		});

		await expect(service.refresh({ refresh_token: "any-token" })).rejects.toThrow(
			UnauthorizedException,
		);
	});

	// U-AUTH-6
	it("refresh() rota el token: revoca el antiguo y crea uno nuevo", async () => {
		mockPrisma.refreshToken.findUnique.mockResolvedValue({
			tokenHash: "old-hash",
			revokedAt: null,
			expiresAt: new Date(Date.now() + 86_400_000 * 7),
			userId: "uuid-1",
			user: { id: "uuid-1", role: "OWNER" },
		});
		mockPrisma.refreshToken.update.mockResolvedValue({});
		mockPrisma.refreshToken.create.mockResolvedValue({});

		const result = await service.refresh({ refresh_token: "old-raw-token" });

		expect(result).toHaveProperty("access_token");
		expect(result).toHaveProperty("refresh_token");

		// Debe revocar el token antiguo
		expect(mockPrisma.refreshToken.update).toHaveBeenCalledWith({
			where: { tokenHash: expect.any(String) },
			data: { revokedAt: expect.any(Date) },
		});

		// Debe crear un nuevo token
		expect(mockPrisma.refreshToken.create).toHaveBeenCalledWith({
			data: expect.objectContaining({
				userId: "uuid-1",
				tokenHash: expect.any(String),
				expiresAt: expect.any(Date),
			}),
		});

		// El nuevo refresh token devuelto debe ser diferente al antiguo
		expect(result.refresh_token).not.toBe("old-raw-token");
	});

	// U-AUTH-7
	it("logout() revoca el token correctamente", async () => {
		const userId = "uuid-1";
		mockPrisma.refreshToken.findUnique.mockResolvedValue({
			tokenHash: "some-hash",
			userId,
		});
		mockPrisma.refreshToken.update.mockResolvedValue({});

		const result = await service.logout({ refresh_token: "raw-token" }, userId);

		expect(result).toEqual({ message: "Sesión cerrada" });
		expect(mockPrisma.refreshToken.update).toHaveBeenCalledWith({
			where: { tokenHash: expect.any(String) },
			data: { revokedAt: expect.any(Date) },
		});
	});

	it("logout() token de otro usuario → 401", async () => {
		mockPrisma.refreshToken.findUnique.mockResolvedValue({
			tokenHash: "some-hash",
			userId: "uuid-otro",
		});

		await expect(service.logout({ refresh_token: "raw-token" }, "uuid-1")).rejects.toThrow(
			UnauthorizedException,
		);
	});
});
