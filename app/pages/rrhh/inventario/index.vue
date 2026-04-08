<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const route = useRoute()
const inventorySections = [
  {
    title: 'Gestion de inventario',
    description: 'Control de stock, registro de items y seguimiento de activos.',
    icon: 'i-lucide-clipboard-list',
    to: '/rrhh/inventario/gestion',
    tone: 'from-blue-500/20 to-indigo-500/10',
  },
  {
    title: 'Solicitudes',
    description: 'Seguimiento de pedidos internos y estados de tramite.',
    icon: 'i-lucide-list-checks',
    to: '/rrhh/inventario/solicitudes',
    tone: 'from-emerald-500/20 to-teal-500/10',
  },
  {
    title: 'Reabastecimiento',
    description: 'Pedidos, aprobaciones y trazabilidad de reposicion.',
    icon: 'i-lucide-refresh-cw',
    to: '/rrhh/inventario/solicitar-reabastecimiento',
    tone: 'from-violet-500/20 to-fuchsia-500/10',
  },
] as const

const quickStats = [
  { label: 'Items activos', value: '128', hint: 'catalogados en RRHH' },
  { label: 'Bajo stock', value: '12', hint: 'requieren reposicion' },
  { label: 'Areas cubiertas', value: '8', hint: 'sedes y oficinas' },
]
</script>

<template>
  <div class="space-y-6 p-2">
    <div class="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
      <UCard class="border-gray-200/70 bg-white/85 shadow-sm dark:border-gray-800/70 dark:bg-gray-950/85">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div class="space-y-3">
            <p class="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
              Modulo RRHH
            </p>
            <div class="space-y-1">
              <h2 class="text-2xl font-black tracking-[-0.04em] text-gray-950 dark:text-white">
                Bienvenido a Inventario
              </h2>
              <p class="max-w-2xl text-sm leading-6 text-gray-600 dark:text-gray-300">
                Desde aqui puedes entrar al submodulo de gestion de inventario y dejar preparado el espacio
                para nuevos procesos de control, entregas y reposicion.
              </p>
            </div>
          </div>

          <UButton
            to="/rrhh/inventario/gestion"
            color="primary"
            icon="i-lucide-arrow-right"
            class="rounded-full shadow-sm"
          >
            Abrir gestion
          </UButton>
        </div>
      </UCard>

      <UCard class="border-gray-200/70 bg-white/85 shadow-sm dark:border-gray-800/70 dark:bg-gray-950/85">
        <div class="space-y-4">
          <div class="flex items-center justify-between gap-3">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
                Accesos rapidos
              </p>
              <h3 class="text-lg font-bold text-gray-950 dark:text-white">
                Submodulos
              </h3>
            </div>
            <UIcon name="i-lucide-layout-grid" class="h-5 w-5 text-[#2d5fc0]" />
          </div>

          <div class="space-y-3">
            <NuxtLink
              v-for="section in inventorySections"
              :key="section.title"
              :to="section.to"
              class="group block rounded-2xl border border-gray-200/80 bg-gray-50/80 p-4 transition hover:-translate-y-0.5 hover:border-[#b8c9ef] hover:bg-[#f4f8ff] dark:border-gray-800 dark:bg-gray-900/60 dark:hover:border-[#29426d] dark:hover:bg-[#13213b]"
            >
              <div class="flex items-start gap-3">
                <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-sm" :class="section.tone">
                  <UIcon :name="section.icon" class="h-5 w-5" />
                </div>

                <div class="min-w-0">
                  <h4 class="font-semibold text-gray-900 dark:text-white">
                    {{ section.title }}
                  </h4>
                  <p class="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-300">
                    {{ section.description }}
                  </p>
                </div>
              </div>
            </NuxtLink>
          </div>
        </div>
      </UCard>
    </div>

    <div class="grid gap-4 md:grid-cols-3">
      <UCard
        v-for="stat in quickStats"
        :key="stat.label"
        class="border-gray-200/70 bg-white/85 shadow-sm dark:border-gray-800/70 dark:bg-gray-950/85"
      >
        <p class="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
          {{ stat.label }}
        </p>
        <p class="mt-3 text-3xl font-black tracking-[-0.05em] text-gray-950 dark:text-white">
          {{ stat.value }}
        </p>
        <p class="mt-1 text-sm text-gray-600 dark:text-gray-300">
          {{ stat.hint }}
        </p>
      </UCard>
    </div>

    <UCard class="border-gray-200/70 bg-white/85 shadow-sm dark:border-gray-800/70 dark:bg-gray-950/85">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
            Ruta actual
          </p>
          <p class="text-sm text-gray-600 dark:text-gray-300">
            {{ route.path }}
          </p>
        </div>

        <UBadge color="primary" variant="soft" class="rounded-full px-3 py-1">
          RRHH / Inventario
        </UBadge>
      </div>
    </UCard>
  </div>
</template>
