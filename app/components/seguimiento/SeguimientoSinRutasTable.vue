<script setup lang="ts">
import type { Usuario } from '~/types/seguimiento'
import {
  getConceptBadge,
  getDailyRecord,
  getExpandKey,
  getMarcacionesCount,
  hasMarcaciones,
  shouldShowValidar,
} from '~/utils/seguimiento'

defineProps<{
  items: Usuario[]
  expanded: Record<string, boolean>
}>()

const emit = defineEmits<{
  toggle: [key: string]
  validar: [tecnico: Usuario]
}>()
</script>

<template>
  <div class="max-h-[calc(100vh-400px)] overflow-auto rounded-lg border border-gray-200/60 dark:border-gray-800/60 bg-white dark:bg-gray-950 shadow-sm">
    <table class="min-w-full table-fixed">
      <thead class="sticky top-0 z-10 bg-gray-50 dark:bg-gray-900/50">
        <tr class="text-left text-xs font-semibold text-gray-600 dark:text-gray-300 border-b border-gray-200/60 dark:border-gray-800/60">
          <th class="w-[44px] px-3 py-3"></th>
          <th class="w-[150px] px-3 py-3">DNI</th>
          <th class="px-3 py-3">Técnico</th>
          <th class="w-[140px] px-3 py-3">Marcación</th>
          <th class="w-[260px] px-3 py-3 text-right">Acciones</th>
        </tr>
      </thead>

      <tbody class="divide-y divide-gray-200/60 dark:divide-gray-800/60">
        <template v-if="items.length === 0">
          <tr>
            <td colspan="5" class="px-4 py-10 text-center">
              <p class="text-sm font-medium text-gray-700 dark:text-gray-300">Todos los técnicos tienen rutas asignadas</p>
              <p class="text-xs text-gray-500 dark:text-gray-500 mt-1">No hay técnicos sin rutas para la fecha seleccionada</p>
            </td>
          </tr>
        </template>

        <template v-else>
          <template v-for="tecnico in items" :key="getExpandKey(tecnico)">
            <tr
              class="cursor-pointer hover:bg-gray-50/70 dark:hover:bg-gray-900/30 transition-colors bg-amber-50/30 dark:bg-amber-950/10"
              @click="emit('toggle', getExpandKey(tecnico))"
            >
              <td class="px-3 py-3 align-top">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4 text-gray-500 dark:text-gray-400 transition-transform"
                  :class="{ 'rotate-180': expanded[getExpandKey(tecnico)] }"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </td>

              <td class="px-3 py-3 align-top">
                <span v-if="tecnico.dni && tecnico.dni !== 'null'" class="font-mono text-xs text-gray-700 dark:text-gray-200">
                  {{ tecnico.dni }}
                </span>
                <span v-else class="text-xs text-gray-500 dark:text-gray-400">Sin DNI</span>
              </td>

              <td class="px-3 py-3 align-top">
                <div class="flex items-center gap-3 min-w-0">
                  <div class="w-9 h-9 rounded-md bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 flex items-center justify-center text-xs font-semibold shrink-0">
                    {{ tecnico.nombre?.charAt(0) || 'T' }}{{ tecnico.apellido?.charAt(0) || 'S' }}
                  </div>

                  <div class="min-w-0">
                    <div class="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                      {{ tecnico.nombre_completo || 'Sin nombre' }}
                    </div>
                    <div class="truncate text-xs text-gray-500 dark:text-gray-400">
                      {{ tecnico.departamento || '—' }} · {{ tecnico.posicion || '—' }}
                    </div>
                  </div>
                </div>
              </td>

              <td class="px-3 py-3 align-top">
                <span
                  v-if="hasMarcaciones(tecnico.marcaciones)"
                  class="inline-flex items-center rounded-md bg-emerald-100/80 dark:bg-emerald-900/30 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300"
                >
                  ✓ Marcó
                </span>
                <span
                  v-else
                  class="inline-flex items-center rounded-md bg-red-100/80 dark:bg-red-900/30 px-2.5 py-1 text-xs font-semibold text-red-700 dark:text-red-300"
                >
                  Sin marcar
                </span>
              </td>

              <td class="px-3 py-3 align-top" @click.stop>
                <div class="flex items-center justify-end gap-2">
                  <span
                    v-if="getDailyRecord(tecnico)"
                    :class="`px-2 py-1 text-xs font-medium rounded-md ${getConceptBadge(getDailyRecord(tecnico)).color}`"
                  >
                    {{ getConceptBadge(getDailyRecord(tecnico)).text }}
                  </span>

                  <button
                    v-if="shouldShowValidar(tecnico)"
                    class="px-3 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-md transition-all duration-200 shadow-sm hover:shadow text-xs font-medium flex items-center gap-1.5"
                    title="Validar asistencia manualmente"
                    @click.stop="emit('validar', tecnico)"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Validar
                  </button>
                </div>
              </td>
            </tr>

            <tr v-show="expanded[getExpandKey(tecnico)]">
              <td colspan="5" class="p-0">
                <div class="p-5 bg-gray-50/50 dark:bg-gray-900/20 border-t border-gray-200/60 dark:border-gray-800/60">
                  <div class="rounded-lg border border-gray-200/60 dark:border-gray-800/60 bg-white dark:bg-gray-950 overflow-hidden">
                    <div class="px-4 py-3 border-b border-gray-200/60 dark:border-gray-800/60 flex items-center justify-between">
                      <div class="text-sm font-semibold text-gray-900 dark:text-gray-100">Marcaciones</div>
                      <div class="text-xs text-gray-500 dark:text-gray-400">
                        {{ getMarcacionesCount(tecnico.marcaciones) }}
                      </div>
                    </div>

                    <div class="max-h-80 overflow-auto">
                      <div v-if="!Array.isArray(tecnico.marcaciones)" class="p-4 text-sm text-gray-600 dark:text-gray-300">
                        {{ (tecnico.marcaciones && tecnico.marcaciones.message) || 'Sin marcaciones.' }}
                      </div>

                      <div
                        v-else-if="getMarcacionesCount(tecnico.marcaciones) === 0"
                        class="p-4 text-sm text-gray-600 dark:text-gray-300"
                      >
                        Sin marcaciones registradas.
                      </div>

                      <div v-else class="divide-y divide-gray-200/60 dark:divide-gray-800/60">
                        <div
                          v-for="marcacion in tecnico.marcaciones"
                          :key="marcacion.id || marcacion.punch_time"
                          class="p-4 flex items-start justify-between gap-4"
                        >
                          <div class="min-w-0">
                            <div class="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {{ String(marcacion.punch_time || '').split(' ')[1] || marcacion.punch_time || '—' }}
                            </div>
                            <div class="mt-0.5 text-xs text-gray-500 dark:text-gray-400 truncate">
                              {{ marcacion.terminal_alias || marcacion.area_alias || marcacion.gps_location || '—' }}
                            </div>
                          </div>

                          <div v-if="marcacion.imagen_url" class="shrink-0">
                            <img
                              :src="marcacion.imagen_url"
                              alt="Foto"
                              class="w-14 h-14 object-cover rounded-md border border-gray-200/60 dark:border-gray-800/60"
                            >
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          </template>
        </template>
      </tbody>
    </table>
  </div>
</template>
