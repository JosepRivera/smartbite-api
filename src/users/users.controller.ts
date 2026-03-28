import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	Param,
	ParseUUIDPipe,
	Patch,
	Post,
	UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { Roles } from "@/common/decorators/roles.decorator";
import { JwtGuard } from "@/common/guards/jwt.guard";
import { RolesGuard } from "@/common/guards/roles.guard";
// biome-ignore lint/style/useImportType: required for NestJS DI
import { Role } from "@/prisma/prisma.service";
import type { CreateUserDto } from "./dto/create-user.dto";
import type { UpdateUserDto } from "./dto/update-user.dto";
// biome-ignore lint/style/useImportType: required for NestJS DI
import { UsersService } from "./users.service";

@ApiTags("users")
@Controller("users")
@UseGuards(JwtGuard, RolesGuard)
@ApiBearerAuth("access-token")
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@Get()
	@Roles("OWNER")
	findAll() {
		return this.usersService.findAll();
	}

	@Post()
	@Roles("OWNER")
	create(@Body() dto: CreateUserDto) {
		return this.usersService.create(dto);
	}

	@Get(":id")
	findOne(
		@Param("id", ParseUUIDPipe) id: string,
		@CurrentUser() user: { sub: string; role: Role },
	) {
		return this.usersService.findOne(id, user);
	}

	@Patch(":id")
	@HttpCode(200)
	update(
		@Param("id", ParseUUIDPipe) id: string,
		@Body() dto: UpdateUserDto,
		@CurrentUser() user: { sub: string; role: Role },
	) {
		return this.usersService.update(id, dto, user);
	}

	@Delete(":id")
	@Roles("OWNER")
	remove(@Param("id", ParseUUIDPipe) id: string) {
		return this.usersService.remove(id);
	}
}
