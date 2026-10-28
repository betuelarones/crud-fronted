<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import {
  Boxes,
  Pencil,
  Plus,
  Search,
  Tags,
  Trash2,
} from 'lucide-vue-next'

import AppAlert from '@/components/AppAlert.vue'
import AppButton from '@/components/AppButton.vue'
import AppModal from '@/components/AppModal.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import EmptyState from '@/components/EmptyState.vue'
import LoadingBlock from '@/components/LoadingBlock.vue'
import PaginationBar from '@/components/PaginationBar.vue'
import { useCategoriesStore } from '@/stores/categories'
import { validateCategory } from '@/utils/validation'
import type { FormErrors } from '@/utils/validation'
import type { Category, CategoryPayload } from '@/types'

const categoriesStore = useCategoriesStore()

const search = ref('')
const formOpen = ref(false)
const editing = ref<Category | null>(null)
const deleteTarget = ref<Category | null>(null)
const errors = ref<FormErrors>({})

const form = reactive({
  name: '',
  description: '',
})

let searchTimeout: ReturnType<typeof setTimeout> | undefined

const modalTitle = computed(() => (editing.value ? 'Editar categoría' : 'Nueva categoría'))
const modalSubtitle = computed(() =>
  editing.value
    ? 'Actualiza el nombre o la descripción de la categoría.'
    : 'Agrupa tus productos en una nueva colección.',
)
const isDeleting = computed(() => categoriesStore.deletingId !== null)

function fieldError(field: keyof typeof form): string {
  return errors.value[field] ?? categoriesStore.validationErrors[field]?.[0] ?? ''
}

function clearFieldError(field: keyof typeof form) {
  delete errors.value[field]
  delete categoriesStore.validationErrors[field]
}

function openCreate() {
  categoriesStore.clearFeedback()
  editing.value = null
  form.name = ''
  form.description = ''
  errors.value = {}
  formOpen.value = true
}

function openEdit(category: Category) {
  categoriesStore.clearFeedback()
  editing.value = category
  form.name = category.name
  form.description = category.description ?? ''
  errors.value = {}
  formOpen.value = true
}

function closeModal() {
  if (categoriesStore.saving) {
    return
  }

  formOpen.value = false
}

async function onSubmit() {
  errors.value = validateCategory(form)

  if (Object.keys(errors.value).length > 0) {
    return
  }

  const payload: CategoryPayload = {
    name: form.name.trim(),
    description: form.description.trim() || null,
  }

  const success = editing.value
    ? await categoriesStore.updateCategory(editing.value.id, payload)
    : await categoriesStore.createCategory(payload)

  if (!success) {
    return
  }

  formOpen.value = false
  await categoriesStore.fetchCategories({ page: categoriesStore.filters.page ?? 1 })
}

async function confirmDelete() {
  const target = deleteTarget.value

  if (!target) {
    return
  }

  const currentPage = categoriesStore.filters.page ?? 1
  const success = await categoriesStore.deleteCategory(target.id)
  deleteTarget.value = null

  if (!success) {
    return
  }

  const nextPage =
    categoriesStore.items.length === 1 && currentPage > 1 ? currentPage - 1 : currentPage
  await categoriesStore.fetchCategories({ page: nextPage })
}

function onSearchInput() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    categoriesStore.fetchCategories({ search: search.value, page: 1 })
  }, 350)
}

function changePage(page: number) {
  categoriesStore.fetchCategories({ page })
}

onMounted(async () => {
  search.value = categoriesStore.filters.search ?? ''
  await categoriesStore.fetchCategories()
})

