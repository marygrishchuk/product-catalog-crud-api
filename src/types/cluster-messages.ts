import type { Product } from './product.js'

type StoreRequestBase = { type: 'store-request'; replyId: string }

/** Payload sent from worker to primary (without envelope fields). */
export type StoreRequestPayload =
  | { operation: 'getAll' }
  | { operation: 'getById'; id: string }
  | { operation: 'create'; product: Product }
  | { operation: 'update'; product: Product }
  | { operation: 'delete'; id: string }

export type StoreRequest =
  | (StoreRequestBase & { operation: 'getAll' })
  | (StoreRequestBase & { operation: 'getById'; id: string })
  | (StoreRequestBase & { operation: 'create'; product: Product })
  | (StoreRequestBase & { operation: 'update'; product: Product })
  | (StoreRequestBase & { operation: 'delete'; id: string })

export type StoreResponse =
  | { type: 'store-response'; replyId: string; ok: true; result: unknown }
  | { type: 'store-response'; replyId: string; ok: false; error: string }
