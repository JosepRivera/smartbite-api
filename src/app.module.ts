import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { validate } from "@/config/env";
import { AuthModule } from "./auth/auth.module";
import { ExpensesModule } from "./expenses/expenses.module";
import { IngredientsModule } from "./ingredients/ingredients.module";
import { PrismaModule } from "./prisma/prisma.module";
import { ProductsModule } from "./products/products.module";
import { RecipesModule } from "./recipes/recipes.module";
import { SalesModule } from "./sales/sales.module";
import { SupabaseModule } from "./supabase/supabase.module";
import { UsersModule } from "./users/users.module";

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			validate,
		}),
		PrismaModule,
		SupabaseModule,
		AuthModule,
		UsersModule,
		ProductsModule,
		IngredientsModule,
		RecipesModule,
		SalesModule,
		ExpensesModule,
	],
})
export class AppModule {}
