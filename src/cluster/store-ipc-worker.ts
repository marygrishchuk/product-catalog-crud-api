import cluster from 'node:cluster'
import { randomUUID } from 'node:crypto'
import type {
  StoreRequest,
  StoreRequestPayload,
  StoreResponse,
} from '../types/cluster-messages.js'

/** replyId → [resolve, reject] */
const pending: Record<string, [(value: unknown) => void, (e: Error) => void]> = {}

if (cluster.isWorker && process.argv.includes('--cluster')) {
  process.on('message', (message: StoreResponse) => {
    if (!message || typeof message !== 'object' || message.type !== 'store-response') return

    const tuple = pending[message.replyId]
    if (!tuple) return
    delete pending[message.replyId]
    const [resolve, reject] = tuple
    if (message.ok) resolve(message.result)
    else reject(new Error(message.error))
  })
}

export function ipcRequest(request: StoreRequestPayload): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const replyId = randomUUID()
    pending[replyId] = [resolve, reject]
    if (!process.send) {
      delete pending[replyId]
      reject(new Error('process.send is not available'))
      return
    }
    process.send({ type: 'store-request', replyId, ...request } as StoreRequest)
    setTimeout(() => {
      if (!(replyId in pending)) return
      delete pending[replyId]
      reject(new Error('Store IPC timeout'))
    }, 30000)
  })
}
