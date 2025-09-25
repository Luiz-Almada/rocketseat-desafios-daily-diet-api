import fastify from 'fastify'
import cookie from '@fastify/cookie'
import { usersRoute } from './routes/users'
import { mealsRoute } from './routes/meals'

export const app = fastify()

app.register(cookie)

app.register(usersRoute, {
  prefix: 'users',
})

app.register(mealsRoute, {
  prefix: 'meals',
})