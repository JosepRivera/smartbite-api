import {
	ConflictException,
	ForbiddenException,
	NotFoundException,
	UnprocessableEntityException,
} from "@nestjs/common";
import bcrypt from "bcrypt";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { UsersService } from "../users.service";

vi.mock("@/config/env", () => ({
	env: {
		BCRYPT_ROUNDS: 4,
	},
}));

const mockPrisma = {
	user: {
		findUnique: vi.fn(),
		findMany: vi.fn(),
		create: vi.fn(),
		update: vi.fn(),
		count: vi.fn(),
	},
};

const ownerUser = { sub: "owner-id", role: "OWNER" as const };
const cashierUser = { sub: "cashier-id", role: "CASHIER" as const };

describe("UsersService", () => {
	let service: UsersService;

	beforeEach(() => {
		vi.clearAllMocks();
		service = new UsersService(mockPrisma as never);
	});

	// U-AUTH-1
	it("create() hashea el password antes de guardarlo en DB", async () => {
		mockPrisma.user.findUnique.mockResolvedValue(null);
		mockPrisma.user.create.mockImplementation(({ data }: { data: { password: string } }) =>
			Promise.resolve({ id: "new-id", ...data, isActive: true }),
		);

		await service.create({
			name: "Empleado Test",
			username: "empleado01",
			password: "plain123",
			role: "CASHIER",
		});

		const savedPassword = mockPrisma.user.create.mock.calls[0][0].data.password as string;

		expect(savedPassword).not.toBe("plain123");
		expect(await bcrypt.compare("plain123", savedPassword)).toBe(true);
	});

	it("create() username ya existe → 409", async () => {
		mockPrisma.user.findUnique.mockResolvedValue({ id: "existing" });

		await expect(
			service.create({
				name: "Test",
				username: "yaexiste",
				password: "pass123",
				role: "WAITER",
			}),
		).rejects.toThrow(ConflictException);
	});

	it("findOne() OWNER puede ver cualquier usuario", async () => {
		mockPrisma.user.findUnique.mockResolvedValue({ id: "other-id", name: "Alguien" });

		const result = await service.findOne("other-id", ownerUser);

		expect(result).toHaveProperty("id", "other-id");
	});

	it("findOne() no-OWNER puede ver su propio perfil", async () => {
		mockPrisma.user.findUnique.mockResolvedValue({ id: "cashier-id", name: "Cajero" });

		const result = await service.findOne("cashier-id", cashierUser);

		expect(result).toHaveProperty("id", "cashier-id");
	});

	it("findOne() no-OWNER intenta ver perfil ajeno → 403", async () => {
		await expect(service.findOne("otro-id", cashierUser)).rejects.toThrow(ForbiddenException);
	});

	it("findOne() usuario no existe → 404", async () => {
		mockPrisma.user.findUnique.mockResolvedValue(null);

		await expect(service.findOne("no-existe", ownerUser)).rejects.toThrow(NotFoundException);
	});

	it("update() no-OWNER puede cambiar su propia contraseña", async () => {
		mockPrisma.user.findUnique.mockResolvedValue({ id: "cashier-id", role: "CASHIER" });
		mockPrisma.user.update.mockResolvedValue({ id: "cashier-id" });

		await service.update("cashier-id", { password: "nueva123" }, cashierUser);

		const updatedPassword = mockPrisma.user.update.mock.calls[0][0].data.password as string;
		expect(await bcrypt.compare("nueva123", updatedPassword)).toBe(true);
	});

	it("update() no-OWNER intenta cambiar perfil ajeno → 403", async () => {
		mockPrisma.user.findUnique.mockResolvedValue({ id: "otro-id" });

		await expect(service.update("otro-id", { password: "nueva123" }, cashierUser)).rejects.toThrow(
			ForbiddenException,
		);
	});

	it("update() no-OWNER intenta cambiar campos restringidos → 403", async () => {
		mockPrisma.user.findUnique.mockResolvedValue({ id: "cashier-id" });

		await expect(
			service.update("cashier-id", { name: "Nuevo Nombre" }, cashierUser),
		).rejects.toThrow(ForbiddenException);
	});

	it("update() OWNER puede cambiar cualquier campo", async () => {
		mockPrisma.user.findUnique.mockResolvedValueOnce({ id: "cashier-id" });
		mockPrisma.user.findUnique.mockResolvedValueOnce(null); // username not taken
		mockPrisma.user.update.mockResolvedValue({ id: "cashier-id", name: "Nuevo" });

		await service.update(
			"cashier-id",
			{ name: "Nuevo", username: "nuevo01", role: "WAITER" },
			ownerUser,
		);

		expect(mockPrisma.user.update).toHaveBeenCalledWith(
			expect.objectContaining({
				data: expect.objectContaining({ name: "Nuevo", username: "nuevo01", role: "WAITER" }),
			}),
		);
	});

	it("remove() desactiva al usuario (soft delete)", async () => {
		mockPrisma.user.findUnique.mockResolvedValue({
			id: "cashier-id",
			role: "CASHIER",
			isActive: true,
		});
		mockPrisma.user.update.mockResolvedValue({ id: "cashier-id", isActive: false });

		await service.remove("cashier-id");

		expect(mockPrisma.user.update).toHaveBeenCalledWith({
			where: { id: "cashier-id" },
			data: { isActive: false },
			omit: { password: true },
		});
	});

	it("remove() único OWNER activo → 422", async () => {
		mockPrisma.user.findUnique.mockResolvedValue({
			id: "owner-id",
			role: "OWNER",
			isActive: true,
		});
		mockPrisma.user.count.mockResolvedValue(1);

		await expect(service.remove("owner-id")).rejects.toThrow(UnprocessableEntityException);
	});

	it("remove() usuario no existe → 404", async () => {
		mockPrisma.user.findUnique.mockResolvedValue(null);

		await expect(service.remove("no-existe")).rejects.toThrow(NotFoundException);
	});
});
