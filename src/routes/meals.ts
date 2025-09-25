import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { randomUUID } from 'crypto'
import { knexQB } from '../database'

export async function mealsRoute(app: FastifyInstance) {
  /* 
  // exemplo de hook global no Fastify: aqui funciona somente para esta rota
  app.addHook('preHandler', async (request) => {
  console.log(`[${request.method}] ${request.url}`) // Log de requisições
  })
  */

  app.get(
    '/',
    async (request) => {
      const meals = await knexQB('meals')
        .select()
      return { meals }
    },
  )

/*   app.get(
    '/:id',
    async (request) => {
      const getMealParamsSchema = z.object({
        id: z.string().uuid(),
      })
      const { id } = getMealParamsSchema.parse(request.params)

      const { sessionId } = request.cookies

      const transaction = await knexQB('meals')
        .where({
          session_id: sessionId!, // ! = Non-null assertion
          id,
        })
        // .andWhere('session_id', sessionId)
        .first()
      // const transaction = await knexQB('meals').where({ id }).first()

      return { transaction }
    },
  ) */

/*   app.get(
    '/summary',
    async (request) => {
      const { sessionId } = request.cookies

      const summary = await knexQB('meals')
        .where('session_id', sessionId)
        .sum('amount', { as: 'amount' })
        .first()

      return { summary }
    },
  ) */

  app.post('/', async (request, reply) => {
    const createMealBodySchema = z.object({
      name: z.string().min(1),
      description: z.string().min(10),
      date_time: z.string().datetime(),
      is_on_diet: z.boolean(),
      user_id: z.string().uuid(),
    })



    const { name, description, date_time,is_on_diet, user_id } = createMealBodySchema.parse(
      request.body,
    )

    const userExists = await knexQB('users').where('id', user_id).first()
    
    if (!userExists) {
      return reply.status(404).send({ error: 'Usuário não encontrado' })
    }

    await knexQB('meals').insert({
      id: randomUUID(),
      name,
      description,
      date_time,
      is_on_diet,
      user_id,
    })

    return reply.status(201).send()
  })
}