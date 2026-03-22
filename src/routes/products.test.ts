import { afterEach, beforeEach, describe, expect, it } from '@jest/globals'
import { runApp } from '../app.js'
import { addProduct, resetProductStore } from '../store/product-store.js'
import type { FastifyInstance } from 'fastify'

describe('GET /api/products', () => {
  let app: FastifyInstance
  const id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
  const product = {
    id,
    name: 'Test',
    description: 'Desc',
    price: 9.99,
    category: 'cat',
    inStock: true,
  }

  beforeEach(async () => {
    resetProductStore()
    app = await runApp()
    await app.ready()
  })

  afterEach(async () => {
    await app.close()
  })

  it('returns status 200 and an empty array initially when no products are available', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/products',
    })

    expect(res.statusCode).toBe(200)
    expect(res.headers['content-type']).toMatch(/application\/json/)
    expect(JSON.parse(res.body)).toEqual([])
  })

  it('returns 404 when product id is valid but no product exists', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/products/00000000-0000-4000-8000-000000000000',
    })

    expect(res.statusCode).toBe(404)
    expect(JSON.parse(res.body)).toEqual({
      message: 'Product does not exist',
    })
  })

  it('returns status 200 and an array with available products if any', async () => {
    addProduct(product)

    const res = await app.inject({
      method: 'GET',
      url: '/api/products',
    })

    expect(res.statusCode).toBe(200)
    expect(res.headers['content-type']).toMatch(/application\/json/)
    expect(JSON.parse(res.body)).toEqual([product])
  })

  it('returns 400 when product id is not a valid UUID', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/products/not-a-uuid',
    })

    expect(res.statusCode).toBe(400)
    expect(JSON.parse(res.body)).toEqual({
      message: 'Invalid product ID: must be a valid UUID',
    })
  })

  it('returns 200 and the product when it exists', async () => {
    addProduct(product)

    const res = await app.inject({
      method: 'GET',
      url: `/api/products/${id}`,
    })

    expect(res.statusCode).toBe(200)
    expect(JSON.parse(res.body)).toEqual(product)
  })
})
