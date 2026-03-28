import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { validate } from "@/config/env";
import { AuthModule } from "./auth/auth.module";
import { PrismaModule } from "./prisma/prisma.module";
import { UsersModule } from "./users/users.module";

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			validate,
		}),
		PrismaModule,
		AuthModule,
		UsersModule,
	],
})
export class AppModule {}
