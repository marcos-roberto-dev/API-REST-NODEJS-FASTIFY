import 'dotenv/config'

import { z as zod } from 'zod'

const envSchema = zod.object({
  DATABASE_URL: zod.string(),
  PORT: zod.number().default(3333),
  NODE_ENV: zod
    .enum(['development', 'test', 'production'])
    .default('production'),
})

const _env = envSchema.safeParse(process.env)

if (_env.success === false) {
  console.error('Invalid environment variables:', _env.error.format())
  throw new Error('Invalid environment variables')
}

export const env = _env.data
