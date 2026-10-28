import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { productService } from '@/services/products'
import { ApiError } from '@/services/http'
import { errorMessage } from '@/utils/errors'
import type {
  ApiFieldErrors,
  Pagination,
  Product,
  ProductPayload,
  ProductQuery,
} from '@/types'

const DEFAULT_FILTERS: Required<Pick<ProductQuery, 'search' | 'category_id' | 'page' | 'per_page'>> = {
  search: '',
  category_id: null,
  page: 1,
  per_page: 10,
}

export const useProductsStore = defineStore('products', () => {
  const items = ref<Product[]>([])
  const currentProduct = ref<Product | null>(null)
  const pagination = ref<Pagination | null>(null)
  const filters = ref<ProductQuery>({ ...DEFAULT_FILTERS })
  const loading = ref(false)
  const loadingProduct = ref(false)
  const saving = ref(false)
  const deletingId = ref<number | null>(null)
  const error = ref<string | null>(null)
  const successMessage = ref<string | null>(null)
  const validationErrors = ref<ApiFieldErrors>({})

  let listRequestId = 0
  let successTimer: ReturnType<typeof setTimeout> | undefined

  const totalProducts = computed(() => pagination.value?.total ?? 0)
  const hasProducts = computed(() => items.value.length > 0)

  function clearFeedback() {
    error.value = null
    successMessage.value = null
    validationErrors.value = {}
    clearTimeout(successTimer)
  }

  function setSuccessMessage(message: string) {
    successMessage.value = message
    clearTimeout(successTimer)
    successTimer = setTimeout(() => {
      successMessage.value = null
    }, 5000)
  }

  function applyError(exception: unknown) {
    error.value = errorMessage(exception)
    validationErrors.value = exception instanceof ApiError ? exception.errors : {}
  }

  function resetFilters() {
    filters.value = { ...DEFAULT_FILTERS }
  }

  function setFilters(partial: Partial<ProductQuery>) {
    filters.value = { ...filters.value, ...partial }
  }

  async function fetchProducts(partial: Partial<ProductQuery> = {}) {
    if (Object.keys(partial).length > 0) {
      setFilters(partial)
    }

    const requestId = ++listRequestId
    loading.value = true
    error.value = null

    const query: ProductQuery = {
      page: filters.value.page ?? 1,
      per_page: filters.value.per_page ?? 10,
    }

    if (filters.value.search) {
      query.search = filters.value.search
    }

    if (filters.value.category_id) {
      query.category_id = filters.value.category_id
    }

    try {
      const response = await productService.list(query)

      if (requestId !== listRequestId) {
        return
      }

      items.value = response.data.items
      pagination.value = response.data.pagination
    } catch (exception) {
      if (requestId !== listRequestId) {
        return
      }

      applyError(exception)
    } finally {
      if (requestId === listRequestId) {
        loading.value = false
      }
    }
  }

  async function fetchProduct(id: number): Promise<Product | null> {
    loadingProduct.value = true
    error.value = null

    try {
      const response = await productService.show(id)
      currentProduct.value = response.data
      return response.data
    } catch (exception) {
      applyError(exception)
      currentProduct.value = null
      return null
    } finally {
      loadingProduct.value = false
    }
  }

  async function createProduct(payload: ProductPayload): Promise<boolean> {
    saving.value = true
    clearFeedback()

    try {
      const response = await productService.create(payload)
      setSuccessMessage(response.message)
      return true
    } catch (exception) {
      applyError(exception)
      return false
    } finally {
      saving.value = false
    }
  }

  async function updateProduct(id: number, payload: ProductPayload): Promise<boolean> {
    saving.value = true
    clearFeedback()

    try {
      const response = await productService.update(id, payload)
      setSuccessMessage(response.message)
      currentProduct.value = response.data
      return true
    } catch (exception) {
      applyError(exception)
      return false
    } finally {
      saving.value = false
    }
  }

  async function deleteProduct(id: number): Promise<boolean> {
    deletingId.value = id
    clearFeedback()

    try {
      await productService.remove(id)
      setSuccessMessage('Producto eliminado correctamente.')
      return true
    } catch (exception) {
      applyError(exception)
      return false
    } finally {
      deletingId.value = null
    }
  }

  return {
    items,
    currentProduct,
    pagination,
    filters,
    loading,
    loadingProduct,
    saving,
    deletingId,
    error,
    successMessage,
    validationErrors,
    totalProducts,
    hasProducts,
    clearFeedback,
    resetFilters,
    setFilters,
    fetchProducts,
    fetchProduct,
    createProduct,
    updateProduct,
    deleteProduct,
  }
})
