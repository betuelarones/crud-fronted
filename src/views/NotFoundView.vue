<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { ArrowLeft, Ghost } from 'lucide-vue-next'
import AppButton from '@/components/AppButton.vue'
</script>

<template>
  <div class="flex min-h-[60vh] flex-col items-center justify-center text-center">
    <div class="flex h-16 w-16 items-center justify-center rounded-3xl bg-ink-950 text-acid-400">
      <Ghost class="h-7 w-7" />
    </div>
    <p class="mt-6 text-sm font-bold uppercase tracking-[0.3em] text-zinc-400">Error 404</p>
    <h2 class="mt-2 text-3xl font-bold tracking-tight text-zinc-900">Página no encontrada</h2>
    <p class="mt-2 max-w-sm text-sm text-zinc-500">
      La ruta que buscas no existe o fue movida dentro del panel.
    </p>
    <RouterLink to="/" class="mt-6">
      <AppButton>
        <ArrowLeft class="h-4 w-4" />
        Volver al dashboard
      </AppButton>
    </RouterLink>
  </div>
</template>
