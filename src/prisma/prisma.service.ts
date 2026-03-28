import { Injectable, type OnModuleDestroy, type OnModuleInit } from "@nestjs/common";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client";
import { env } from "../config/env";

export type {
	CashClose as PrismaCashClose,
	DailyProductionPlan as PrismaDailyProductionPlan,
	DailySummary as PrismaDailySummary,
	DeviceToken as PrismaDeviceToken,
	Expense as PrismaExpense,
	Ingredient as PrismaIngredient,
	PaymentNotification as PrismaPaymentNotification,
	PaymentSource,
	Product as PrismaProduct,
	ProductProfitability as PrismaProductProfitability,
	Recipe as PrismaRecipe,
	ReferenceBaseline as PrismaReferenceBaseline,
	RefreshToken as PrismaRefreshToken,
	Role,
	Sale as PrismaSale,
	SaleItem as PrismaSaleItem,
	SaleStatus,
	User as PrismaUser,
} from "../../generated/prisma/client";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
	constructor() {
		const adapter = new PrismaPg({
			connectionString: env.DATABASE_URL,
		});

		super({ adapter });
	}

	async onModuleInit() {
		await this.$connect();
	}

	async onModuleDestroy() {
		await this.$disconnect();
	}
}
