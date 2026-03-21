import 'dotenv/config'
import { runApp } from './app.js'

const port = Number(process.env.PORT) || 4000
const host = process.env.HOST ?? '127.0.0.1'

const app = await runApp()
const address = await app.listen({ port, host })
console.log(`Server listening at ${address}`)
