import {
	ConflictException,
	ForbiddenException,
	Injectable,
	NotFoundException,
	UnprocessableEntityException,
} from "@nestjs/common";
import bcrypt from "bcrypt";
import { env } from "@/config/env";
// biome-ignore lint/style/useImportType: required for NestJS DI
import { PrismaService, Role } from "@/prisma/prisma.service";
import type { CreateUser } from "./dto/create-user.dto";
import type { UpdateUser } from "./dto/update-user.dto";

type RequestingUser = { sub: string; role: Role };

@Injectable()
export class UsersService {
	constructor(private readonly prisma: PrismaService) {}

	async findAll() {
		return this.prisma.user.findMany({
			omit: { password: true },
		});
	}

	async findOne(id: string, requestingUser: RequestingUser) {
		if (requestingUser.role !== "OWNER" && requestingUser.sub !== id) {
			throw new ForbiddenException("No tienes permiso para esta acción");
		}

		const user = await this.prisma.user.findUnique({
			where: { id },
			omit: { password: true },
		});

		if (!user) throw new NotFoundException("Usuario no encontrado");

		return user;
	}

	async create(dto: CreateUser) {
		const existing = await this.prisma.user.findUnique({
			where: { username: dto.username },
		});

		if (existing) throw new ConflictException("El username ya está en uso");

		const hashedPassword = await bcrypt.hash(dto.password, env.BCRYPT_ROUNDS);

		return this.prisma.user.create({
			data: {
				name: dto.name,
				username: dto.username,
				password: hashedPassword,
				role: dto.role,
			},
			omit: { password: true },
		});
	}

	async update(id: string, dto: UpdateUser, requestingUser: RequestingUser) {
		const user = await this.prisma.user.findUnique({ where: { id } });

		if (!user) throw new NotFoundException("Usuario no encontrado");

		if (requestingUser.role !== "OWNER") {
			if (requestingUser.sub !== id) {
				throw new ForbiddenException("No tienes permiso para esta acción");
			}

			const hasNonPasswordFields =
				dto.name !== undefined ||
				dto.username !== undefined ||
				dto.role !== undefined ||
				dto.is_active !== undefined;

			if (hasNonPasswordFields) {
				throw new ForbiddenException("Solo puedes cambiar tu contraseña");
			}

			if (!dto.password) {
				throw new ForbiddenException("Solo puedes cambiar tu contraseña");
			}

			const hashedPassword = await bcrypt.hash(dto.password, env.BCRYPT_ROUNDS);

			return this.prisma.user.update({
				where: { id },
				data: { password: hashedPassword },
				omit: { password: true },
			});
		}

		const data: {
			name?: string;
			username?: string;
			password?: string;
			role?: Role;
			isActive?: boolean;
		} = {};

		if (dto.name !== undefined) data.name = dto.name;

		if (dto.username !== undefined) {
			const taken = await this.prisma.user.findUnique({
				where: { username: dto.username },
			});
			if (taken && taken.id !== id) {
				throw new ConflictException("El username ya está en uso");
			}
			data.username = dto.username;
		}

		if (dto.password !== undefined) {
			data.password = await bcrypt.hash(dto.password, env.BCRYPT_ROUNDS);
		}

		if (dto.role !== undefined) data.role = dto.role;
		if (dto.is_active !== undefined) data.isActive = dto.is_active;

		return this.prisma.user.update({
			where: { id },
			data,
			omit: { password: true },
		});
	}

	async remove(id: string) {
		const user = await this.prisma.user.findUnique({ where: { id } });

		if (!user) throw new NotFoundException("Usuario no encontrado");

		if (user.role === "OWNER" && user.isActive) {
			const activeOwnerCount = await this.prisma.user.count({
				where: { role: "OWNER", isActive: true },
			});

			if (activeOwnerCount <= 1) {
				throw new UnprocessableEntityException("No se puede desactivar al único OWNER activo");
			}
		}

		return this.prisma.user.update({
			where: { id },
			data: { isActive: false },
			omit: { password: true },
		});
	}
}
