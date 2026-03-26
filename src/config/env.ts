import { config } from "dotenv";
import { z } from "zod";

// Solo carga el .env si no estamos en Docker (donde las vars ya vienen del entorno)
// En Docker, DATABASE_URL y demás ya están inyectadas por docker-compose.yml
if (process.env.NODE_ENV !== "production") {
	config();
}

const msString = z
	.string()
	.refine((val) => /^\d+\s*(ms|s|m|h|d|w|y)$/i.test(val), {
		error: "Invalid duration. Use formats like 15m, 7d, 1h, 500ms.",
	})
	.transform((val) => val.replace(/\s+/g, "").toLowerCase());

export const envSchema = z.object({
	PORT: z.coerce.number().int().positive().default(3000),
	NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
	DATABASE_URL: z.string().optional(),
	JWT_SECRET: z.string().min(32),
	JWT_ACCESS_TOKEN_TTL: msString.default("15m"),
	JWT_REFRESH_TOKEN_TTL: msString.default("7d"),
	BCRYPT_ROUNDS: z.coerce.number().int().min(4).max(15).default(10),
	CORS_ORIGIN: z.url().optional(),
	ANTHROPIC_API_KEY: z.string().startsWith("sk-ant-").optional(),
	ANTHROPIC_MODEL: z.string().default("claude-sonnet-4-6"),
	CLAUDE_TIMEOUT_INTERACTIVE: z.coerce.number().int().positive().default(10_000),
	CLAUDE_TIMEOUT_BATCH: z.coerce.number().int().positive().default(30_000),
	GROQ_API_KEY: z.string().startsWith("gsk_").optional(),
	GROQ_WHISPER_MODEL: z.string().default("whisper-large-v3-turbo"),
	GROQ_TIMEOUT: z.coerce.number().int().positive().default(15_000),
});

export type Env = z.infer<typeof envSchema>;

export const env = envSchema.parse(process.env);

export function validate(config: Record<string, unknown>): Env {
	return envSchema.parse(config);
}