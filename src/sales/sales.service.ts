import {
	BadRequestException,
	Injectable,
	NotFoundException,
	UnprocessableEntityException,
} from "@nestjs/common";
import type { SaleGetPayload, SaleInclude, SaleWhereInput } from "@/generated/prisma/models/Sale";
// biome-ignore lint/style/useImportType: required for NestJS DI
import { PrismaService, SaleStatus } from "@/prisma/prisma.service";
import type { CreateSale } from "./dto/create-sale.dto";
import type { PaySale } from "./dto/pay-sale.dto";

const PAYMENT_STATUS: Record<PaySale["payment_method"], SaleStatus> = {
	CASH: SaleStatus.PAID_CASH,
	YAPE: SaleStatus.PAID_YAPE,
	PLIN: SaleStatus.PAID_PLIN,
	AGORA: SaleStatus.PAID_AGORA,
};

const SALE_INCLUDE = {
	items: {
		include: { product: { select: { id: true, name: true } } },
	},
	user: { select: { id: true, name: true, username: true } },
} satisfies SaleInclude;

type SaleFull = SaleGetPayload<{ include: typeof SALE_INCLUDE }>;

function formatSale(sale: SaleFull) {
	return {
		id: sale.id,
		status: sale.status,
		total: Number(sale.total),
		table_number: sale.tableNumber,
		customer_name: sale.customerName,
		created_at: sale.createdAt,
		user: sale.user,
		items: sale.items.map((item) => ({
			id: item.id,
			product_id: item.productId,
			product_name: item.product.name,
			quantity: item.quantity,
			unit_price: Number(item.unitPrice),
			subtotal: item.quantity * Number(item.unitPrice),
		})),
	};
}

@Injectable()
export class SalesService {
	constructor(private readonly prisma: PrismaService) {}

	async create(userId: string, dto: CreateSale) {
		const productIds = dto.items.map((i) => i.product_id);

		const products = await this.prisma.product.findMany({
			where: { id: { in: productIds }, isActive: true },
			select: { id: true, name: true, price: true },
		});

		if (products.length !== productIds.length) {
			const foundIds = new Set(products.map((p) => p.id));
			const missing = productIds.find((id) => !foundIds.has(id));
			throw new NotFoundException(`Producto no encontrado o inactivo: ${missing}`);
		}

		const priceMap = new Map(products.map((p) => [p.id, p.price]));

		const total = dto.items.reduce((acc, item) => {
			return acc + Number(priceMap.get(item.product_id)) * item.quantity;
		}, 0);

		const sale = await this.prisma.sale.create({
			data: {
				userId,
				status: SaleStatus.OPEN,
				total,
				tableNumber: dto.table_number,
				customerName: dto.customer_name,
				items: {
					create: dto.items.map((item) => ({
						productId: item.product_id,
						quantity: item.quantity,
						unitPrice: priceMap.get(item.product_id)!,
					})),
				},
			},
			include: SALE_INCLUDE,
		});

		return formatSale(sale);
	}

	async findAll(status?: string, date?: string) {
		const where: SaleWhereInput = {};

		if (status) {
			if (!(status in SaleStatus)) {
				throw new BadRequestException(`Estado inválido: ${status}`);
			}
			where.status = status as SaleStatus;
		}

		if (date) {
			const start = new Date(date);
			if (Number.isNaN(start.getTime())) {
				throw new BadRequestException("Fecha inválida. Formato esperado: YYYY-MM-DD");
			}
			const end = new Date(start);
			end.setDate(end.getDate() + 1);
			where.createdAt = { gte: start, lt: end };
		}

		const sales = await this.prisma.sale.findMany({
			where,
			orderBy: { createdAt: "desc" },
			include: SALE_INCLUDE,
		});

		return sales.map(formatSale);
	}

	async findOne(id: string) {
		const sale = await this.prisma.sale.findUnique({
			where: { id },
			include: SALE_INCLUDE,
		});

		if (!sale) throw new NotFoundException("Venta no encontrada");

		return formatSale(sale);
	}

	async pay(id: string, userId: string, dto: PaySale) {
		const sale = await this.prisma.sale.findUnique({
			where: { id },
			include: { items: true },
		});

		if (!sale) throw new NotFoundException("Venta no encontrada");
		if (sale.status !== SaleStatus.OPEN) {
			throw new UnprocessableEntityException(`La venta ya está en estado: ${sale.status}`);
		}

		const productIds = sale.items.map((i) => i.productId);

		const recipes = await this.prisma.recipe.findMany({
			where: { productId: { in: productIds } },
			select: { productId: true, ingredientId: true, quantity: true },
		});

		await this.prisma.$transaction(async (tx) => {
			await tx.sale.update({
				where: { id },
				data: {
					status: PAYMENT_STATUS[dto.payment_method],
					updatedBy: userId,
				},
			});

			const stockDeltas = new Map<string, number>();
			for (const item of sale.items) {
				for (const r of recipes.filter((r) => r.productId === item.productId)) {
					const delta = item.quantity * Number(r.quantity);
					stockDeltas.set(r.ingredientId, (stockDeltas.get(r.ingredientId) ?? 0) + delta);
				}
			}

			for (const [ingredientId, delta] of stockDeltas) {
				await tx.ingredient.update({
					where: { id: ingredientId },
					data: { stock: { decrement: delta } },
				});
			}
		});

		return { id, status: PAYMENT_STATUS[dto.payment_method] };
	}

	async cancel(id: string, userId: string) {
		const sale = await this.prisma.sale.findUnique({ where: { id } });

		if (!sale) throw new NotFoundException("Venta no encontrada");
		if (sale.status !== SaleStatus.OPEN) {
			throw new UnprocessableEntityException(`La venta ya está en estado: ${sale.status}`);
		}

		await this.prisma.sale.update({
			where: { id },
			data: {
				status: SaleStatus.CANCELLED,
				cancelledBy: userId,
				cancelledAt: new Date(),
			},
		});

		return { id, status: SaleStatus.CANCELLED };
	}
}
