import fastify from 'fastify'
import { knex } from './database'

const app = fastify()

app.get('/transactions', async () => {
  const transactions = await knex('transactions').select('*')
  return transactions
})

app.listen({ port: 3333 }).then(() => {
  console.log('Server is running on http://localhost:3333')
})
