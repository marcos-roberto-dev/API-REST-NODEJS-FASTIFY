import { z as zod } from 'zod'

export const transactionSchema = zod.object({
  id: zod.string(),
  title: zod.string(),
  amount: zod.number(),
  session_id: zod.string().optional(),
})
