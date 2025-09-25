import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { randomUUID } from 'crypto'
import { knexQB } from '../database'

export async function usersRoute(app: FastifyInstance) {
  /* 
  // exemplo de hook global no Fastify: aqui funciona somente para esta rota
  app.addHook('preHandler', async (request) => {
  console.log(`[${request.method}] ${request.url}`) // Log de requisições
  })
  */

  app.get(
    '/',
    async (request) => {
      const users = await knexQB('users')
        .select()
      return { users }
    },
  )

/*   app.get(
    '/:id',
    async (request) => {
      const getUserParamsSchema = z.object({
        id: z.string().uuid(),
      })
      const { id } = getUserParamsSchema.parse(request.params)

      const { sessionId } = request.cookies

      const transaction = await knexQB('users')
        .where({
          session_id: sessionId!, // ! = Non-null assertion
          id,
        })
        // .andWhere('session_id', sessionId)
        .first()
      // const transaction = await knexQB('users').where({ id }).first()

      return { transaction }
    },
  ) */

/*   app.get(
    '/summary',
    async (request) => {
      const { sessionId } = request.cookies

      const summary = await knexQB('users')
        .where('session_id', sessionId)
        .sum('amount', { as: 'amount' })
        .first()

      return { summary }
    },
  ) */

  app.post('/', async (request, reply) => {
    const createUserBodySchema = z.object({
      name: z.string().min(1),
      email: z.string().email('Email inválido')
    })

    const { name, email } = createUserBodySchema.parse(
      request.body,
    )

    await knexQB('users').insert({
      id: randomUUID(),
      name,
      email,
    })

    return reply.status(201).send()
  })
}