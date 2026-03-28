import { config } from "dotenv";
import { z } from "zod";

// Solo carga el .env si no estamos en Docker (donde las vars ya vienen del entorno)
// En Docker, DATABASE_URL y demás ya están inyectadas por docker-compose.yml
if (process.env.NODE_ENV !== "production") {
	config();
}

/**
 * Custom Zod validator for duration strings (e.g., "15m", "7d", "1h", "500ms")
 * Supports: ms, s, m, h, d, w, y
 * @source Single source of truth for duration validation across the app
 */
const msString = z
	.string()
	.refine((val) => /^\d+\s*(ms|s|m|h|d|w|y)$/i.test(val), {
		message: "Invalid duration. Use formats like 15m, 7d, 1h, 500ms.",
	})
	.transform((val) => val.replace(/\s+/g, "").toLowerCase());

/**
 * Environment configuration schema
 * @source Single source of truth for all environment variables
 * Validates and provides type-safe access to configuration values
 */
export const envSchema = z.object({
	// Server Configuration
	PORT: z.coerce.number().int().positive().default(3000).describe("Server port"),
	NODE_ENV: z
		.enum(["development", "production", "test"])
		.default("development")
		.describe("Node environment"),

	// Database Configuration
	DATABASE_URL: z.string().optional().describe("PostgreSQL connection URL"),

	// JWT Configuration
	JWT_SECRET: z
		.string()
		.min(32, "JWT_SECRET must be at least 32 characters")
		.describe("Secret key for signing JWT tokens"),
	JWT_ACCESS_TOKEN_TTL: msString.default("15m").describe("Access token time-to-live"),
	JWT_REFRESH_TOKEN_TTL: msString.default("7d").describe("Refresh token time-to-live"),

	// Bcrypt Configuration
	BCRYPT_ROUNDS: z.coerce
		.number()
		.int()
		.min(4, "BCRYPT_ROUNDS must be at least 4")
		.max(15, "BCRYPT_ROUNDS must not exceed 15")
		.default(10)
		.describe("Number of bcrypt rounds for password hashing"),

	// CORS Configuration
	CORS_ORIGIN: z.string().url().optional().describe("CORS origin URL"),

	// Anthropic Claude API Configuration
	ANTHROPIC_API_KEY: z
		.string()
		.startsWith("sk-ant-")
		.optional()
		.describe("Anthropic API key for Claude models"),
	ANTHROPIC_MODEL: z.string().default("claude-sonnet-4-6").describe("Anthropic model to use"),
	CLAUDE_TIMEOUT_INTERACTIVE: z.coerce
		.number()
		.int()
		.positive()
		.default(10_000)
		.describe("Timeout (ms) for interactive Claude requests"),
	CLAUDE_TIMEOUT_BATCH: z.coerce
		.number()
		.int()
		.positive()
		.default(30_000)
		.describe("Timeout (ms) for batch Claude requests"),

	// Groq Whisper API Configuration
	GROQ_API_KEY: z.string().startsWith("gsk_").optional().describe("Groq API key for Whisper model"),
	GROQ_WHISPER_MODEL: z
		.string()
		.default("whisper-large-v3-turbo")
		.describe("Groq Whisper model to use"),
	GROQ_TIMEOUT: z.coerce
		.number()
		.int()
		.positive()
		.default(15_000)
		.describe("Timeout (ms) for Groq requests"),
});

/**
 * TypeScript type inferred from envSchema
 * Use this for type-safe environment variable access in services
 */
export type Env = z.infer<typeof envSchema>;

/**
 * Parsed environment variables
 * Validated at startup and cached for performance
 */
export const env = envSchema.parse(process.env);

/**
 * Validates a config object against the envSchema
 * Useful for testing or dynamic configuration
 */
export function validate(config: Record<string, unknown>): Env {
	return envSchema.parse(config);
}
