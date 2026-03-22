import type { Worker } from 'node:cluster'
import { productStore } from '../store/product-store.js'
import type { StoreRequest } from '../types/cluster-messages.js'

export function handleStoreMessage(worker: Worker, message: StoreRequest): void {
  if (!message || typeof message !== 'object' || message.type !== 'store-request') return

  try {
    let result: unknown
    switch (message.operation) {
      case 'getAll':
        result = productStore.getAll()
        break
      case 'getById':
        result = productStore.getById(message.id)
        break
      case 'create':
        productStore.create(message.product)
        result = message.product
        break
      case 'update':
        productStore.update(message.product)
        result = message.product
        break
      case 'delete':
        productStore.delete(message.id)
        result = undefined
        break
    }
    worker.send({ type: 'store-response', replyId: message.replyId, ok: true, result })
  } catch (err) {
    worker.send({
      type: 'store-response',
      replyId: message.replyId,
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    })
  }
}
