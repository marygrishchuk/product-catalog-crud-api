import fastify from 'fastify'
import { productsApi } from './api/products.js'

export async function runApp() {
  const app = fastify()

  app.get('/', async (_request, reply) => {
    reply.send('Hello World')
  })

  await app.register(productsApi, { prefix: '/api' })

  return app
}
