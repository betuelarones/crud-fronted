<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import {
  ArrowRight,
  ArrowUpRight,
  Boxes,
  Package,
  Plus,
  Tags,
  TrendingUp,
} from 'lucide-vue-next'

import AppAlert from '@/components/AppAlert.vue'
import AppButton from '@/components/AppButton.vue'
import EmptyState from '@/components/EmptyState.vue'
import LoadingBlock from '@/components/LoadingBlock.vue'
import { useCategoriesStore } from '@/stores/categories'
import { useProductsStore } from '@/stores/products'
import { formatCurrency, formatDate } from '@/utils/format'

const productsStore = useProductsStore()
const categoriesStore = useCategoriesStore()

const recentProducts = computed(() => productsStore.items)
const isLoading = computed(() => productsStore.loading || categoriesStore.loading)

const quickActions = [
  {
    label: 'Nuevo producto',
    description: 'Añade un producto al catálogo.',
    to: '/products/new',
    icon: Plus,
  },
  {
    label: 'Nueva categoría',
    description: 'Organiza tu catálogo por colecciones.',
    to: '/categories',
    icon: Tags,
  },
  {
    label: 'Ver productos',
    description: 'Gestiona precios y stock.',
    to: '/products',
    icon: Package,
  },
  {
    label: 'Ver categorías',
    description: 'Revisa las categorías activas.',
    to: '/categories',
    icon: Boxes,
  },
]

