<script setup lang="ts">
import type { SeguimientoTableRow, TecnicoData, ValidationTarget } from '~/types/seguimiento'
import {
  esObjetoSinMarcacion,
  getConceptBadge,
  getMarcacionesCount,
  hasMarcaciones,
  shouldShowValidar,
} from '~/utils/seguimiento'

const props = defineProps<{
  items: SeguimientoTableRow[]
  expanded: Record<string, boolean>
  emptyState: {
    title: string
    description: string
  }
}>()

const emit = defineEmits<{
  toggle: [key: string]
  validar: [tecnico: ValidationTarget]
  sendWhatsApp: [tecnico: TecnicoData]
}>()

const getRowClass = (row: SeguimientoTableRow) => {
  if (!hasMarcaciones(row.marcaciones)) {
    return 'bg-red-50/40 dark:bg-red-950/10'
  }

  if (row.source === 'sin-rutas') {
    return 'bg-amber-50/30 dark:bg-amber-950/10'
  }

  return 'bg-white dark:bg-gray-950'
}

const getMarkChipClass = (row: SeguimientoTableRow) =>
  hasMarcaciones(row.marcaciones)
    ? 'bg-emerald-100/80 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
    : 'bg-red-100/80 text-red-700 dark:bg-red-900/30 dark:text-red-300'

const canSendWhatsApp = (row: SeguimientoTableRow) =>
  Boolean(row.whatsappTarget) && !hasMarcaciones(row.marcaciones)
</script>

