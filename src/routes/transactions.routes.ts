import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { z as zod } from 'zod'

export async function transactionsRoutes(app: FastifyInstance) {
  app.get('/', async () => {
    const transactions = await knex('transactions').select('*')
    return transactions
  })

  app.post('/', async (request, reply) => {
    const createTransactionBodySchema = zod.object({
      title: zod.string(),
      amount: zod.number(),
      type: zod.enum(['credit', 'debit']),
    })

    const { title, amount, type } = createTransactionBodySchema.parse(
      request.body,
    )

    await knex('transactions').insert({
      id: crypto.randomUUID(),
      title,
      amount: type === 'credit' ? amount : amount * -1,
    })

    return reply.status(201).send()
  })
}
