<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import {
  ArrowLeft,
  Save,
  Trash2,
  TriangleAlert,
} from 'lucide-vue-next'

import AppAlert from '@/components/AppAlert.vue'
import AppButton from '@/components/AppButton.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import LoadingBlock from '@/components/LoadingBlock.vue'
import { useCategoriesStore } from '@/stores/categories'
import { useProductsStore } from '@/stores/products'
import { validateProduct } from '@/utils/validation'
import type { FormErrors } from '@/utils/validation'
import type { ProductPayload } from '@/types'

const route = useRoute()
const router = useRouter()
const productsStore = useProductsStore()
const categoriesStore = useCategoriesStore()

const isEdit = computed(() => route.name === 'product-edit')
const productId = computed(() => Number(route.params.id))

const form = reactive({
  name: '',
  description: '',
  price: '',
  stock: '0',
  category_id: null as number | null,
})

const errors = ref<FormErrors>({})
const deleteOpen = ref(false)

const title = computed(() => (isEdit.value ? 'Editar producto' : 'Nuevo producto'))
const subtitle = computed(() =>
  isEdit.value
    ? 'Actualiza la información del producto y guarda los cambios.'
    : 'Completa la información para agregar un producto al catálogo.',
)

function fieldError(field: keyof typeof form): string {
  return errors.value[field] ?? productsStore.validationErrors[field]?.[0] ?? ''
}

function clearFieldError(field: keyof typeof form) {
  delete errors.value[field]
  delete productsStore.validationErrors[field]
}

async function onSubmit() {
  errors.value = validateProduct(form)

  if (Object.keys(errors.value).length > 0) {
    return
  }

  const payload: ProductPayload = {
    name: form.name.trim(),
    description: form.description.trim() || null,
    price: Number(form.price),
    stock: Number(form.stock),
    category_id: Number(form.category_id),
  }

  const success = isEdit.value
    ? await productsStore.updateProduct(productId.value, payload)
    : await productsStore.createProduct(payload)

  if (success) {
    await router.push({ name: 'products' })
  }
}

async function confirmDelete() {
  const success = await productsStore.deleteProduct(productId.value)

  if (success) {
    await router.push({ name: 'products' })
  }

  deleteOpen.value = false
}

onMounted(async () => {
  productsStore.clearFeedback()
  errors.value = {}

  await categoriesStore.fetchCategories({ page: 1, per_page: 100, search: '' })

  if (!isEdit.value) {
    return
  }

  const product = await productsStore.fetchProduct(productId.value)

  if (!product) {
    return
  }

  form.name = product.name
  form.description = product.description ?? ''
  form.price = product.price
  form.stock = String(product.stock)
  form.category_id = product.category_id
})
</script>

