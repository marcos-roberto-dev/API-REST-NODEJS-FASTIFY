import { knex as setupKnex, Knex } from 'knex'

export const configKnex: Knex.Config = {
  client: 'sqlite',
  connection: {
    filename: './database/app.db',
  },
  useNullAsDefault: true,
  migrations: {
    extension: 'ts',
    directory: './database/migrations',
  },
}

export const knex = setupKnex(configKnex)
