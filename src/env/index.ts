import { config } from 'dotenv'

import { z as zod } from 'zod'

if (process.env.NODE_ENV === 'test') {
  config({ path: '.env.test' })
} else {
  config()
}
console.log('PROCESS_ENV_PORT', process.env.PORT)
const envSchema = zod.object({
  DATABASE_URL: zod.string(),
  PORT: zod.coerce.number().default(4000),
  DATABASE_CLIENT: zod.enum(['sqlite', 'pg']).default('sqlite'),
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
