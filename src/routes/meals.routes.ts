import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'
import { randomUUID } from 'node:crypto'
import { knexQB } from '../database'

export async function mealsRoutes(app: FastifyInstance) {
  app.post(
    '/',
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const createMealBodySchema = z.object({
        name: z.string(),
        description: z.string(),
        isOnDiet: z.boolean(),
        date: z.coerce.date(),
      })

      const { name, description, isOnDiet, date } = createMealBodySchema.parse(
        request.body,
      )

      console.log(request.user?.id)

      if (!request.user?.id) {
        return reply.status(400).send({ error: 'User ID is required.' })
      }

      await knexQB('meals').insert({
        id: randomUUID(),
        name,
        description,
        is_on_diet: isOnDiet,
        date: date.getTime(),
        user_id: request.user.id,
      })

      return reply.status(201).send()
    },
  )

  app.get(
    '/',
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const meals = await knexQB('meals')
        .where('user_id', request.user?.id)
        .orderBy('date', 'desc')

      return reply.send({ meals })
    },
  )

  app.get(
    '/:mealId',
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const paramsSchema = z.object({ mealId: z.string().uuid() })

      const { mealId } = paramsSchema.parse(request.params)

      const meal = await knexQB('meals').where({ id: mealId }).first()

      if (!meal) {
        return reply.status(404).send({ error: 'Meal not found' })
      }

      return reply.send({ meal })
    },
  )

  app.put(
    '/:mealId',
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const paramsSchema = z.object({ mealId: z.string().uuid() })

      const { mealId } = paramsSchema.parse(request.params)

      const updateMealBodySchema = z.object({
        name: z.string(),
        description: z.string(),
        isOnDiet: z.boolean(),
        date: z.coerce.date(),
      })

      const { name, description, isOnDiet, date } = updateMealBodySchema.parse(
        request.body,
      )

      const meal = await knexQB('meals').where({ id: mealId }).first()

      if (!meal) {
        return reply.status(404).send({ error: 'Meal not found' })
      }

      await knexQB('meals').where({ id: mealId }).update({
        name,
        description,
        is_on_diet: isOnDiet,
        date: date.getTime(),
      })

      return reply.status(204).send()
    },
  )

  app.delete(
    '/:mealId',
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const paramsSchema = z.object({ mealId: z.string().uuid() })

      const { mealId } = paramsSchema.parse(request.params)

      const meal = await knexQB('meals').where({ id: mealId }).first()

      if (!meal) {
        return reply.status(404).send({ error: 'Meal not found' })
      }

      await knexQB('meals').where({ id: mealId }).delete()

      return reply.status(204).send()
    },
  )

  app.get(
    '/metrics',
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const totalMealsOnDiet = await knexQB('meals')
        .where('user_id', request.user?.id)
        .where('is_on_diet', true)
        .count('id', { as: 'total' })
        .first()

      const totalMealsOffDiet = await knexQB('meals')
        .where('user_id', request.user?.id)
        .where('is_on_diet', false)
        .count('id', { as: 'total' })
        .first()

      const totalMeals = await knexQB('meals')
        .where('user_id', request.user?.id)
        .orderBy('date', 'desc')

      const { bestOnDietSequence } = totalMeals.reduce(
        (
          acc: { currentSequence: number; bestOnDietSequence: number },
          meal: { is_on_diet: boolean },
        ) => {
          if (meal.is_on_diet) {
            acc.currentSequence += 1
          } else {
            acc.currentSequence = 0
          }

          if (acc.currentSequence > acc.bestOnDietSequence) {
            acc.bestOnDietSequence = acc.currentSequence
          }

          return acc
        },
        { bestOnDietSequence: 0, currentSequence: 0 },
      )

      return reply.send({
        totalMeals: totalMeals.length,
        totalMealsOnDiet: totalMealsOnDiet?.total,
        totalMealsOffDiet: totalMealsOffDiet?.total,
        bestOnDietSequence,
      })
    },
  )
}
