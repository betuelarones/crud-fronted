import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { categoryService } from '@/services/categories'
import { ApiError } from '@/services/http'
import { errorMessage } from '@/utils/errors'
import type {
  ApiFieldErrors,
  Category,
  CategoryPayload,
  CategoryQuery,
  Pagination,
} from '@/types'

const DEFAULT_FILTERS: Required<Pick<CategoryQuery, 'search' | 'page' | 'per_page'>> = {
  search: '',
  page: 1,
  per_page: 100,
}

export const useCategoriesStore = defineStore('categories', () => {
  const items = ref<Category[]>([])
  const pagination = ref<Pagination | null>(null)
  const filters = ref<CategoryQuery>({ ...DEFAULT_FILTERS })
  const loading = ref(false)
  const saving = ref(false)
  const deletingId = ref<number | null>(null)
  const error = ref<string | null>(null)
  const successMessage = ref<string | null>(null)
  const validationErrors = ref<ApiFieldErrors>({})

  let listRequestId = 0
  let successTimer: ReturnType<typeof setTimeout> | undefined

  const totalCategories = computed(() => pagination.value?.total ?? items.value.length)
  const hasCategories = computed(() => items.value.length > 0)

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

  function setFilters(partial: Partial<CategoryQuery>) {
    filters.value = { ...filters.value, ...partial }
  }

  async function fetchCategories(partial: Partial<CategoryQuery> = {}) {
    if (Object.keys(partial).length > 0) {
      setFilters(partial)
    }

    const requestId = ++listRequestId
    loading.value = true
    error.value = null

    const query: CategoryQuery = {
      page: filters.value.page ?? 1,
      per_page: filters.value.per_page ?? 100,
    }

    if (filters.value.search) {
      query.search = filters.value.search
    }

    try {
      const response = await categoryService.list(query)

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

  async function fetchCategory(id: number): Promise<Category | null> {
    loading.value = true
    error.value = null

    try {
      const response = await categoryService.show(id)
      return response.data
    } catch (exception) {
      applyError(exception)
      return null
    } finally {
      loading.value = false
    }
  }

  async function createCategory(payload: CategoryPayload): Promise<boolean> {
    saving.value = true
    clearFeedback()

    try {
      const response = await categoryService.create(payload)
      setSuccessMessage(response.message)
      return true
    } catch (exception) {
      applyError(exception)
      return false
    } finally {
      saving.value = false
    }
  }

  async function updateCategory(id: number, payload: CategoryPayload): Promise<boolean> {
    saving.value = true
    clearFeedback()

    try {
      const response = await categoryService.update(id, payload)
      setSuccessMessage(response.message)
      return true
    } catch (exception) {
      applyError(exception)
      return false
    } finally {
      saving.value = false
    }
  }

  async function deleteCategory(id: number): Promise<boolean> {
    deletingId.value = id
    clearFeedback()

    try {
      await categoryService.remove(id)
      setSuccessMessage('Categoría eliminada correctamente.')
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
    pagination,
    filters,
    loading,
    saving,
    deletingId,
    error,
    successMessage,
    validationErrors,
    totalCategories,
    hasCategories,
    clearFeedback,
    resetFilters,
    setFilters,
    fetchCategories,
    fetchCategory,
    createCategory,
    updateCategory,
    deleteCategory,
  }
})
