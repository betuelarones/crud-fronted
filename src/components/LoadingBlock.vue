<script setup lang="ts">
import { Loader2 } from 'lucide-vue-next'

withDefaults(
  defineProps<{
    text?: string
  }>(),
  {
    text: 'Cargando información...',
  },
)
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
    <Loader2 class="h-7 w-7 animate-spin text-zinc-400" />
    <p class="text-sm text-zinc-500">{{ text }}</p>
  </div>
</template>
