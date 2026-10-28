<script setup lang="ts">
import { X } from 'lucide-vue-next'

withDefaults(
  defineProps<{
    open: boolean
    title: string
    subtitle?: string
    maxWidth?: string
  }>(),
  {
    subtitle: '',
    maxWidth: 'max-w-lg',
  },
)

defineEmits<{
  close: []
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
        @click.self="$emit('close')"
      >
        <div :class="['w-full rounded-2xl bg-white shadow-2xl', maxWidth]" role="dialog" aria-modal="true">
          <div class="flex items-start justify-between border-b border-zinc-100 px-6 py-5">
            <div>
              <h2 class="text-lg font-semibold text-zinc-900">{{ title }}</h2>
              <p v-if="subtitle" class="mt-1 text-sm text-zinc-500">{{ subtitle }}</p>
            </div>
            <button
              type="button"
              class="rounded-lg p-1.5 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700"
              aria-label="Cerrar"
              @click="$emit('close')"
            >
              <X class="h-5 w-5" />
            </button>
          </div>

          <div class="px-6 py-5">
            <slot />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
