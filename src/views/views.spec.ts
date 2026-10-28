import { flushPromises, mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest'

import { categoryService } from '@/services/categories'
import { productService } from '@/services/products'
import CategoriesView from '@/views/CategoriesView.vue'
import DashboardView from '@/views/DashboardView.vue'
import ProductFormView from '@/views/ProductFormView.vue'
import ProductsView from '@/views/ProductsView.vue'
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
const categoryList = categoryService.list as unknown as Mock

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
  description: 'Algodón peruano',
  price: '89.90',
  stock: 5,
  category_id: 1,
  category,
  created_at: '2026-10-28T12:00:00.000000Z',
}

function paginated<T>(items: T[]) {
  return { success: true as const, message: 'OK', data: { items, pagination } }
}

function createTestRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'dashboard', component: { template: '<div />' } },
      { path: '/products', name: 'products', component: { template: '<div />' } },
      { path: '/products/new', name: 'product-create', component: { template: '<div />' } },
      { path: '/products/:id/edit', name: 'product-edit', component: { template: '<div />' } },
      { path: '/categories', name: 'categories', component: { template: '<div />' } },
    ],
  })
}

async function mountView(component: object, path = '/') {
  const router = createTestRouter()
  await router.push(path)
  await router.isReady()

  const wrapper = mount(component, {
    global: {
      plugins: [createPinia(), router],
    },
  })

  await flushPromises()
  await flushPromises()

  return wrapper
}

beforeEach(() => {
  vi.clearAllMocks()
  productList.mockResolvedValue(paginated([product]))
  categoryList.mockResolvedValue(paginated([category]))
})

describe('main views', () => {
  it('renders the dashboard with totals and recent products', async () => {
    const wrapper = await mountView(DashboardView)

    expect(wrapper.text()).toContain('Tu catálogo, de un vistazo')
    expect(wrapper.text()).toContain('Productos activos')
    expect(wrapper.text()).toContain('Camiseta Test')
    expect(wrapper.text()).toContain('Camisetas')
  })

  it('renders the product list with its category', async () => {
    const wrapper = await mountView(ProductsView, '/products')

    expect(wrapper.text()).toContain('Administra precios, stock y categorías')
    expect(wrapper.text()).toContain('Camiseta Test')
    expect(wrapper.text()).toContain('Camisetas')
    expect(productList).toHaveBeenCalled()
  })

  it('renders the category list', async () => {
    const wrapper = await mountView(CategoriesView, '/categories')

    expect(wrapper.text()).toContain('Crea y edita las colecciones')
    expect(wrapper.text()).toContain('Camisetas')
    expect(wrapper.text()).toContain('1 productos')
  })

  it('renders the empty product form with the active categories', async () => {
    const wrapper = await mountView(ProductFormView, '/products/new')

    expect(wrapper.text()).toContain('Nuevo producto')
    expect(wrapper.text()).toContain('Información básica')
    expect(wrapper.text()).toContain('Camisetas')
  })
})
