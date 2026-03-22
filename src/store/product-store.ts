import type { Product } from '../types/product.js'

const products: Product[] = []

export const addProduct = (product: Product): void => {
  products.push(product)
}

export const productStore = {
  getAll: (): ReadonlyArray<Product> => [...products], // destructuring to avoid mutating the original array
  getById: (id: string): Product | undefined =>
    products.find((product) => product.id === id),
  create: (product: Product): void => {
    addProduct(product)
  },
  update: (product: Product): void => {
    const index = products.findIndex((p) => p.id === product.id)
    if (index >= 0) {
      products[index] = product
    }
  },
}

export const resetProductStore = (): void => {
  products.length = 0 // for tests
}
