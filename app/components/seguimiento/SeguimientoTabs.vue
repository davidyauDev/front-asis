<script setup lang="ts">
import type { SeguimientoSubTab, SeguimientoTab } from '~/types/seguimiento'

defineProps<{
  tabActivo: SeguimientoTab
  subTabConRutas: SeguimientoSubTab
  subTabSinRutas: SeguimientoSubTab
  tecnicosConRutas: number
  tecnicosSinRutas: number
  conRutasMarcados: number
  conRutasNoMarcados: number
  sinRutasMarcados: number
  sinRutasNoMarcados: number
}>()

const emit = defineEmits<{
  'update:tabActivo': [value: SeguimientoTab]
  'update:subTabConRutas': [value: SeguimientoSubTab]
  'update:subTabSinRutas': [value: SeguimientoSubTab]
}>()
</script>

<template>
  <div class="space-y-4">
    <div class="rounded-t-lg border border-gray-200 border-b-0 bg-white dark:border-gray-800 dark:bg-gray-950 overflow-hidden">
      <div class="flex border-b border-emerald-600 divide-x divide-gray-200 dark:divide-gray-800">
        <button
          type="button"
          class="px-6 py-3 text-sm font-semibold uppercase tracking-wide flex items-center gap-2"
          :class="tabActivo === 'con-rutas'
            ? 'bg-emerald-600 text-white'
            : 'bg-gray-50 text-gray-700 hover:bg-gray-100 dark:bg-gray-900/30 dark:text-gray-200 dark:hover:bg-gray-900/40'"
          @click="emit('update:tabActivo', 'con-rutas')"
        >
          Con Rutas
          <span
            class="inline-flex items-center justify-center min-w-[28px] h-5 px-2 rounded-full text-xs font-semibold"
            :class="tabActivo === 'con-rutas'
              ? 'bg-white/20 text-white'
              : 'bg-gray-100 text-gray-700 dark:bg-gray-900/40 dark:text-gray-200'"
          >
            {{ tecnicosConRutas }}
          </span>
        </button>

        <button
          type="button"
          class="px-6 py-3 text-sm font-semibold uppercase tracking-wide flex items-center gap-2"
          :class="tabActivo === 'sin-rutas'
            ? 'bg-emerald-600 text-white'
            : 'bg-gray-50 text-gray-700 hover:bg-gray-100 dark:bg-gray-900/30 dark:text-gray-200 dark:hover:bg-gray-900/40'"
          @click="emit('update:tabActivo', 'sin-rutas')"
        >
          Sin Rutas
          <span
            class="inline-flex items-center justify-center min-w-[28px] h-5 px-2 rounded-full text-xs font-semibold"
            :class="tabActivo === 'sin-rutas'
              ? 'bg-white/20 text-white'
              : 'bg-gray-100 text-gray-700 dark:bg-gray-900/40 dark:text-gray-200'"
          >
            {{ tecnicosSinRutas }}
          </span>
        </button>

        <div class="flex-1" />
      </div>
    </div>

    <div
      v-if="tabActivo === 'con-rutas'"
      class="rounded-t-lg border border-gray-200 border-b-0 bg-white dark:border-gray-800 dark:bg-gray-950 overflow-hidden"
    >
      <div class="flex border-b border-emerald-600 divide-x divide-gray-200 dark:divide-gray-800">
        <button
          type="button"
          class="px-6 py-2.5 text-sm font-semibold uppercase tracking-wide flex items-center gap-2"
          :class="subTabConRutas === 'marcaron'
            ? 'bg-emerald-600 text-white'
            : 'bg-gray-50 text-gray-700 hover:bg-gray-100 dark:bg-gray-900/30 dark:text-gray-200 dark:hover:bg-gray-900/40'"
          @click="emit('update:subTabConRutas', 'marcaron')"
        >
          Marcaron
          <span
            class="inline-flex items-center justify-center min-w-[28px] h-5 px-2 rounded-full text-xs font-semibold"
            :class="subTabConRutas === 'marcaron'
              ? 'bg-white/20 text-white'
              : 'bg-gray-100 text-gray-700 dark:bg-gray-900/40 dark:text-gray-200'"
          >
            {{ conRutasMarcados }}
          </span>
        </button>

        <button
          type="button"
          class="px-6 py-2.5 text-sm font-semibold uppercase tracking-wide flex items-center gap-2"
          :class="subTabConRutas === 'no-marcaron'
            ? 'bg-emerald-600 text-white'
            : 'bg-gray-50 text-gray-700 hover:bg-gray-100 dark:bg-gray-900/30 dark:text-gray-200 dark:hover:bg-gray-900/40'"
          @click="emit('update:subTabConRutas', 'no-marcaron')"
        >
          No marcaron
          <span
            class="inline-flex items-center justify-center min-w-[28px] h-5 px-2 rounded-full text-xs font-semibold"
            :class="subTabConRutas === 'no-marcaron'
              ? 'bg-white/20 text-white'
              : 'bg-gray-100 text-gray-700 dark:bg-gray-900/40 dark:text-gray-200'"
          >
            {{ conRutasNoMarcados }}
          </span>
        </button>

        <div class="flex-1" />
      </div>
    </div>

    <div
      v-else
      class="rounded-t-lg border border-gray-200 border-b-0 bg-white dark:border-gray-800 dark:bg-gray-950 overflow-hidden"
    >
      <div class="flex border-b border-emerald-600 divide-x divide-gray-200 dark:divide-gray-800">
        <button
          type="button"
          class="px-6 py-2.5 text-sm font-semibold uppercase tracking-wide flex items-center gap-2"
          :class="subTabSinRutas === 'marcaron'
            ? 'bg-emerald-600 text-white'
            : 'bg-gray-50 text-gray-700 hover:bg-gray-100 dark:bg-gray-900/30 dark:text-gray-200 dark:hover:bg-gray-900/40'"
          @click="emit('update:subTabSinRutas', 'marcaron')"
        >
          Marcaron
          <span
            class="inline-flex items-center justify-center min-w-[28px] h-5 px-2 rounded-full text-xs font-semibold"
            :class="subTabSinRutas === 'marcaron'
              ? 'bg-white/20 text-white'
              : 'bg-gray-100 text-gray-700 dark:bg-gray-900/40 dark:text-gray-200'"
          >
            {{ sinRutasMarcados }}
          </span>
        </button>

        <button
          type="button"
          class="px-6 py-2.5 text-sm font-semibold uppercase tracking-wide flex items-center gap-2"
          :class="subTabSinRutas === 'no-marcaron'
            ? 'bg-emerald-600 text-white'
            : 'bg-gray-50 text-gray-700 hover:bg-gray-100 dark:bg-gray-900/30 dark:text-gray-200 dark:hover:bg-gray-900/40'"
          @click="emit('update:subTabSinRutas', 'no-marcaron')"
        >
          No marcaron
          <span
            class="inline-flex items-center justify-center min-w-[28px] h-5 px-2 rounded-full text-xs font-semibold"
            :class="subTabSinRutas === 'no-marcaron'
              ? 'bg-white/20 text-white'
              : 'bg-gray-100 text-gray-700 dark:bg-gray-900/40 dark:text-gray-200'"
          >
            {{ sinRutasNoMarcados }}
          </span>
        </button>

        <div class="flex-1" />
      </div>
    </div>
  </div>
</template>
