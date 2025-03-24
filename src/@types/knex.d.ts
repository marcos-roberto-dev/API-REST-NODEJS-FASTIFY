// eslint-disable-next-line
import { Knex } from 'knex'
import { z } from 'zod'
import { transactionSchema } from '../schemas/transactions.schema'

declare module 'knex/types/tables' {
  export interface Tables {
    transactions: z.infer<typeof transactionSchema>
  }
}
