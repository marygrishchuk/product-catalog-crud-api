import type { FastifyPluginAsync } from 'fastify'
import { validate as isUuid } from 'uuid'
import { productStore } from '../store/product-store.js'

export const productsApi: FastifyPluginAsync = async (fastify) => {
  fastify.get('/products', async (_request, reply) => {
    return reply.code(200).send(productStore.getAll())
  })

  fastify.get<{ Params: { id: string } }>(
    '/products/:id',
    async (request, reply) => {
      const { id } = request.params
      if (!isUuid(id)) {
        return reply.code(400).send({
          message: 'Invalid product ID: must be a valid UUID',
        })
      }
      const product = productStore.getById(id)
      if (!product) {
        return reply.code(404).send({
          message: 'Product does not exist',
        })
      }
      return reply.code(200).send(product)
    },
  )
}