onBeforeUnmount(() => {
  clearTimeout(searchTimeout)
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p class="text-sm font-medium text-zinc-500">Organización</p>
        <h2 class="mt-1 text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">Categorías</h2>
        <p class="mt-1 text-sm text-zinc-500">
          Crea y edita las colecciones que agrupan tus productos.
        </p>
      </div>
      <AppButton @click="openCreate">
        <Plus class="h-4 w-4" />
        Nueva categoría
      </AppButton>
    </div>

    <AppAlert
      v-if="categoriesStore.successMessage"
      type="success"
      :message="categoriesStore.successMessage"
      @close="categoriesStore.successMessage = null"
    />
    <AppAlert
      v-if="categoriesStore.error"
      type="error"
      :message="categoriesStore.error"
      @close="categoriesStore.error = null"
    />

    <div class="surface p-4">
      <div class="relative">
        <Search class="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        <input
          v-model="search"
          type="search"
          class="field-input pl-10"
          placeholder="Buscar categoría por nombre..."
          aria-label="Buscar categorías"
          @input="onSearchInput"
        >
      </div>
    </div>

    <div class="surface overflow-hidden">
      <div class="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
        <div class="flex items-center gap-2">
          <Boxes class="h-4 w-4 text-zinc-400" />
          <p class="text-sm font-semibold text-zinc-700">
            {{ categoriesStore.pagination?.total ?? categoriesStore.items.length }} categorías
          </p>
        </div>
        <span v-if="categoriesStore.loading" class="text-xs font-medium text-zinc-400">
          Actualizando...
        </span>
      </div>

      <LoadingBlock v-if="categoriesStore.loading && categoriesStore.items.length === 0" />

      <EmptyState
        v-else-if="categoriesStore.items.length === 0"
        :title="search ? 'No encontramos categorías' : 'Aún no hay categorías'"
        :message="
          search
            ? 'Prueba con otro término de búsqueda.'
            : 'Crea tu primera categoría para organizar el catálogo.'
        "
      >
        <template #icon>
          <Tags class="h-6 w-6" />
        </template>
        <template #action>
          <AppButton v-if="search" variant="secondary" @click="search = ''; categoriesStore.fetchCategories({ search: '', page: 1 })">
            Limpiar búsqueda
          </AppButton>
          <AppButton v-else @click="openCreate">
            <Plus class="h-4 w-4" />
            Crear categoría
          </AppButton>
        </template>
      </EmptyState>

      <template v-else>
        <div class="overflow-x-auto">
          <table class="w-full min-w-[620px] text-left text-sm">
            <thead class="border-b border-zinc-100 bg-zinc-50/70 text-xs uppercase tracking-wider text-zinc-500">
              <tr>
                <th class="px-5 py-3 font-semibold">Categoría</th>
                <th class="px-5 py-3 font-semibold">Productos</th>
                <th class="px-5 py-3 text-right font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-zinc-100">
              <tr
                v-for="category in categoriesStore.items"
                :key="category.id"
                class="transition hover:bg-zinc-50/60"
              >
                <td class="px-5 py-4">
                  <div class="flex items-center gap-3">
                    <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-500">
                      <Tags class="h-4 w-4" />
                    </div>
                    <div>
                      <p class="font-semibold text-zinc-900">{{ category.name }}</p>
                      <p class="mt-0.5 max-w-md truncate text-xs text-zinc-400">
                        {{ category.description || 'Sin descripción' }}
                      </p>
                    </div>
                  </div>
                </td>
                <td class="px-5 py-4">
                  <span class="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-600">
                    {{ category.products_count ?? 0 }} productos
                  </span>
                </td>
                <td class="px-5 py-4">
                  <div class="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      class="rounded-lg p-2 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900"
                      title="Editar categoría"
                      aria-label="Editar categoría"
                      @click="openEdit(category)"
                    >
                      <Pencil class="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      class="rounded-lg p-2 text-zinc-500 transition hover:bg-rose-50 hover:text-rose-600"
                      title="Eliminar categoría"
                      aria-label="Eliminar categoría"
                      @click="deleteTarget = category"
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
          :pagination="categoriesStore.pagination"
          :disabled="categoriesStore.loading"
          @change="changePage"
        />
      </template>
    </div>

    <AppModal
      :open="formOpen"
      :title="modalTitle"
      :subtitle="modalSubtitle"
      @close="closeModal"
    >
      <form class="space-y-5" novalidate @submit.prevent="onSubmit">
        <div>
          <label for="category-name" class="field-label">
            Nombre <span class="text-rose-500">*</span>
          </label>
          <input
            id="category-name"
            v-model="form.name"
            type="text"
            maxlength="120"
            :class="['field-input', fieldError('name') ? 'field-input-error' : '']"
            placeholder="Ej. Camisetas"
            @input="clearFieldError('name')"
          >
          <p v-if="fieldError('name')" class="field-error">{{ fieldError('name') }}</p>
        </div>

        <div>
          <label for="category-description" class="field-label">Descripción</label>
          <textarea
            id="category-description"
            v-model="form.description"
            rows="3"
            maxlength="2000"
            :class="['field-input resize-none', fieldError('description') ? 'field-input-error' : '']"
            placeholder="Describe brevemente esta categoría..."
            @input="clearFieldError('description')"
          />
          <p v-if="fieldError('description')" class="field-error">{{ fieldError('description') }}</p>
        </div>

        <div class="flex justify-end gap-3 border-t border-zinc-100 pt-5">
          <AppButton variant="secondary" type="button" :disabled="categoriesStore.saving" @click="closeModal">
            Cancelar
          </AppButton>
          <AppButton type="submit" :loading="categoriesStore.saving">
            {{ editing ? 'Guardar cambios' : 'Crear categoría' }}
          </AppButton>
        </div>
      </form>
    </AppModal>

    <ConfirmDialog
      :open="deleteTarget !== null"
      title="Eliminar categoría"
      :message="`¿Seguro que deseas eliminar «${deleteTarget?.name ?? ''}»? No podrás eliminarla si tiene productos activos.`"
      :loading="isDeleting"
      @confirm="confirmDelete"
      @cancel="deleteTarget = null"
    />
  </div>
</template>
