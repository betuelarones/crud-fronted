import http from '@/services/http'
import type {
  ApiSuccess,
  Category,
  CategoryPayload,
  CategoryQuery,
  PaginatedData,
} from '@/types'

export const categoryService = {
  async list(params: CategoryQuery = {}) {
    const { data } = await http.get<ApiSuccess<PaginatedData<Category>>>('/categories', { params })
    return data
  },

  async show(id: number) {
    const { data } = await http.get<ApiSuccess<Category>>(`/categories/${id}`)
    return data
  },

  async create(payload: CategoryPayload) {
    const { data } = await http.post<ApiSuccess<Category>>('/categories', payload)
    return data
  },

  async update(id: number, payload: CategoryPayload) {
    const { data } = await http.put<ApiSuccess<Category>>(`/categories/${id}`, payload)
    return data
  },

  async remove(id: number) {
    await http.delete(`/categories/${id}`)
  },
}
