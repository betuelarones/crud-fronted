import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from 'vitest'

import { ApiError } from '@/services/http'
import { productService } from '@/services/products'
import { categoryService } from '@/services/categories'
import { useProductsStore } from '@/stores/products'
import { useCategoriesStore } from '@/stores/categories'
import type { Category, Pagination, Product } from '@/types'

vi.mock('@/services/products', () => ({
  productService: {
    list: vi.fn(),
    show: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  },
}))

vi.mock('@/services/categories', () => ({
  categoryService: {
    list: vi.fn(),
    show: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  },
}))

const productList = productService.list as unknown as Mock
const productCreate = productService.create as unknown as Mock
const productShow = productService.show as unknown as Mock
const productRemove = productService.remove as unknown as Mock
const categoryList = categoryService.list as unknown as Mock
const categoryRemove = categoryService.remove as unknown as Mock

const pagination: Pagination = {
  current_page: 1,
  per_page: 10,
  total: 1,
  last_page: 1,
  from: 1,
  to: 1,
}

const category: Category = {
  id: 1,
  name: 'Camisetas',
  description: 'Colección principal',
  products_count: 1,
}

const product: Product = {
  id: 1,
  name: 'Camiseta Test',
  description: 'Algodón',
  price: '89.90',
  stock: 5,
  category_id: 1,
  category,
  created_at: '2026-10-28T12:00:00.000000Z',
}

function paginated<T>(items: T[], meta: Pagination = pagination) {
  return { success: true as const, message: 'OK', data: { items, pagination: meta } }
}

beforeEach(() => {
  setActivePinia(createPinia())
})

afterEach(() => {
  vi.clearAllMocks()
  vi.useRealTimers()
})

describe('products store', () => {
  it('loads products and exposes pagination', async () => {
    let resolveList: (value: unknown) => void = () => {}
    productList.mockReturnValue(
      new Promise((resolve) => {
        resolveList = resolve
      }),
    )

    const store = useProductsStore()
    const request = store.fetchProducts()

    expect(store.loading).toBe(true)

    resolveList(paginated([product]))
    await request

    expect(store.loading).toBe(false)
    expect(store.items).toHaveLength(1)
    expect(store.items[0]?.name).toBe('Camiseta Test')
    expect(store.totalProducts).toBe(1)
    expect(store.hasProducts).toBe(true)
  })

  it('exposes API validation errors and the error message', async () => {
    productCreate.mockRejectedValue(
      new ApiError('Los datos enviados no son válidos.', 422, {
        name: ['El nombre ya está en uso.'],
      }),
    )

    const store = useProductsStore()
    const success = await store.createProduct({
      name: 'Camiseta Test',
      description: null,
      price: 89.9,
      stock: 5,
      category_id: 1,
    })

    expect(success).toBe(false)
    expect(store.error).toBe('Los datos enviados no son válidos.')
    expect(store.validationErrors.name).toEqual(['El nombre ya está en uso.'])
    expect(store.saving).toBe(false)
  })

  it('sets a success message that clears automatically', async () => {
    vi.useFakeTimers()
    productCreate.mockResolvedValue({ success: true, message: 'Producto creado correctamente.', data: product })

    const store = useProductsStore()
    const success = await store.createProduct({
      name: 'Camiseta Test',
      description: null,
      price: 89.9,
      stock: 5,
      category_id: 1,
    })

    expect(success).toBe(true)
    expect(store.successMessage).toBe('Producto creado correctamente.')

    vi.advanceTimersByTime(5000)
    expect(store.successMessage).toBeNull()
  })

  it('returns null when a product cannot be loaded', async () => {
    productShow.mockRejectedValue(new ApiError('Recurso no encontrado.', 404))

    const store = useProductsStore()
    const result = await store.fetchProduct(999)

    expect(result).toBeNull()
    expect(store.currentProduct).toBeNull()
    expect(store.error).toBe('Recurso no encontrado.')
  })

  it('deletes a product and refreshes the deleting state', async () => {
    productRemove.mockResolvedValue({ success: true, message: 'OK', data: null })

    const store = useProductsStore()
    const success = await store.deleteProduct(1)

    expect(success).toBe(true)
    expect(store.deletingId).toBeNull()
    expect(store.successMessage).toBe('Producto eliminado correctamente.')
    expect(productRemove).toHaveBeenCalledWith(1)
  })
})

describe('categories store', () => {
  it('loads categories', async () => {
    categoryList.mockResolvedValue(paginated([category]))

    const store = useCategoriesStore()
    await store.fetchCategories({ search: 'cami', page: 1 })

    expect(store.items).toHaveLength(1)
    expect(store.filters.search).toBe('cami')
    expect(store.totalCategories).toBe(1)
    expect(store.error).toBeNull()
  })

  it('surfaces the conflict message when deleting a category with products', async () => {
    categoryRemove.mockRejectedValue(
      new ApiError('No se puede eliminar la categoría porque tiene productos activos.', 409),
    )

    const store = useCategoriesStore()
    const success = await store.deleteCategory(1)

    expect(success).toBe(false)
    expect(store.error).toBe('No se puede eliminar la categoría porque tiene productos activos.')
    expect(store.deletingId).toBeNull()
  })
})
