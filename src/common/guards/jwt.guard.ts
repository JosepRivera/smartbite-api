import {
	type CanActivate,
	type ExecutionContext,
	Injectable,
	UnauthorizedException,
} from "@nestjs/common";
import { jwtVerify } from "jose";
import { env } from "@/config/env";

@Injectable()
export class JwtGuard implements CanActivate {
	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest();
		const authHeader = request.headers.authorization;

		if (!authHeader?.startsWith("Bearer ")) {
			throw new UnauthorizedException("Token ausente");
		}

		const token = authHeader.slice(7);

		try {
			const secret = new TextEncoder().encode(env.JWT_SECRET);
			const { payload } = await jwtVerify(token, secret);
			request.user = payload;
			return true;
		} catch {
			throw new UnauthorizedException("Token inválido o expirado");
		}
	}
}
