import { afterEach, beforeEach, describe, expect, it } from '@jest/globals'
import { runApp } from '../app.js'
import { resetProductStore } from '../store/product-store.js'
import type { FastifyInstance } from 'fastify'

describe('GET /api/products', () => {
  let app: FastifyInstance

  beforeEach(async () => {
    resetProductStore()
    app = await runApp()
    await app.ready()
  })

  afterEach(async () => {
    await app.close()
  })

  it('returns status 200 and an empty array initially', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/products',
    })

    expect(res.statusCode).toBe(200)
    expect(res.headers['content-type']).toMatch(/application\/json/)
    expect(JSON.parse(res.body)).toEqual([])
  })
})
