import fastify from 'fastify'
import { productsApi } from './api/products.js'
import type { FastifyRequest, FastifyReply } from 'fastify'

const greetHandler = async (_request: FastifyRequest, reply: FastifyReply) => {
  reply.send('Hello World')
}

export async function runApp() {
  const app = fastify()

  app.get('/', greetHandler)
  app.get('/api', greetHandler)

  app.setNotFoundHandler({}, function (_request, reply) {
    reply.code(404).send('Route not found')
  })

  await app.register(productsApi, { prefix: '/api' })

  return app
}
