<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import {
  Package,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-vue-next'

import AppAlert from '@/components/AppAlert.vue'
import AppButton from '@/components/AppButton.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import EmptyState from '@/components/EmptyState.vue'
import LoadingBlock from '@/components/LoadingBlock.vue'
import PaginationBar from '@/components/PaginationBar.vue'
import { useCategoriesStore } from '@/stores/categories'
import { useProductsStore } from '@/stores/products'
import { formatCurrency } from '@/utils/format'
import type { Product } from '@/types'

const productsStore = useProductsStore()
const categoriesStore = useCategoriesStore()

const search = ref('')
const categoryId = ref<number | null>(null)
const deleteTarget = ref<Product | null>(null)

let searchTimeout: ReturnType<typeof setTimeout> | undefined

const hasActiveFilters = computed(() => search.value.trim() !== '' || categoryId.value !== null)
const isDeleting = computed(() => productsStore.deletingId !== null)

const emptyTitle = computed(() =>
  hasActiveFilters.value ? 'No encontramos productos' : 'Aún no hay productos',
)
const emptyMessage = computed(() =>
  hasActiveFilters.value
    ? 'Prueba con otra búsqueda o cambia el filtro de categoría.'
    : 'Crea tu primer producto para comenzar a gestionar el catálogo.',
)

function categoryName(product: Product): string {
  return (
    product.category?.name ||
    categoriesStore.items.find((category) => category.id === product.category_id)?.name ||
    'Sin categoría'
  )
}

function stockClasses(stock: number): string {
  if (stock === 0) {
    return 'bg-rose-50 text-rose-600'
  }

  if (stock <= 10) {
    return 'bg-amber-50 text-amber-600'
  }

  return 'bg-emerald-50 text-emerald-600'
}

function onSearchInput() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    productsStore.fetchProducts({ search: search.value, page: 1 })
  }, 350)
}

function onCategoryChange() {
  productsStore.fetchProducts({ category_id: categoryId.value, page: 1 })
}

function clearFilters() {
  clearTimeout(searchTimeout)
  search.value = ''
  categoryId.value = null
  productsStore.fetchProducts({ search: '', category_id: null, page: 1 })
}

function changePage(page: number) {
  productsStore.fetchProducts({ page })
}

async function confirmDelete() {
  const target = deleteTarget.value

  if (!target) {
    return
  }

  const currentPage = productsStore.filters.page ?? 1
  const success = await productsStore.deleteProduct(target.id)

  deleteTarget.value = null

  if (!success) {
    return
  }

  const nextPage = productsStore.items.length === 1 && currentPage > 1 ? currentPage - 1 : currentPage
  await productsStore.fetchProducts({ page: nextPage })
}

onMounted(async () => {
  await Promise.all([
    categoriesStore.fetchCategories({ page: 1, per_page: 100, search: '' }),
    (() => {
      productsStore.resetFilters()
      search.value = ''
      categoryId.value = null
      return productsStore.fetchProducts()
    })(),
  ])
})

