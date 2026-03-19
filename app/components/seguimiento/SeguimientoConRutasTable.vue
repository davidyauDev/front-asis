<script setup lang="ts">
import type { TecnicoConRutaEntry, TecnicoData } from '~/types/seguimiento'
import {
  esObjetoSinMarcacion,
  getConceptBadge,
  getDailyRecord,
  getMarcacionesCount,
  hasMarcaciones,
  shouldShowValidar,
} from '~/utils/seguimiento'

defineProps<{
  items: TecnicoConRutaEntry[]
  expanded: Record<string, boolean>
}>()

const emit = defineEmits<{
  toggle: [key: string]
  viewDailyRecord: [tecnico: TecnicoData]
  validar: [tecnico: TecnicoData]
  sendWhatsApp: [tecnico: TecnicoData]
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
          <th class="w-[110px] px-3 py-3">Rutas</th>
          <th class="w-[140px] px-3 py-3">Marcación</th>
          <th class="w-[260px] px-3 py-3">Acciones</th>
        </tr>
      </thead>

      <tbody class="divide-y divide-gray-200/60 dark:divide-gray-800/60">
        <template v-if="items.length === 0">
          <tr>
            <td colspan="6" class="px-4 py-10 text-center">
              <p class="text-sm font-medium text-gray-700 dark:text-gray-300">No se encontraron técnicos</p>
              <p class="text-xs text-gray-500 dark:text-gray-500 mt-1">Ajusta los filtros de búsqueda</p>
            </td>
          </tr>
        </template>

        <template v-else>
          <template v-for="[dni, tecnicoData] in items" :key="dni">
            <tr
              class="cursor-pointer hover:bg-gray-50/70 dark:hover:bg-gray-900/30 transition-colors"
              :class="!hasMarcaciones(tecnicoData.iclock_transactions)
                ? 'bg-red-50/50 dark:bg-red-950/10'
                : 'bg-white dark:bg-gray-950'"
              @click="emit('toggle', dni)"
            >
              <td class="px-3 py-3 align-top">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4 text-gray-500 dark:text-gray-400 transition-transform"
                  :class="{ 'rotate-180': expanded[dni] }"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </td>

              <td class="px-3 py-3 align-top">
                <span v-if="dni && dni !== 'null' && dni !== 'undefined'" class="font-mono text-xs text-gray-700 dark:text-gray-200">
                  {{ dni }}
                </span>
                <span v-else class="text-xs text-amber-700 dark:text-amber-400 font-medium">
                  Sin técnico
                </span>
              </td>

              <td class="px-3 py-3 align-top">
                <div class="flex items-center gap-3 min-w-0">
                  <div class="w-9 h-9 rounded-md bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 flex items-center justify-center text-xs font-semibold shrink-0">
                    {{ tecnicoData.rutas[0]?.firstname?.charAt(0) || '' }}{{ tecnicoData.rutas[0]?.lastname?.charAt(0) || '' }}
                  </div>

                  <div class="min-w-0">
                    <div class="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                      {{ tecnicoData.rutas[0]?.firstname || '' }} {{ tecnicoData.rutas[0]?.lastname || '' }}
                    </div>
                    <div class="truncate text-xs text-gray-500 dark:text-gray-400">
                      {{ tecnicoData.rutas[0]?.agencia || '—' }}
                    </div>
                  </div>
                </div>
              </td>

              <td class="px-3 py-3 align-top">
                <span
                  class="inline-flex items-center rounded-md bg-gray-100/80 dark:bg-gray-800/80 px-2.5 py-1 text-xs font-medium text-gray-700 dark:text-gray-200"
                  :title="`${tecnicoData.rutas.length} ruta(s)`"
                >
                  {{ tecnicoData.rutas.length }}
                </span>
              </td>

              <td class="px-3 py-3 align-top">
                <span
                  v-if="!hasMarcaciones(tecnicoData.iclock_transactions)"
                  class="inline-flex items-center rounded-md bg-red-600/90 dark:bg-red-500/90 px-2.5 py-1 text-xs font-semibold text-white"
                >
                  Sin marcar
                </span>
                <span
                  v-else
                  class="inline-flex items-center rounded-md bg-emerald-100/80 dark:bg-emerald-900/30 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300"
                  :title="`${getMarcacionesCount(tecnicoData.iclock_transactions)} marcación(es)`"
                >
                  {{ getMarcacionesCount(tecnicoData.iclock_transactions) }}
                </span>
              </td>

              <td class="px-3 py-3 align-top" @click.stop>
                <div class="flex items-center justify-end gap-2">
                  <button
                    v-if="getDailyRecord(tecnicoData)"
                    :class="`px-2 py-1 text-xs font-medium rounded-md ${getConceptBadge(getDailyRecord(tecnicoData)).color}`"
                    @click.stop="emit('viewDailyRecord', tecnicoData)"
                  >
                    {{ getConceptBadge(getDailyRecord(tecnicoData)).text }}
                  </button>

                  <button
                    v-if="shouldShowValidar(tecnicoData)"
                    class="px-3 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-md transition-all duration-200 shadow-sm hover:shadow text-xs font-medium flex items-center gap-1.5"
                    title="Validar asistencia manualmente"
                    @click.stop="emit('validar', tecnicoData)"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Validar
                  </button>

                  <button
                    v-if="!hasMarcaciones(tecnicoData.iclock_transactions)"
                    class="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md transition-all duration-200 shadow-sm hover:shadow"
                    title="Enviar WhatsApp"
                    @click.stop="emit('sendWhatsApp', tecnicoData)"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.197 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.875 1.213 3.074c.149.198 2.095 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.414.248-.694.248-1.289.173-1.414-.074-.124-.272-.198-.57-.347M12 2a10 10 0 0 0-8.65 15.02L2 22l5.13-1.35A10 10 0 1 0 12 2" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>

            <tr v-show="expanded[dni]">
              <td colspan="6" class="p-0">
                <div class="p-5 bg-gray-50/50 dark:bg-gray-900/20 border-t border-gray-200/60 dark:border-gray-800/60">
                  <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div class="rounded-lg border border-gray-200/60 dark:border-gray-800/60 bg-white dark:bg-gray-950 overflow-hidden">
                      <div class="px-4 py-3 border-b border-gray-200/60 dark:border-gray-800/60 flex items-center justify-between">
                        <div class="text-sm font-semibold text-gray-900 dark:text-gray-100">Rutas asignadas</div>
                        <div class="text-xs text-gray-500 dark:text-gray-400">{{ tecnicoData.rutas.length }}</div>
                      </div>

                      <div class="max-h-80 overflow-auto divide-y divide-gray-200/60 dark:divide-gray-800/60">
                        <div v-for="ruta in tecnicoData.rutas" :key="ruta.ticket_id" class="p-4">
                          <div class="flex items-start justify-between gap-3">
                            <div class="min-w-0">
                              <div class="flex items-center gap-2">
                                <span class="text-xs font-medium bg-gray-100 dark:bg-gray-800/80 px-2 py-0.5 rounded-md text-gray-700 dark:text-gray-200">
                                  {{ ruta.number }}
                                </span>
                                <span
                                  class="text-xs font-medium px-2 py-0.5 rounded-md"
                                  :class="{
                                    'bg-amber-100/80 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400': ruta.estado === 'Programado',
                                    'bg-emerald-100/80 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400': ruta.estado === 'Completado',
                                    'bg-blue-100/80 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400': ruta.estado === 'En Proceso'
                                  }"
                                >
                                  {{ ruta.estado }}
                                </span>
                              </div>

                              <div class="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                {{ ruta.agencia }}
                              </div>
                              <div class="mt-1 text-xs text-gray-500 dark:text-gray-400 truncate">
                                {{ ruta.topic }} · {{ ruta.cliente }}
                              </div>
                            </div>

                            <div class="text-xs text-gray-500 dark:text-gray-400 shrink-0">
                              {{ ruta.fecha_programada?.split(' ')[1] || '—' }}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="rounded-lg border border-gray-200/60 dark:border-gray-800/60 bg-white dark:bg-gray-950 overflow-hidden">
                      <div class="px-4 py-3 border-b border-gray-200/60 dark:border-gray-800/60 flex items-center justify-between">
                        <div class="text-sm font-semibold text-gray-900 dark:text-gray-100">Marcaciones</div>
                        <div class="text-xs text-gray-500 dark:text-gray-400">
                          {{ getMarcacionesCount(tecnicoData.iclock_transactions) }}
                        </div>
                      </div>

                      <div class="max-h-80 overflow-auto">
                        <div
                          v-if="esObjetoSinMarcacion(tecnicoData.iclock_transactions)"
                          class="p-4 text-sm text-gray-600 dark:text-gray-300"
                        >
                          {{ tecnicoData.iclock_transactions.message }}
                        </div>

                        <div
                          v-else-if="getMarcacionesCount(tecnicoData.iclock_transactions) === 0"
                          class="p-4 text-sm text-gray-600 dark:text-gray-300"
                        >
                          Sin marcaciones registradas.
                        </div>

                        <div v-else class="divide-y divide-gray-200/60 dark:divide-gray-800/60">
                          <div
                            v-for="marcacion in (Array.isArray(tecnicoData.iclock_transactions) ? tecnicoData.iclock_transactions : [])"
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
                </div>
              </td>
            </tr>
          </template>
        </template>
      </tbody>
    </table>
  </div>
</template>
