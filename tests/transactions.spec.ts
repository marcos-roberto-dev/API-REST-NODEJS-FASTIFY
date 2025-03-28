import { expect, it, beforeAll, afterAll, describe, beforeEach } from 'vitest'
import request from 'supertest'
import { app } from '../src/app'
import { execSync } from 'child_process'

describe('Transactions routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(async () => {
    await execSync('npm run knex migrate:rollback --all')
    await execSync('npm run knex migrate:latest')
  })

  it('should be able to create a new transaction', async () => {
    const transaction: { title: string; amount: number; type?: string } = {
      title: 'Test Transaction',
      amount: 5000,
      type: 'credit',
    }
    const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send(transaction)
      .expect(201)

    expect(createTransactionResponse.statusCode).toEqual(201)
  })

  it('should be able to list all transactions', async () => {
    const transaction: { title: string; amount: number; type?: string } = {
      title: 'Test Transaction',
      amount: 5000,
      type: 'credit',
    }
    const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send(transaction)

    delete transaction.type

    const cookies = createTransactionResponse.get('Set-Cookie')
    const listTransactionResponse = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookies ?? [])
      .expect(200)

    expect(listTransactionResponse.body).toEqual(
      expect.objectContaining({
        transactions: [expect.objectContaining(transaction)],
      }),
    )
  })

  it('should be able to get a specific transactions', async () => {
    const transaction: { title: string; amount: number; type?: string } = {
      title: 'Test Transaction',
      amount: 5000,
      type: 'credit',
    }
    const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send(transaction)

    delete transaction.type

    const cookies = createTransactionResponse.get('Set-Cookie')
    const listTransactionResponse = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookies ?? [])

    const transactionId = listTransactionResponse.body.transactions[0].id

    const getTransactionResponse = await request(app.server)
      .get(`/transactions/${transactionId}`)
      .set('Cookie', cookies ?? [])
      .expect(200)

    expect(getTransactionResponse.body).toEqual(
      expect.objectContaining({
        transaction: expect.objectContaining(transaction),
      }),
    )
  })

  it('should be able to get the summary of transactions', async () => {
    const transaction: { title: string; amount: number; type?: string } = {
      title: 'Test Transaction',
      amount: 5000,
      type: 'credit',
    }
    const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send(transaction)

    delete transaction.type

    const cookies = createTransactionResponse.get('Set-Cookie')
    const summaryResponse = await request(app.server)
      .get('/transactions/summary')
      .set('Cookie', cookies ?? [])
      .expect(200)

    expect(summaryResponse.body).toEqual(
      expect.objectContaining({
        summary: expect.objectContaining({
          amount: transaction.amount,
        }),
      }),
    )
  })

  it('should not be able to list all transaction without a session-id', async () => {
    const transaction: { title: string; amount: number; type?: string } = {
      title: 'Test Transaction',
      amount: 5000,
      type: 'credit',
    }
    await request(app.server).post('/transactions').send(transaction)

    const listTransactionResponse = await request(app.server)
      .get('/transactions')
      .expect(401)

    expect(listTransactionResponse.body).toEqual(
      expect.objectContaining({
        error: 'Unauthorized',
      }),
    )
  })

  it('should not be able to get a specific transaction without a session-id', async () => {
    const transaction: { title: string; amount: number; type?: string } = {
      title: 'Test Transaction',
      amount: 5000,
      type: 'credit',
    }
    const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send(transaction)

    delete transaction.type

    const listTransactionResponse = await request(app.server)
      .get('/transactions')
      .set('Cookie', createTransactionResponse.get('Set-Cookie') ?? [])

    const transactionId = listTransactionResponse.body.transactions[0].id

    const getTransactionResponse = await request(app.server)
      .get(`/transactions/${transactionId}`)
      .expect(401)

    expect(getTransactionResponse.body).toEqual(
      expect.objectContaining({
        error: 'Unauthorized',
      }),
    )
  })

  it('should not be able to get the summary of transactions without a session-id', async () => {
    const transaction: { title: string; amount: number; type?: string } = {
      title: 'Test Transaction',
      amount: 5000,
      type: 'credit',
    }

    await request(app.server).post('/transactions').send(transaction)

    delete transaction.type

    const summaryResponse = await request(app.server)
      .get('/transactions/summary')
      .expect(401)

    expect(summaryResponse.body).toEqual(
      expect.objectContaining({
        error: 'Unauthorized',
      }),
    )
  })
})