<template>
  <div class="overflow-auto rounded-lg border border-gray-200/60 bg-white shadow-sm dark:border-gray-800/60 dark:bg-gray-950">
    <table class="min-w-full table-fixed">
      <thead class="sticky top-0 z-10 bg-gray-50 dark:bg-gray-900/50">
        <tr class="border-b border-gray-200/60 text-left text-xs font-semibold text-gray-600 dark:border-gray-800/60 dark:text-gray-300">
          <th class="w-[44px] px-3 py-3"></th>
          <th class="px-4 py-3">Empleado</th>
          <th class="w-[110px] px-3 py-3">Rutas</th>
          <th class="w-[140px] px-3 py-3">Marcaciones</th>
          <th class="w-[280px] px-3 py-3 text-right">Acciones</th>
        </tr>
      </thead>

      <tbody class="divide-y divide-gray-200/60 dark:divide-gray-800/60">
        <tr v-if="items.length === 0">
          <td colspan="5" class="px-4 py-10 text-center">
            <p class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ emptyState.title }}</p>
            <p class="mt-1 text-xs text-gray-500 dark:text-gray-500">{{ emptyState.description }}</p>
          </td>
        </tr>

        <template v-else>
          <template v-for="row in items" :key="row.key">
            <tr
              class="cursor-pointer transition-colors hover:bg-gray-50/70 dark:hover:bg-gray-900/30"
              :class="getRowClass(row)"
              @click="emit('toggle', row.key)"
            >
              <td class="px-3 py-3 align-top">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4 text-gray-500 transition-transform dark:text-gray-400"
                  :class="{ 'rotate-180': props.expanded[row.key] }"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </td>

              <td class="px-4 py-3 align-top">
                <div class="flex min-w-0 items-center gap-3">
                  <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-gray-900 text-xs font-semibold text-white dark:bg-gray-100 dark:text-gray-900">
                    {{ row.initials }}
                  </div>

                  <div class="min-w-0">
                    <div class="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                      {{ row.nombre }}
                    </div>
                    <div class="truncate text-xs text-gray-500 dark:text-gray-400">
                      {{ row.subtitle }}
                    </div>
                    <div class="mt-1 font-mono text-[11px] text-gray-600 dark:text-gray-300">
                      {{ row.dni || 'Sin DNI' }}
                    </div>
                  </div>
                </div>
              </td>

              <td class="px-3 py-3 align-top">
                <span
                  class="inline-flex items-center rounded-md bg-gray-100/80 px-2.5 py-1 text-xs font-medium text-gray-700 dark:bg-gray-800/80 dark:text-gray-200"
                  :title="`${row.rutasCount} ruta(s)`"
                >
                  {{ row.rutasCount }}
                </span>
              </td>

              <td class="px-3 py-3 align-top">
                <span
                  class="inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold"
                  :class="getMarkChipClass(row)"
                >
                  {{ hasMarcaciones(row.marcaciones) ? getMarcacionesCount(row.marcaciones) : 'Sin marcar' }}
                </span>
              </td>

              <td class="px-3 py-3 align-top" @click.stop>
                <div class="flex items-center justify-end gap-2">
                  <span
                    v-if="row.dailyRecord"
                    :class="`rounded-md px-2 py-1 text-xs font-medium ${getConceptBadge(row.dailyRecord).color}`"
                  >
                    {{ getConceptBadge(row.dailyRecord).text }}
                  </span>

                  <button
                    v-if="shouldShowValidar(row.validationTarget)"
                    class="flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-2 text-xs font-medium text-white shadow-sm transition-all duration-200 hover:bg-blue-700 hover:shadow dark:bg-blue-600 dark:hover:bg-blue-700"
                    title="Validar asistencia manualmente"
                    @click.stop="emit('validar', row.validationTarget)"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Validar
                  </button>

                  <button
                    v-if="canSendWhatsApp(row) && row.whatsappTarget"
                    class="rounded-md bg-emerald-600 p-2 text-white shadow-sm transition-all duration-200 hover:bg-emerald-700 hover:shadow"
                    title="Enviar WhatsApp"
                    @click.stop="emit('sendWhatsApp', row.whatsappTarget)"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.197 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.875 1.213 3.074c.149.198 2.095 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.414.248-.694.248-1.289.173-1.414-.074-.124-.272-.198-.57-.347M12 2a10 10 0 0 0-8.65 15.02L2 22l5.13-1.35A10 10 0 1 0 12 2" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>

            <tr v-show="props.expanded[row.key]">
              <td colspan="5" class="p-0">
                <div class="border-t border-gray-200/60 bg-gray-50/50 p-5 dark:border-gray-800/60 dark:bg-gray-900/20">
                  <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <div class="overflow-hidden rounded-lg border border-gray-200/60 bg-white dark:border-gray-800/60 dark:bg-gray-950">
                      <div class="flex items-center justify-between border-b border-gray-200/60 px-4 py-3 dark:border-gray-800/60">
                        <div class="text-sm font-semibold text-gray-900 dark:text-gray-100">Rutas asignadas</div>
                        <div class="text-xs text-gray-500 dark:text-gray-400">{{ row.rutasCount }}</div>
                      </div>

                      <div v-if="row.rutasCount === 0" class="p-4 text-sm text-gray-600 dark:text-gray-300">
                        Sin rutas asignadas para la fecha seleccionada.
                      </div>

                      <div v-else class="max-h-80 divide-y divide-gray-200/60 overflow-auto dark:divide-gray-800/60">
                        <div v-for="ruta in row.rutas" :key="ruta.ticket_id" class="p-4">
                          <div class="flex items-start justify-between gap-3">
                            <div class="min-w-0">
                              <div class="flex items-center gap-2">
                                <span class="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-800/80 dark:text-gray-200">
                                  {{ ruta.number }}
                                </span>
                                <span
                                  class="rounded-md px-2 py-0.5 text-xs font-medium"
                                  :class="{
                                    'bg-amber-100/80 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400': ruta.estado === 'Programado',
                                    'bg-emerald-100/80 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400': ruta.estado === 'Completado',
                                    'bg-blue-100/80 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400': ruta.estado === 'En Proceso',
                                  }"
                                >
                                  {{ ruta.estado }}
                                </span>
                              </div>

                              <div class="mt-2 truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                                {{ ruta.agencia }}
                              </div>
                              <div class="mt-1 truncate text-xs text-gray-500 dark:text-gray-400">
                                {{ ruta.topic }} | {{ ruta.cliente }}
                              </div>
                            </div>

                            <div class="shrink-0 text-xs text-gray-500 dark:text-gray-400">
                              {{ ruta.fecha_programada?.split(' ')[1] || '-' }}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="overflow-hidden rounded-lg border border-gray-200/60 bg-white dark:border-gray-800/60 dark:bg-gray-950">
                      <div class="flex items-center justify-between border-b border-gray-200/60 px-4 py-3 dark:border-gray-800/60">
                        <div class="text-sm font-semibold text-gray-900 dark:text-gray-100">Marcaciones</div>
                        <div class="text-xs text-gray-500 dark:text-gray-400">{{ getMarcacionesCount(row.marcaciones) }}</div>
                      </div>

                      <div class="max-h-80 overflow-auto">
                        <div v-if="esObjetoSinMarcacion(row.marcaciones)" class="p-4 text-sm text-gray-600 dark:text-gray-300">
                          {{ row.marcaciones.message }}
                        </div>

                        <div
                          v-else-if="getMarcacionesCount(row.marcaciones) === 0"
                          class="p-4 text-sm text-gray-600 dark:text-gray-300"
                        >
                          Sin marcaciones registradas.
                        </div>

                        <div v-else class="divide-y divide-gray-200/60 dark:divide-gray-800/60">
                          <div
                            v-for="marcacion in (Array.isArray(row.marcaciones) ? row.marcaciones : [])"
                            :key="marcacion.id || marcacion.punch_time"
                            class="flex items-start justify-between gap-4 p-4"
                          >
                            <div class="min-w-0">
                              <div class="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {{ String(marcacion.punch_time || '').split(' ')[1] || marcacion.punch_time || '-' }}
                              </div>
                              <div class="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400">
                                {{ marcacion.terminal_alias || marcacion.area_alias || marcacion.gps_location || '-' }}
                              </div>
                            </div>

                            <div v-if="marcacion.imagen_url" class="shrink-0">
                              <img
                                :src="marcacion.imagen_url"
                                alt="Foto"
                                class="h-14 w-14 rounded-md border border-gray-200/60 object-cover dark:border-gray-800/60"
                              >
                            </div>
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
