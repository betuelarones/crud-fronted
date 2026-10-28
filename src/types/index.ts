export interface Category {
  id: number
  name: string
  description: string | null
  products_count?: number
  created_at?: string | null
  updated_at?: string | null
}

export interface Product {
  id: number
  name: string
  description: string | null
  price: string
  stock: number
  category_id: number
  category?: Category | null
  created_at?: string | null
  updated_at?: string | null
}

export interface Pagination {
  current_page: number
  per_page: number
  total: number
  last_page: number
  from: number | null
  to: number | null
}

export interface PaginatedData<T> {
  items: T[]
  pagination: Pagination
}

export interface ApiSuccess<T> {
  success: true
  message: string
  data: T
}

export type ApiFieldErrors = Record<string, string[]>

export interface CategoryPayload {
  name: string
  description?: string | null
}

export interface ProductPayload {
  name: string
  description?: string | null
  price: number
  stock: number
  category_id: number
}

export interface ProductQuery {
  search?: string
  category_id?: number | null
  page?: number
  per_page?: number
}

export interface CategoryQuery {
  search?: string
  page?: number
  per_page?: number
}
