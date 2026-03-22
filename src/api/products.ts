import { randomUUID } from 'node:crypto'
import type { FastifyPluginAsync } from 'fastify'
import { validate as isUuid } from 'uuid'
import {
  storeCreate,
  storeDelete,
  storeGetAll,
  storeGetById,
  storeUpdate,
} from '../store/product-store-access.js'
import type { Product } from '../types/product.js'

const productBodyJsonSchema = {
  type: 'object',
  required: ['name', 'description', 'price', 'category', 'inStock'],
  properties: {
    name: { type: 'string' },
    description: { type: 'string' },
    price: { type: 'number', exclusiveMinimum: 0 },
    category: { type: 'string' },
    inStock: { type: 'boolean' },
  },
}

const schema = {
  body: productBodyJsonSchema,
}

export const productsApi: FastifyPluginAsync = async (fastify) => {
  fastify.get('/products', async (_request, reply) => {
    return reply.code(200).send(await storeGetAll())
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
      const product = await storeGetById(id)
      if (!product) {
        return reply.code(404).send({
          message: 'Product does not exist',
        })
      }
      return reply.code(200).send(product)
    },
  )

  fastify.post<{ Body: Omit<Product, 'id'> }>(
    '/products',
    { schema },
    async (request, reply) => {
      const product: Product = {
        ...request.body,
        id: randomUUID(),
      }
      await storeCreate(product)
      return reply.code(201).send(product)
    },
  )

  fastify.put<{ Params: { id: string }; Body: Omit<Product, 'id'> }>(
    '/products/:id',
    { schema },
    async (request, reply) => {
      const { id } = request.params
      if (!isUuid(id)) {
        return reply.code(400).send({
          message: 'Invalid product ID: must be a valid UUID',
        })
      }
      if (!(await storeGetById(id))) {
        return reply.code(404).send({
          message: 'Product does not exist',
        })
      }
      const updated: Product = { id, ...request.body }
      await storeUpdate(updated)
      return reply.code(200).send(updated)
    },
  )

  fastify.delete<{ Params: { id: string } }>(
    '/products/:id',
    async (request, reply) => {
      const { id } = request.params
      if (!isUuid(id)) {
        return reply.code(400).send({
          message: 'Invalid product ID: must be a valid UUID',
        })
      }
      if (!(await storeGetById(id))) {
        return reply.code(404).send({
          message: 'Product does not exist',
        })
      }
      await storeDelete(id)
      return reply.code(204).send()
    },
  )
}
