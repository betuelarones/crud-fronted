<script setup lang="ts">
import { computed } from 'vue'
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-vue-next'

const props = withDefaults(
  defineProps<{
    type?: 'success' | 'error' | 'info'
    message?: string | null
    dismissible?: boolean
  }>(),
  {
    type: 'info',
    message: null,
    dismissible: true,
  },
)

defineEmits<{
  close: []
}>()

const config = computed(() => {
  const types = {
    success: {
      wrapper: 'border-emerald-200 bg-emerald-50 text-emerald-800',
      icon: CheckCircle2,
      iconClass: 'text-emerald-600',
    },
    error: {
      wrapper: 'border-rose-200 bg-rose-50 text-rose-800',
      icon: AlertCircle,
      iconClass: 'text-rose-600',
    },
    info: {
      wrapper: 'border-sky-200 bg-sky-50 text-sky-800',
      icon: Info,
      iconClass: 'text-sky-600',
    },
  }

  return types[props.type]
})
</script>

<template>
  <div
    v-if="message"
    :class="['flex items-start gap-3 rounded-xl border px-4 py-3 text-sm', config.wrapper]"
    role="alert"
  >
    <component :is="config.icon" :class="['mt-0.5 h-4 w-4 shrink-0', config.iconClass]" />
    <p class="flex-1">{{ message }}</p>
    <button
      v-if="dismissible"
      type="button"
      class="rounded-md p-0.5 opacity-60 transition hover:opacity-100"
      aria-label="Cerrar mensaje"
      @click="$emit('close')"
    >
      <X class="h-4 w-4" />
    </button>
  </div>
</template>
