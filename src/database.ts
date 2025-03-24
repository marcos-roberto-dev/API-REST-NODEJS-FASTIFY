import 'dotenv/config'

import { knex as setupKnex, Knex } from 'knex'

export const configKnex: Knex.Config = {
  client: 'sqlite',
  connection: {
    filename: process.env.DATABASE_URL!,
  },
  useNullAsDefault: true,
  migrations: {
    extension: 'ts',
    directory: './database/migrations',
  },
}

export const knex = setupKnex(configKnex)
