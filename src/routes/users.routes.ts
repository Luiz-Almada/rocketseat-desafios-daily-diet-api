import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { randomUUID } from 'crypto'
import { knexQB } from '../database'

export async function usersRoutes(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const createUserBodySchema = z.object({
      name: z.string(),
      email: z.string().email(),
    })

    let sessionId = request.cookies.sessionId

    if (!sessionId) {
      sessionId = randomUUID()

      reply.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      })
    }

    const { name, email } = createUserBodySchema.parse(request.body)

    const userByEmail = await knexQB('users').where({ email }).first()

    if (userByEmail) {
      return reply.status(400).send({ error: 'User already exists.' })
    }

    await knexQB('users').insert({
      id: randomUUID(),
      name,
      email,
      session_id: sessionId,
    })

    return reply.status(201).send()
  })

  app.get('/', async () => {
    const users = await knexQB('users').select()
    return { users }
  })

  app.get('/bySessionId/:sessionId', async (request) => {
    const getUserParamsSchema = z.object({
      sessionId: z.string().uuid(),
    })

    const { sessionId } = getUserParamsSchema.parse(request.params)

    const user = await knexQB('users').where({ session_id: sessionId }).first()

    return { user }
  })
}
