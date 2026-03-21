import fastify from 'fastify'
import 'dotenv/config'

const server = fastify()
const port = Number(process.env.PORT) || 4000
const host = process.env.HOST || 'localhost'

server.get('/ping', async (_request, _reply) => {
  return 'pong\n'
})

server.listen({ port, host }, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`Server listening at ${address}`)
})
