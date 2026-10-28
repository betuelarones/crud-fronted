<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { Menu, X } from 'lucide-vue-next'
import SidebarNav from '@/components/SidebarNav.vue'

const route = useRoute()
const mobileOpen = ref(false)

const pageTitle = computed(() => (route.meta.title as string | undefined) ?? 'Panel')

watch(
  () => route.fullPath,
  () => {
    mobileOpen.value = false
  },
)
</script>

<template>
  <div class="min-h-screen bg-zinc-100">
    <aside class="fixed inset-y-0 left-0 z-30 hidden w-64 lg:block">
      <SidebarNav />
    </aside>

    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="mobileOpen" class="fixed inset-0 z-40 lg:hidden">
        <div class="absolute inset-0 bg-ink-950/60 backdrop-blur-sm" @click="mobileOpen = false" />
        <div class="absolute inset-y-0 left-0 w-72 shadow-2xl">
          <SidebarNav @navigate="mobileOpen = false" />
          <button
            type="button"
            class="absolute right-3 top-3 rounded-lg p-1.5 text-zinc-400 transition hover:bg-white/10 hover:text-white"
            aria-label="Cerrar menú"
            @click="mobileOpen = false"
          >
            <X class="h-5 w-5" />
          </button>
        </div>
      </div>
    </Transition>

    <div class="lg:pl-64">
      <header
        class="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-zinc-200 bg-white/90 px-4 backdrop-blur sm:px-6 lg:px-8"
      >
        <button
          type="button"
          class="rounded-lg p-2 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 lg:hidden"
          aria-label="Abrir menú"
          @click="mobileOpen = true"
        >
          <Menu class="h-5 w-5" />
        </button>

        <div class="flex-1">
          <p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-400">
            Overskul Admin
          </p>
          <h1 class="text-base font-semibold text-zinc-900">{{ pageTitle }}</h1>
        </div>

        <span
          class="hidden rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 sm:inline-flex"
        >
          API v1
        </span>
        <div
          class="flex h-9 w-9 items-center justify-center rounded-full bg-ink-950 text-xs font-bold text-acid-400"
          title="Administrador"
        >
          OS
        </div>
      </header>

      <main class="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <slot />
      </main>
    </div>
  </div>
</template>
