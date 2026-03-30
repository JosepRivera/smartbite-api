import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import bcrypt from "bcrypt";
import { ZodValidationPipe } from "nestjs-zod";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { AppModule } from "@/app.module";
import { TransformInterceptor } from "@/common/interceptors/transform.interceptor";
import { PrismaService } from "@/prisma/prisma.service";

describe("Auth E2E", () => {
	let app: INestApplication;
	let prisma: PrismaService;

	const ownerUsername = `e2e_owner_${Date.now()}`;
	const cashierUsername = `e2e_cashier_${Date.now()}`;
	const password = "password123";

	let ownerId: string;
	let cashierId: string;
	let ownerAccessToken: string;
	let ownerRefreshToken: string;
	let cashierAccessToken: string;

	beforeAll(async () => {
		const moduleFixture = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = moduleFixture.createNestApplication();
		app.setGlobalPrefix("api/v1");
		app.useGlobalPipes(new ZodValidationPipe());
		app.useGlobalInterceptors(new TransformInterceptor());
		await app.init();

		prisma = app.get(PrismaService);

		const hashed = await bcrypt.hash(password, 4);

		const owner = await prisma.user.create({
			data: { name: "Owner E2E", username: ownerUsername, password: hashed, role: "OWNER" },
		});
		const cashier = await prisma.user.create({
			data: {
				name: "Cashier E2E",
				username: cashierUsername,
				password: hashed,
				role: "CASHIER",
			},
		});

		ownerId = owner.id;
		cashierId = cashier.id;
	});

	afterAll(async () => {
		await prisma.refreshToken.deleteMany({
			where: { userId: { in: [ownerId, cashierId] } },
		});
		await prisma.user.deleteMany({
			where: { id: { in: [ownerId, cashierId] } },
		});
		await app.close();
	});

	// E-AUTH-1
	it("E-AUTH-1: login() con credenciales válidas → 200 + access_token + refresh_token", async () => {
		const res = await request(app.getHttpServer())
			.post("/api/v1/auth/login")
			.send({ username: ownerUsername, password })
			.expect(200);

		expect(res.body.data).toHaveProperty("access_token");
		expect(res.body.data).toHaveProperty("refresh_token");

		ownerAccessToken = res.body.data.access_token as string;
		ownerRefreshToken = res.body.data.refresh_token as string;

		// Login con cashier también para tests posteriores
		const cashierRes = await request(app.getHttpServer())
			.post("/api/v1/auth/login")
			.send({ username: cashierUsername, password });

		cashierAccessToken = cashierRes.body.data.access_token as string;
	});

	// E-AUTH-2
	it("E-AUTH-2: endpoint protegido sin Authorization → 401", async () => {
		await request(app.getHttpServer()).get("/api/v1/users").expect(401);
	});

	// E-AUTH-3
	it("E-AUTH-3: refresh() devuelve nuevos tokens y revoca el anterior", async () => {
		const res = await request(app.getHttpServer())
			.post("/api/v1/auth/refresh")
			.send({ refresh_token: ownerRefreshToken })
			.expect(200);

		expect(res.body.data).toHaveProperty("access_token");
		expect(res.body.data).toHaveProperty("refresh_token");

		const newRefreshToken = res.body.data.refresh_token as string;
		expect(newRefreshToken).not.toBe(ownerRefreshToken);

		// El token anterior debe estar revocado
		const revokedRes = await request(app.getHttpServer())
			.post("/api/v1/auth/refresh")
			.send({ refresh_token: ownerRefreshToken })
			.expect(401);

		expect(revokedRes.body).toHaveProperty("statusCode", 401);

		// Actualizar el token para los siguientes tests
		ownerAccessToken = res.body.data.access_token as string;
		ownerRefreshToken = newRefreshToken;
	});

	// E-AUTH-4
	it("E-AUTH-4: logout() revoca el refresh token, ya no se puede usar", async () => {
		await request(app.getHttpServer())
			.post("/api/v1/auth/logout")
			.set("Authorization", `Bearer ${ownerAccessToken}`)
			.send({ refresh_token: ownerRefreshToken })
			.expect(200);

		// El refresh token revocado no puede generar nuevos access tokens
		await request(app.getHttpServer())
			.post("/api/v1/auth/refresh")
			.send({ refresh_token: ownerRefreshToken })
			.expect(401);

		// Re-login para obtener tokens frescos para el siguiente test
		const loginRes = await request(app.getHttpServer())
			.post("/api/v1/auth/login")
			.send({ username: ownerUsername, password });

		ownerAccessToken = loginRes.body.data.access_token as string;
		ownerRefreshToken = loginRes.body.data.refresh_token as string;
	});

	// E-AUTH-5
	it("E-AUTH-5: endpoint de OWNER con token de CASHIER → 403", async () => {
		await request(app.getHttpServer())
			.get("/api/v1/users")
			.set("Authorization", `Bearer ${cashierAccessToken}`)
			.expect(403);
	});
});
