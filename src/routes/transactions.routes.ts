import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { transactionSchema } from '../schemas/transactions.schema'
import { z as zod } from 'zod'

export async function transactionsRoutes(app: FastifyInstance) {
  app.get('/', async () => {
    const transactions = await knex('transactions').select('*')
    return { transactions }
  })

  app.get('/:id', async (request) => {
    const getTransactionParamsSchema = zod.object({
      id: zod.string().uuid(),
    })
    const { id } = getTransactionParamsSchema.parse(request.params)
    const transaction = await knex('transactions').where({ id }).first()

    return {
      transaction,
    }
  })

  app.get('/summary', async () => {
    const summary = await knex('transactions')
      .sum('amount', { as: 'amount' })
      .first()

    return {
      summary,
    }
  })

  app.post('/', async (request, reply) => {
    const createTransactionSchema = transactionSchema
      .extend({
        type: zod.enum(['credit', 'debit']),
      })
      .omit({ id: true })
    const { title, amount, type, session_id } = createTransactionSchema.parse(
      request.body,
    )

    await knex('transactions').insert({
      id: crypto.randomUUID(),
      title,
      amount: type === 'credit' ? amount : amount * -1,
      session_id,
    })

    return reply.status(201).send()
  })
}
