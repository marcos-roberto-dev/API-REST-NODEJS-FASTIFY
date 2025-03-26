import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { transactionSchema } from '../schemas/transactions.schema'
import { z as zod } from 'zod'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'

export async function transactionsRoutes(app: FastifyInstance) {
  app.get('/', { preHandler: [checkSessionIdExists] }, async (request) => {
    const sessionId = request.cookies.sessionId

    const transactions = await knex('transactions')
      .where({ session_id: sessionId })
      .select('*')
    return { transactions }
  })

  app.get('/:id', { preHandler: [checkSessionIdExists] }, async (request) => {
    const sessionId = request.cookies.sessionId
    const getTransactionParamsSchema = zod.object({
      id: zod.string().uuid(),
    })
    const { id } = getTransactionParamsSchema.parse(request.params)
    const transaction = await knex('transactions')
      .where({ id, session_id: sessionId })
      .first()

    return {
      transaction,
    }
  })

  app.get(
    '/summary',
    { preHandler: [checkSessionIdExists] },
    async (request) => {
      const sessionId = request.cookies.sessionId
      const summary = await knex('transactions')
        .sum('amount', { as: 'amount' })
        .where({ session_id: sessionId })
        .first()

      return {
        summary,
      }
    },
  )

  app.post('/', async (request, reply) => {
    const createTransactionSchema = transactionSchema
      .extend({
        type: zod.enum(['credit', 'debit']),
      })
      .omit({ id: true, session_id: true })
    const { title, amount, type } = createTransactionSchema.parse(request.body)

    let sessionId = request.cookies.sessionId

    if (!sessionId) {
      sessionId = crypto.randomUUID()
      reply.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })
    }

    await knex('transactions').insert({
      id: crypto.randomUUID(),
      title,
      amount: type === 'credit' ? amount : amount * -1,
      session_id: sessionId,
    })

    return reply.status(201).send()
  })
}
