import type { FastifyPluginAsync } from 'fastify'
import { productStore } from '../store/product-store.js'

export const productsApi: FastifyPluginAsync = async (fastify) => {
  fastify.get('/products', async (_request, reply) => {
    return reply.code(200).send(productStore.getAll())
  })
}
