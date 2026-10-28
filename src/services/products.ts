import http from '@/services/http'
import type {
  ApiSuccess,
  PaginatedData,
  Product,
  ProductPayload,
  ProductQuery,
} from '@/types'

export const productService = {
  async list(params: ProductQuery = {}) {
    const { data } = await http.get<ApiSuccess<PaginatedData<Product>>>('/products', { params })
    return data
  },

  async show(id: number) {
    const { data } = await http.get<ApiSuccess<Product>>(`/products/${id}`)
    return data
  },

  async create(payload: ProductPayload) {
    const { data } = await http.post<ApiSuccess<Product>>('/products', payload)
    return data
  },

  async update(id: number, payload: ProductPayload) {
    const { data } = await http.put<ApiSuccess<Product>>(`/products/${id}`, payload)
    return data
  },

  async remove(id: number) {
    await http.delete(`/products/${id}`)
  },
}
