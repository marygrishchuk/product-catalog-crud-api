import type { Product } from '../types/product.js'

const products: Product[] = []

export const productStore = {
  getAll: (): ReadonlyArray<Product> => [...products], // destructuring to avoid mutating the original array
}

export const resetProductStore = (): void => {
  products.length = 0 // for tests
}
