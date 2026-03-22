import { afterEach, beforeEach, describe, expect, it } from '@jest/globals'
import { validate as isUuid } from 'uuid'
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

describe('POST /api/products', () => {
  let app: FastifyInstance
  const headers = { 'content-type': 'application/json' }

  const validPayload = {
    name: 'MacBook',
    description: 'A personal laptop by Apple',
    price: 1999.99,
    category: 'electronics',
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

  it('returns 201 and the created product with a server-generated id', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/products',
      headers,
      payload: validPayload,
    })

    expect(res.statusCode).toBe(201)
    const body = JSON.parse(res.body) as typeof validPayload & { id: string }
    expect(isUuid(body.id)).toBe(true)
    expect(body).toEqual({ id: body.id, ...validPayload })
  })

  it('returns 400 when name is missing', async () => {
    const { name: _omit, ...withoutName } = validPayload
    const res = await app.inject({
      method: 'POST',
      url: '/api/products',
      headers,
      payload: withoutName,
    })

    expect(res.statusCode).toBe(400)
    expect(JSON.parse(res.body)).toMatchObject({
      statusCode: 400,
      code: 'FST_ERR_VALIDATION',
      message: "body must have required property 'name'",
    })
  })

  it('returns 400 when price is 0', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/products',
      headers,
      payload: { ...validPayload, price: 0 },
    })

    expect(res.statusCode).toBe(400)
    expect(JSON.parse(res.body)).toMatchObject({
      statusCode: 400,
      code: 'FST_ERR_VALIDATION',
      message: 'body/price must be > 0',
    })
  })
})

describe('PUT /api/products/:id', () => {
  let app: FastifyInstance
  const headers = { 'content-type': 'application/json' }
  const id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
  const existing = {
    id,
    name: 'Sherlock Holmes',
    description: 'a book by Arthur Conan Doyle',
    price: 10,
    category: 'books',
    inStock: true,
  }
  const updatePayload = {
    name: 'Updated Sherlock Holmes',
    description: 'Updated desc',
    price: 29.99,
    category: 'updated book',
    inStock: false,
  }

  beforeEach(async () => {
    resetProductStore()
    app = await runApp()
    await app.ready()
  })

  afterEach(async () => {
    await app.close()
  })

  it('returns 200 and the updated product', async () => {
    addProduct(existing)

    const res = await app.inject({
      method: 'PUT',
      url: `/api/products/${id}`,
      headers,
      payload: updatePayload,
    })

    expect(res.statusCode).toBe(200)
    expect(JSON.parse(res.body)).toEqual({ id, ...updatePayload })
  })

  it('returns 400 when id is not a valid UUID', async () => {
    addProduct(existing)

    const res = await app.inject({
      method: 'PUT',
      url: '/api/products/not-a-uuid',
      headers,
      payload: updatePayload,
    })

    expect(res.statusCode).toBe(400)
    expect(JSON.parse(res.body)).toEqual({
      message: 'Invalid product ID: must be a valid UUID',
    })
  })

  it('returns 404 when id is valid but no product exists', async () => {
    const res = await app.inject({
      method: 'PUT',
      url: '/api/products/00000000-0000-4000-8000-000000000000',
      headers,
      payload: updatePayload,
    })

    expect(res.statusCode).toBe(404)
    expect(JSON.parse(res.body)).toEqual({
      message: 'Product does not exist',
    })
  })
})

describe('DELETE /api/products/:id', () => {
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

  it('returns 204 and removes the product when it exists', async () => {
    addProduct(product)

    const res = await app.inject({
      method: 'DELETE',
      url: `/api/products/${id}`,
    })

    expect(res.statusCode).toBe(204)
    expect(res.body).toBe('')

    const getRes = await app.inject({
      method: 'GET',
      url: `/api/products/${id}`,
    })
    expect(getRes.statusCode).toBe(404)
  })

  it('returns 400 when id is not a valid UUID', async () => {
    const res = await app.inject({
      method: 'DELETE',
      url: '/api/products/not-a-uuid',
    })

    expect(res.statusCode).toBe(400)
    expect(JSON.parse(res.body)).toEqual({
      message: 'Invalid product ID: must be a valid UUID',
    })
  })

  it('returns 404 when id is valid but no product exists', async () => {
    const res = await app.inject({
      method: 'DELETE',
      url: '/api/products/00000000-0000-4000-8000-000000000000',
    })

    expect(res.statusCode).toBe(404)
    expect(JSON.parse(res.body)).toEqual({
      message: 'Product does not exist',
    })
  })
})
