import { randomUUID } from 'node:crypto'
import type { FastifyPluginAsync } from 'fastify'
import { validate as isUuid } from 'uuid'
import { productStore } from '../store/product-store.js'
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

  fastify.post<{ Body: Omit<Product, 'id'> }>(
    '/products',
    { schema },
    async (request, reply) => {
      const product: Product = {
        ...request.body,
        id: randomUUID(),
      }
      productStore.create(product)
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
      if (!productStore.getById(id)) {
        return reply.code(404).send({
          message: 'Product does not exist',
        })
      }
      const updated: Product = { id, ...request.body }
      productStore.update(updated)
      return reply.code(200).send(updated)
    },
  )
}
