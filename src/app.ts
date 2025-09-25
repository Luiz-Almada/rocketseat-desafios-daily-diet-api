import fastify from 'fastify'
import cookie from '@fastify/cookie'
import { usersRoute } from './routes/users'

export const app = fastify()

app.register(cookie)

app.register(usersRoute, {
  prefix: 'users',
})