onBeforeUnmount(() => {
  clearTimeout(searchTimeout)
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p class="text-sm font-medium text-zinc-500">Catálogo</p>
        <h2 class="mt-1 text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">Productos</h2>
        <p class="mt-1 text-sm text-zinc-500">
          Administra precios, stock y categorías de cada producto.
        </p>
      </div>
      <RouterLink to="/products/new">
        <AppButton>
          <Plus class="h-4 w-4" />
          Nuevo producto
        </AppButton>
      </RouterLink>
    </div>

    <AppAlert
      v-if="productsStore.successMessage"
      type="success"
      :message="productsStore.successMessage"
      @close="productsStore.successMessage = null"
    />
    <AppAlert
      v-if="productsStore.error"
      type="error"
      :message="productsStore.error"
      @close="productsStore.error = null"
    />
    <AppAlert
      v-if="categoriesStore.error"
      type="error"
      :message="`No se pudieron cargar las categorías: ${categoriesStore.error}`"
      @close="categoriesStore.error = null"
    />

    <div class="surface p-4">
      <div class="flex flex-col gap-3 md:flex-row md:items-center">
        <div class="relative flex-1">
          <Search class="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            v-model="search"
            type="search"
            class="field-input pl-10"
            placeholder="Buscar producto por nombre..."
            aria-label="Buscar productos"
            @input="onSearchInput"
          >
        </div>

        <div class="md:w-64">
          <select
            v-model="categoryId"
            class="field-input"
            aria-label="Filtrar por categoría"
            @change="onCategoryChange"
          >
            <option :value="null">Todas las categorías</option>
            <option v-for="category in categoriesStore.items" :key="category.id" :value="category.id">
              {{ category.name }}
            </option>
          </select>
        </div>

        <AppButton
          v-if="hasActiveFilters"
          variant="ghost"
          size="sm"
          class="md:shrink-0"
          @click="clearFilters"
        >
          <X class="h-4 w-4" />
          Limpiar filtros
        </AppButton>
      </div>
    </div>

    <div class="surface overflow-hidden">
      <div class="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
        <div class="flex items-center gap-2">
          <Package class="h-4 w-4 text-zinc-400" />
          <p class="text-sm font-semibold text-zinc-700">
            {{ productsStore.pagination?.total ?? 0 }} productos
          </p>
        </div>
        <span v-if="productsStore.loading" class="text-xs font-medium text-zinc-400">
          Actualizando...
        </span>
      </div>

      <LoadingBlock v-if="productsStore.loading && productsStore.items.length === 0" />

      <EmptyState v-else-if="productsStore.items.length === 0" :title="emptyTitle" :message="emptyMessage">
        <template #icon>
          <Package class="h-6 w-6" />
        </template>
        <template #action>
          <AppButton v-if="hasActiveFilters" variant="secondary" @click="clearFilters">
            Limpiar filtros
          </AppButton>
          <RouterLink v-else to="/products/new">
            <AppButton>
              <Plus class="h-4 w-4" />
              Crear producto
            </AppButton>
          </RouterLink>
        </template>
      </EmptyState>

      <template v-else>
        <div class="overflow-x-auto">
          <table class="w-full min-w-[760px] text-left text-sm">
            <thead class="border-b border-zinc-100 bg-zinc-50/70 text-xs uppercase tracking-wider text-zinc-500">
              <tr>
                <th class="px-5 py-3 font-semibold">Producto</th>
                <th class="px-5 py-3 font-semibold">Categoría</th>
                <th class="px-5 py-3 font-semibold">Precio</th>
                <th class="px-5 py-3 font-semibold">Stock</th>
                <th class="px-5 py-3 text-right font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-zinc-100">
              <tr
                v-for="product in productsStore.items"
                :key="product.id"
                class="transition hover:bg-zinc-50/60"
              >
                <td class="px-5 py-4">
                  <p class="font-semibold text-zinc-900">{{ product.name }}</p>
                  <p class="mt-0.5 max-w-sm truncate text-xs text-zinc-400">
                    {{ product.description || 'Sin descripción' }}
                  </p>
                </td>
                <td class="px-5 py-4">
                  <span class="inline-flex rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600">
                    {{ categoryName(product) }}
                  </span>
                </td>
                <td class="px-5 py-4 font-semibold text-zinc-800">
                  {{ formatCurrency(product.price) }}
                </td>
                <td class="px-5 py-4">
                  <span :class="['inline-flex rounded-full px-2.5 py-1 text-xs font-semibold', stockClasses(product.stock)]">
                    {{ product.stock }} u.
                  </span>
                </td>
                <td class="px-5 py-4">
                  <div class="flex items-center justify-end gap-1">
                    <RouterLink
                      :to="`/products/${product.id}/edit`"
                      class="rounded-lg p-2 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900"
                      title="Editar producto"
                      aria-label="Editar producto"
                    >
                      <Pencil class="h-4 w-4" />
                    </RouterLink>
                    <button
                      type="button"
                      class="rounded-lg p-2 text-zinc-500 transition hover:bg-rose-50 hover:text-rose-600"
                      title="Eliminar producto"
                      aria-label="Eliminar producto"
                      @click="deleteTarget = product"
                    >
                      <Trash2 class="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <PaginationBar
          :pagination="productsStore.pagination"
          :disabled="productsStore.loading"
          @change="changePage"
        />
      </template>
    </div>

    <ConfirmDialog
      :open="deleteTarget !== null"
      title="Eliminar producto"
      :message="`¿Seguro que deseas eliminar «${deleteTarget?.name ?? ''}»?`"
      :loading="isDeleting"
      @confirm="confirmDelete"
      @cancel="deleteTarget = null"
    />
  </div>
</template>
