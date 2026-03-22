import type { Product } from '../types/product.js'

const products: Product[] = []

export const productStore = {
  getAll: (): ReadonlyArray<Product> => [...products], // destructuring to avoid mutating the original array
  getById: (id: string): Product | undefined =>
    products.find((product) => product.id === id),
}

export const addProduct = (product: Product): void => {
  products.push(product) // for tests
}

export const resetProductStore = (): void => {
  products.length = 0 // for tests
}
