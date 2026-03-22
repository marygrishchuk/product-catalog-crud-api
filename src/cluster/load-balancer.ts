import fastify, { type FastifyInstance } from 'fastify'
import replyFrom from '@fastify/reply-from'

// Round-robin reverse proxy to local worker ports via `reply.from()`
export async function createLoadBalancer(
  workerPorts: readonly number[],
): Promise<FastifyInstance> {
  let currentWorkerIndex = 0
  const app = fastify({ logger: false, disableRequestLogging: true })
  await app.register(replyFrom)

  app.all('*', (request, reply) => {
    const port = workerPorts[currentWorkerIndex++ % workerPorts.length]!
    return reply.from(`http://127.0.0.1:${String(port)}${request.url}`)
  })

  return app
}
