import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(3000),
  DELAY_MS: z.coerce.number().int('Delay must be an integer representing the miliseconds').default(5000),
  REDIS_URL: z.string().url("Given REDIS_URL isn't a valid URL"),
  DATABASE_URL: z.string().url("Given DATABASE_URL isn't a valid URL"),
  SELF_URL: z.string().url("Given SELF_URL isn't a valid URL").default("http://localhost:3000"),
  FETCHER_URL: z.string().url("Given FETCHER_URL isn't a valid URL"),
  MAIN_BACKEND_URL: z.string().url("Given MAIN_BACKEND_URL isn't a valid URL"),
  COOKIE_GETTER_URL: z.string().url("Given COOKIE_GETTER_URL isn't a valid URL"),
  WORKERS: z.coerce.number().int("The num of concurrent Workers must be an integer").default(1),
});

try {
  // eslint-disable-next-line node/no-process-env
  envSchema.parse(process.env);
}
catch (error) {
  if (error instanceof z.ZodError) {
    console.error("Error with Environment Variable:", error.flatten());
  }
  else {
    console.error(error);
  }
  process.exit(1);
}


// eslint-disable-next-line node/no-process-env
export const env = envSchema.parse(process.env);