<template>
  <div class="mx-auto max-w-3xl space-y-6">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <RouterLink
          to="/products"
          class="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 transition hover:text-zinc-900"
        >
          <ArrowLeft class="h-4 w-4" />
          Volver a productos
        </RouterLink>
        <h2 class="mt-3 text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">{{ title }}</h2>
        <p class="mt-1 text-sm text-zinc-500">{{ subtitle }}</p>
      </div>
    </div>

    <AppAlert
      v-if="productsStore.error"
      type="error"
      :message="productsStore.error"
      @close="productsStore.error = null"
    />

    <div v-if="productsStore.loadingProduct" class="surface">
      <LoadingBlock text="Cargando producto..." />
    </div>

    <div
      v-else-if="isEdit && !productsStore.currentProduct"
      class="surface flex flex-col items-center px-6 py-14 text-center"
    >
      <div class="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600">
        <TriangleAlert class="h-5 w-5" />
      </div>
      <h3 class="mt-4 text-base font-semibold text-zinc-900">Producto no disponible</h3>
      <p class="mt-1 max-w-sm text-sm text-zinc-500">
        El producto no existe o fue eliminado. Vuelve al listado para continuar.
      </p>
      <RouterLink to="/products" class="mt-5">
        <AppButton variant="secondary">Volver al listado</AppButton>
      </RouterLink>
    </div>

    <form v-else class="space-y-6" novalidate @submit.prevent="onSubmit">
      <div class="surface p-5 sm:p-6">
        <h3 class="text-sm font-semibold uppercase tracking-wider text-zinc-400">Información básica</h3>

        <div class="mt-5 grid gap-5 sm:grid-cols-2">
          <div class="sm:col-span-2">
            <label for="name" class="field-label">Nombre <span class="text-rose-500">*</span></label>
            <input
              id="name"
              v-model="form.name"
              type="text"
              maxlength="150"
              :class="['field-input', fieldError('name') ? 'field-input-error' : '']"
              placeholder="Ej. Camiseta Overskull Black"
              @input="clearFieldError('name')"
            >
            <p v-if="fieldError('name')" class="field-error">{{ fieldError('name') }}</p>
          </div>

          <div class="sm:col-span-2">
            <label for="description" class="field-label">Descripción</label>
            <textarea
              id="description"
              v-model="form.description"
              rows="3"
              maxlength="2000"
              :class="['field-input resize-none', fieldError('description') ? 'field-input-error' : '']"
              placeholder="Describe brevemente el producto..."
              @input="clearFieldError('description')"
            />
            <p v-if="fieldError('description')" class="field-error">{{ fieldError('description') }}</p>
          </div>

          <div>
            <label for="price" class="field-label">Precio (S/) <span class="text-rose-500">*</span></label>
            <input
              id="price"
              v-model="form.price"
              type="number"
              min="0.01"
              step="0.01"
              :class="['field-input', fieldError('price') ? 'field-input-error' : '']"
              placeholder="0.00"
              @input="clearFieldError('price')"
            >
            <p v-if="fieldError('price')" class="field-error">{{ fieldError('price') }}</p>
          </div>

          <div>
            <label for="stock" class="field-label">Stock <span class="text-rose-500">*</span></label>
            <input
              id="stock"
              v-model="form.stock"
              type="number"
              min="0"
              step="1"
              :class="['field-input', fieldError('stock') ? 'field-input-error' : '']"
              placeholder="0"
              @input="clearFieldError('stock')"
            >
            <p v-if="fieldError('stock')" class="field-error">{{ fieldError('stock') }}</p>
          </div>

          <div class="sm:col-span-2">
            <label for="category_id" class="field-label">
              Categoría <span class="text-rose-500">*</span>
            </label>
            <select
              id="category_id"
              v-model="form.category_id"
              :class="['field-input', fieldError('category_id') ? 'field-input-error' : '']"
              @change="clearFieldError('category_id')"
            >
              <option :value="null" disabled>Selecciona una categoría activa</option>
              <option v-for="category in categoriesStore.items" :key="category.id" :value="category.id">
                {{ category.name }}
              </option>
            </select>
            <p v-if="fieldError('category_id')" class="field-error">{{ fieldError('category_id') }}</p>
            <p v-if="categoriesStore.items.length === 0" class="mt-2 text-xs text-zinc-500">
              No hay categorías activas.
              <RouterLink to="/categories" class="font-semibold text-zinc-800 underline">
                Crea una categoría primero
              </RouterLink>.
            </p>
          </div>
        </div>
      </div>

      <div class="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <AppButton
            v-if="isEdit"
            variant="ghost"
            class="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
            :disabled="productsStore.saving"
            @click="deleteOpen = true"
          >
            <Trash2 class="h-4 w-4" />
            Eliminar producto
          </AppButton>
        </div>

        <div class="flex justify-end gap-3">
          <RouterLink to="/products">
            <AppButton variant="secondary" type="button" :disabled="productsStore.saving">
              Cancelar
            </AppButton>
          </RouterLink>
          <AppButton type="submit" :loading="productsStore.saving">
            <Save class="h-4 w-4" />
            {{ isEdit ? 'Guardar cambios' : 'Crear producto' }}
          </AppButton>
        </div>
      </div>
    </form>

    <ConfirmDialog
      :open="deleteOpen"
      title="Eliminar producto"
      :message="`¿Seguro que deseas eliminar «${productsStore.currentProduct?.name ?? form.name}»?`"
      :loading="productsStore.deletingId !== null"
      @confirm="confirmDelete"
      @cancel="deleteOpen = false"
    />
  </div>
</template>
