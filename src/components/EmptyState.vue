<script setup lang="ts">
import { PackageOpen } from 'lucide-vue-next'

withDefaults(
  defineProps<{
    title: string
    message: string
  }>(),
  {},
)
</script>

<template>
  <div class="flex flex-col items-center justify-center px-6 py-16 text-center">
    <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400">
      <slot name="icon">
        <PackageOpen class="h-6 w-6" />
      </slot>
    </div>
    <h3 class="mt-4 text-base font-semibold text-zinc-900">{{ title }}</h3>
    <p class="mt-1 max-w-sm text-sm text-zinc-500">{{ message }}</p>
    <div v-if="$slots.action" class="mt-5">
      <slot name="action" />
    </div>
  </div>
</template>
