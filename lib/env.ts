import { z } from 'zod'

const envSchema = z.object({
  OPENAI_API_KEY: z.string().min(1, 'OpenAI API key is required'),
  RATE_LIMIT_REDIS_URL: z.string().url().optional(),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
})

export const env = envSchema.parse({
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  RATE_LIMIT_REDIS_URL: process.env.RATE_LIMIT_REDIS_URL,
  NODE_ENV: process.env.NODE_ENV,
})

export type Env = z.infer<typeof envSchema>
