<script setup lang="ts">
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import AppButton from '@/components/AppButton.vue'
import type { Pagination } from '@/types'

const props = defineProps<{
  pagination: Pagination | null
  disabled?: boolean
}>()

const emit = defineEmits<{
  change: [page: number]
}>()

function goTo(page: number) {
  if (!props.pagination || props.disabled) {
    return
  }

  if (page < 1 || page > props.pagination.last_page || page === props.pagination.current_page) {
    return
  }

  emit('change', page)
}
</script>

<template>
  <div
    v-if="pagination && pagination.total > 0"
    class="flex flex-col gap-3 border-t border-zinc-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
  >
    <p class="text-sm text-zinc-500">
      Mostrando
      <span class="font-semibold text-zinc-700">{{ pagination.from ?? 0 }}–{{ pagination.to ?? 0 }}</span>
      de <span class="font-semibold text-zinc-700">{{ pagination.total }}</span> registros
    </p>

    <div class="flex items-center gap-2">
      <AppButton
        variant="secondary"
        size="sm"
        :disabled="disabled || pagination.current_page <= 1"
        @click="goTo(pagination.current_page - 1)"
      >
        <ChevronLeft class="h-4 w-4" />
        Anterior
      </AppButton>
      <span class="px-2 text-sm font-medium text-zinc-600">
        {{ pagination.current_page }} / {{ pagination.last_page }}
      </span>
      <AppButton
        variant="secondary"
        size="sm"
        :disabled="disabled || pagination.current_page >= pagination.last_page"
        @click="goTo(pagination.current_page + 1)"
      >
        Siguiente
        <ChevronRight class="h-4 w-4" />
      </AppButton>
    </div>
  </div>
</template>