onMounted(async () => {
  productsStore.clearFeedback()
  categoriesStore.clearFeedback()

  await Promise.all([
    productsStore.fetchProducts({ page: 1, per_page: 5, search: '', category_id: null }),
    categoriesStore.fetchCategories({ page: 1, per_page: 1, search: '' }),
  ])
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p class="text-sm font-medium text-zinc-500">Resumen general</p>
        <h2 class="mt-1 text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
          Tu catálogo, de un vistazo
        </h2>
        <p class="mt-1 text-sm text-zinc-500">
          Controla el inventario y mantén tus categorías al día.
        </p>
      </div>
      <RouterLink to="/products/new">
        <AppButton variant="primary">
          <Plus class="h-4 w-4" />
          Nuevo producto
        </AppButton>
      </RouterLink>
    </div>

    <AppAlert
      v-if="productsStore.error"
      type="error"
      :message="productsStore.error"
      @close="productsStore.error = null"
    />
    <AppAlert
      v-if="categoriesStore.error"
      type="error"
      :message="categoriesStore.error"
      @close="categoriesStore.error = null"
    />

    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <div class="surface p-5">
        <div class="flex items-start justify-between">
          <div>
            <p class="text-xs font-semibold uppercase tracking-wider text-zinc-400">Productos activos</p>
            <p class="mt-3 text-3xl font-bold tracking-tight text-zinc-900">
              {{ productsStore.totalProducts }}
            </p>
          </div>
          <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-ink-950 text-acid-400">
            <Package class="h-5 w-5" />
          </div>
        </div>
        <p class="mt-4 flex items-center gap-1.5 text-xs text-zinc-500">
          <TrendingUp class="h-3.5 w-3.5 text-emerald-500" />
          Registros activos en la base de datos
        </p>
      </div>

      <div class="surface p-5">
        <div class="flex items-start justify-between">
          <div>
            <p class="text-xs font-semibold uppercase tracking-wider text-zinc-400">Categorías activas</p>
            <p class="mt-3 text-3xl font-bold tracking-tight text-zinc-900">
              {{ categoriesStore.totalCategories }}
            </p>
          </div>
          <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-acid-400 text-ink-950">
            <Tags class="h-5 w-5" />
          </div>
        </div>
        <p class="mt-4 flex items-center gap-1.5 text-xs text-zinc-500">
          <Boxes class="h-3.5 w-3.5 text-zinc-400" />
          Colecciones disponibles
        </p>
      </div>

      <div class="surface p-5 sm:col-span-2">
        <div class="flex items-center justify-between">
          <p class="text-xs font-semibold uppercase tracking-wider text-zinc-400">Accesos rápidos</p>
          <ArrowUpRight class="h-4 w-4 text-zinc-400" />
        </div>
        <div class="mt-3 grid gap-2 sm:grid-cols-2">
          <RouterLink
            v-for="action in quickActions"
            :key="action.label"
            :to="action.to"
            class="group flex items-center gap-3 rounded-xl border border-zinc-100 px-3 py-2.5 transition hover:border-zinc-200 hover:bg-zinc-50"
          >
            <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600 transition group-hover:bg-ink-950 group-hover:text-acid-400">
              <component :is="action.icon" class="h-4 w-4" />
            </div>
            <div class="min-w-0">
              <p class="truncate text-sm font-semibold text-zinc-800">{{ action.label }}</p>
              <p class="truncate text-xs text-zinc-500">{{ action.description }}</p>
            </div>
          </RouterLink>
        </div>
      </div>
    </div>

    <div class="surface overflow-hidden">
      <div class="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
        <div>
          <h3 class="text-base font-semibold text-zinc-900">Productos recientes</h3>
          <p class="text-sm text-zinc-500">Los últimos productos agregados al catálogo.</p>
        </div>
        <RouterLink
          to="/products"
          class="inline-flex items-center gap-1 text-sm font-semibold text-zinc-600 transition hover:text-zinc-900"
        >
          Ver todos
          <ArrowRight class="h-4 w-4" />
        </RouterLink>
      </div>

      <LoadingBlock v-if="isLoading && recentProducts.length === 0" text="Cargando dashboard..." />

      <EmptyState
        v-else-if="recentProducts.length === 0"
        title="Aún no hay productos"
        message="Crea tu primer producto para comenzar a llenar el catálogo."
      >
        <template #action>
          <RouterLink to="/products/new">
            <AppButton variant="primary">
              <Plus class="h-4 w-4" />
              Crear producto
            </AppButton>
          </RouterLink>
        </template>
      </EmptyState>

      <div v-else class="overflow-x-auto">
        <table class="w-full min-w-[640px] text-left text-sm">
          <thead class="border-b border-zinc-100 bg-zinc-50/70 text-xs uppercase tracking-wider text-zinc-500">
            <tr>
              <th class="px-5 py-3 font-semibold">Producto</th>
              <th class="px-5 py-3 font-semibold">Categoría</th>
              <th class="px-5 py-3 font-semibold">Precio</th>
              <th class="px-5 py-3 font-semibold">Stock</th>
              <th class="px-5 py-3 font-semibold">Creado</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-zinc-100">
            <tr v-for="product in recentProducts" :key="product.id" class="transition hover:bg-zinc-50/60">
              <td class="px-5 py-3.5">
                <RouterLink
                  :to="`/products/${product.id}/edit`"
                  class="font-semibold text-zinc-900 transition hover:text-zinc-600"
                >
                  {{ product.name }}
                </RouterLink>
                <p class="max-w-xs truncate text-xs text-zinc-400">
                  {{ product.description || 'Sin descripción' }}
                </p>
              </td>
              <td class="px-5 py-3.5">
                <span class="inline-flex rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600">
                  {{ product.category?.name || 'Sin categoría' }}
                </span>
              </td>
              <td class="px-5 py-3.5 font-medium text-zinc-700">
                {{ formatCurrency(product.price) }}
              </td>
              <td class="px-5 py-3.5">
                <span
                  :class="[
                    'inline-flex rounded-full px-2.5 py-1 text-xs font-semibold',
                    product.stock === 0
                      ? 'bg-rose-50 text-rose-600'
                      : product.stock <= 10
                        ? 'bg-amber-50 text-amber-600'
                        : 'bg-emerald-50 text-emerald-600',
                  ]"
                >
                  {{ product.stock }} u.
                </span>
              </td>
              <td class="px-5 py-3.5 text-zinc-500">{{ formatDate(product.created_at) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
