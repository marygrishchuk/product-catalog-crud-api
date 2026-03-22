import cluster from 'node:cluster'
import { ipcRequest } from '../cluster/store-ipc-worker.js'
import type { Product } from '../types/product.js'
import { productStore } from './product-store.js'

function useClusterWorkerStore(): boolean {
  return process.argv.includes('--cluster') && cluster.isWorker
}

export async function storeGetAll(): Promise<ReadonlyArray<Product>> {
  if (useClusterWorkerStore()) {
    return (await ipcRequest({ operation: 'getAll' })) as ReadonlyArray<Product>
  }
  return productStore.getAll()
}

export async function storeGetById(id: string): Promise<Product | undefined> {
  if (useClusterWorkerStore()) {
    return (await ipcRequest({ operation: 'getById', id })) as Product | undefined
  }
  return productStore.getById(id)
}

export async function storeCreate(product: Product): Promise<void> {
  if (useClusterWorkerStore()) {
    await ipcRequest({ operation: 'create', product })
    return
  }
  productStore.create(product)
}

export async function storeUpdate(product: Product): Promise<void> {
  if (useClusterWorkerStore()) {
    await ipcRequest({ operation: 'update', product })
    return
  }
  productStore.update(product)
}

export async function storeDelete(id: string): Promise<void> {
  if (useClusterWorkerStore()) {
    await ipcRequest({ operation: 'delete', id })
    return
  }
  productStore.delete(id)
}
