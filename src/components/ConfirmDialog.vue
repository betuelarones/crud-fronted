<script setup lang="ts">
import { AlertTriangle } from 'lucide-vue-next'
import AppButton from '@/components/AppButton.vue'

withDefaults(
  defineProps<{
    open: boolean
    title: string
    message: string
    confirmLabel?: string
    cancelLabel?: string
    loading?: boolean
    danger?: boolean
  }>(),
  {
    confirmLabel: 'Eliminar',
    cancelLabel: 'Cancelar',
    loading: false,
    danger: true,
  },
)

defineEmits<{
  confirm: []
  cancel: []
}>()
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/50 p-4 backdrop-blur-sm"
        @click.self="!loading && $emit('cancel')"
      >
        <div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" role="dialog" aria-modal="true">
          <div class="flex items-start gap-4">
            <div
              :class="[
                'flex h-11 w-11 shrink-0 items-center justify-center rounded-full',
                danger ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600',
              ]"
            >
              <AlertTriangle class="h-5 w-5" />
            </div>
            <div>
              <h2 class="text-lg font-semibold text-zinc-900">{{ title }}</h2>
              <p class="mt-1.5 text-sm leading-relaxed text-zinc-600">{{ message }}</p>
            </div>
          </div>

          <div class="mt-6 flex justify-end gap-3">
            <AppButton variant="secondary" :disabled="loading" @click="$emit('cancel')">
              {{ cancelLabel }}
            </AppButton>
            <AppButton
              :variant="danger ? 'danger' : 'primary'"
              :loading="loading"
              @click="$emit('confirm')"
            >
              {{ confirmLabel }}
            </AppButton>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
