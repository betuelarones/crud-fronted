<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import {
  ArrowUpRight,
  LayoutDashboard,
  Package,
  Skull,
  Tags,
} from 'lucide-vue-next'

const route = useRoute()

defineEmits<{
  navigate: []
}>()

const navItems = [
  { label: 'Dashboard', to: '/', icon: LayoutDashboard },
  { label: 'Productos', to: '/products', icon: Package },
  { label: 'Categorías', to: '/categories', icon: Tags },
]

const docsUrl = computed(
  () => import.meta.env.VITE_API_DOCS_URL || 'http://127.0.0.1:8000/api/docs',
)

function isActive(path: string): boolean {
  if (path === '/') {
    return route.path === '/'
  }

  return route.path.startsWith(path)
}
</script>

<template>
  <div class="flex h-full flex-col bg-ink-950 text-zinc-300">
    <div class="flex items-center gap-3 px-6 py-6">
      <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-acid-400 text-ink-950">
        <Skull class="h-6 w-6" />
      </div>
      <div>
        <p class="text-base font-black tracking-[0.2em] text-white">OVERSKULL</p>
        <p class="text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-500">Admin panel</p>
      </div>
    </div>

    <nav class="mt-2 flex-1 space-y-1 px-3">
      <RouterLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        :class="[
          'group flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition',
          isActive(item.to)
            ? 'bg-white/10 text-white'
            : 'text-zinc-400 hover:bg-white/5 hover:text-white',
        ]"
        @click="$emit('navigate')"
      >
        <component
          :is="item.icon"
          :class="[
            'h-4.5 w-4.5 transition',
            isActive(item.to) ? 'text-acid-400' : 'text-zinc-500 group-hover:text-zinc-300',
          ]"
        />
        {{ item.label }}
        <span
          v-if="isActive(item.to)"
          class="ml-auto h-1.5 w-1.5 rounded-full bg-acid-400"
        />
      </RouterLink>
    </nav>

    <div class="px-3 pb-5">
      <div class="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
        <p class="text-xs font-semibold uppercase tracking-wider text-zinc-500">Documentación</p>
        <p class="mt-2 text-sm leading-relaxed text-zinc-400">
          Explora los endpoints disponibles en Swagger.
        </p>
        <a
          :href="docsUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-acid-400 transition hover:text-acid-300"
        >
          Abrir Swagger
          <ArrowUpRight class="h-4 w-4" />
        </a>
      </div>

      <p class="mt-5 px-2 text-[11px] text-zinc-600">
        Laravel 13 · Vue 3 · MySQL
      </p>
    </div>
  </div>
</template>
