<script setup lang="ts">
import { computed } from 'vue'
import { Loader2 } from 'lucide-vue-next'

const props = withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'accent'
    size?: 'sm' | 'md'
    type?: 'button' | 'submit' | 'reset'
    loading?: boolean
    disabled?: boolean
  }>(),
  {
    variant: 'primary',
    size: 'md',
    type: 'button',
    loading: false,
    disabled: false,
  },
)

const variantClasses = computed(() => {
  const variants = {
    primary: 'bg-ink-950 text-white hover:bg-zinc-800 focus-visible:ring-zinc-950/30',
    secondary:
      'border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50 focus-visible:ring-zinc-400/30',
    danger: 'bg-rose-600 text-white hover:bg-rose-700 focus-visible:ring-rose-500/30',
    ghost: 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 focus-visible:ring-zinc-400/30',
    accent: 'bg-acid-400 text-ink-950 hover:bg-acid-300 focus-visible:ring-acid-500/40',
  }

  return variants[props.variant]
})

const sizeClasses = computed(() =>
  props.size === 'sm' ? 'px-3 py-2 text-xs' : 'px-4 py-2.5 text-sm',
)
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="[
      'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-60',
      variantClasses,
      sizeClasses,
    ]"
  >
    <Loader2 v-if="loading" class="h-4 w-4 animate-spin" />
    <slot />
  </button>
</template>
