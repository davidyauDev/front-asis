<script setup lang="ts">
import type { Marcacion, SeguimientoTableRow, TecnicoData, ValidationTarget } from '~/types/seguimiento'
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
    return 'bg-rose-50/45 dark:bg-rose-950/10'
  }

  if (row.source === 'sin-rutas') {
    return 'bg-amber-50/35 dark:bg-amber-950/10'
  }

  return 'bg-white dark:bg-gray-950'
}

const getSourceBadge = (row: SeguimientoTableRow) => {
  if (row.source === 'sin-rutas') {
    return {
      label: 'Sin rutas',
      color: 'warning' as const,
    }
  }

  return {
    label: 'Con rutas',
    color: 'primary' as const,
  }
}

const getMarkBadge = (row: SeguimientoTableRow) => {
  if (hasMarcaciones(row.marcaciones)) {
    return {
      label: `${getMarcacionesCount(row.marcaciones)} marcaciones`,
      color: 'success' as const,
      variant: 'soft' as const,
    }
  }

  return {
    label: 'Sin marcar',
    color: 'error' as const,
    variant: 'soft' as const,
  }
}

const canSendWhatsApp = (row: SeguimientoTableRow) =>
  Boolean(row.whatsappTarget) && !hasMarcaciones(row.marcaciones)

const getRouteStatusColor = (estado: string) => {
  switch (estado) {
    case 'Completado':
      return 'success' as const
    case 'En Proceso':
      return 'info' as const
    case 'Programado':
      return 'warning' as const
    default:
      return 'neutral' as const
  }
}

const formatPunchHour = (punchTime?: string) =>
  String(punchTime || '').split(' ')[1] || punchTime || '-'

const getMarkLocation = (marcacion: Marcacion) =>
  marcacion.terminal_alias || marcacion.area_alias || marcacion.gps_location || 'Sin ubicacion'

const getRowMeta = (row: SeguimientoTableRow) => [
  {
    key: 'correo',
    label: 'Correo',
    value: row.email || 'Sin correo',
    icon: 'i-lucide-mail',
  },
]

const getProfileItems = (row: SeguimientoTableRow) => [
  {
    key: 'cargo',
    label: 'Cargo',
    value: row.posicion || 'Sin cargo registrado',
    icon: 'i-lucide-briefcase-business',
  },
  {
    key: 'correo',
    label: 'Correo',
    value: row.email || 'Sin correo registrado',
    icon: 'i-lucide-mail',
  },
  {
    key: 'departamento',
    label: 'Departamento',
    value: row.usuario.departamento || 'Sin departamento',
    icon: 'i-lucide-building-2',
  },
  {
    key: 'telefono',
    label: 'Movil',
    value: row.usuario.mobile || 'Sin telefono',
    icon: 'i-lucide-smartphone',
  },
]

const getConceptUi = (row: SeguimientoTableRow) => {
  const badge = getConceptBadge(row.dailyRecord)

  return {
    label: badge.text,
    className: badge.color,
  }
}
</script>

<template>
  <div>
    <div v-if="props.items.length === 0" class="px-6 py-14">
      <div class="flex flex-col items-center justify-center text-center">
        <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-500 dark:bg-gray-900 dark:text-gray-400">
          <UIcon name="i-lucide-inbox" class="h-6 w-6" />
        </div>
        <p class="mt-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
          {{ props.emptyState.title }}
        </p>
        <p class="mt-1 max-w-md text-sm text-gray-500 dark:text-gray-400">
          {{ props.emptyState.description }}
        </p>
      </div>
    </div>

    <div v-else class="overflow-x-auto">
      <table class="min-w-[1280px] table-fixed">
        <thead class="bg-gray-50/90 dark:bg-gray-900/60">
          <tr class="border-b border-gray-200/70 text-left text-xs font-semibold uppercase tracking-[0.16em] text-gray-500 dark:border-gray-800/70 dark:text-gray-400">
           <th class="w-[5%] px-4 py-4">Ver</th>
<th class="w-[25%] px-4 py-4">Tecnico</th>
<th class="w-[15%] px-4 py-4">Perfil</th>
<th class="w-[15%] px-4 py-4">Operacion</th>
<th class="w-[30%] px-4 py-4">Asistencia</th>
<th class="w-[10%] px-4 py-4 text-right">Acciones</th>
          </tr>
        </thead>

        <tbody class="divide-y divide-gray-200/70 dark:divide-gray-800/70">
          <template v-for="row in props.items" :key="row.key">
            <tr
              class="cursor-pointer align-top transition-colors duration-200 hover:bg-slate-50/90 dark:hover:bg-slate-900/30"
              :class="getRowClass(row)"
              @click="emit('toggle', row.key)"
            >
              <td class="px-4 py-4 align-top">
                <UButton
                  color="neutral"
                  variant="ghost"
                  size="xs"
                  class="rounded-lg"
                  aria-label="Expandir tecnico"
                  :icon="props.expanded[row.key] ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
                  @click.stop="emit('toggle', row.key)"
                />
              </td>

              <td class="px-4 py-4 align-top">
                <div class="flex w-[340px] max-w-[340px] items-start gap-3">
                  <UAvatar
                    :alt="row.nombre"
                    size="lg"
                    class="ring-2 ring-white shadow-sm dark:ring-gray-900"
                  >
                    {{ row.initials }}
                  </UAvatar>

                  <div class="min-w-0 flex-1 space-y-1">
                    <div class="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {{ row.nombre }}
                    </div>
                    <div class="truncate text-sm text-gray-500 dark:text-gray-400">
                      {{ row.subtitle }}
                    </div>
                    <div class="flex flex-wrap items-center gap-2">
                      <UBadge
                        :color="getSourceBadge(row).color"
                        variant="soft"
                        class="rounded-full px-2.5 py-1"
                      >
                        {{ getSourceBadge(row).label }}
                      </UBadge>
                      <span class="font-mono text-[11px] uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400">
                        {{ row.dni || 'Sin DNI' }}
                      </span>
                    </div>
                  </div>
                </div>
              </td>

              <td class="px-4 py-4 align-top">
                <div class="max-w-[250px] space-y-2">
                  <div
                    v-for="item in getRowMeta(row)"
                    :key="item.key"
                    class="flex w-full min-w-0 items-start gap-2 rounded-xl border border-gray-200/70 bg-gray-50/90 px-3 py-2 dark:border-gray-800/70 dark:bg-gray-900/60"
                  >
                    <UIcon :name="item.icon" class="mt-0.5 h-4 w-4 shrink-0 text-gray-400 dark:text-gray-500" />
                    <div class="min-w-0">
                      <div class="text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-400 dark:text-gray-500">
                        {{ item.label }}
                      </div>
                      <div class="truncate text-sm font-medium text-gray-700 dark:text-gray-200">
                        {{ item.value }}
                      </div>
                    </div>
                  </div>
                </div>
              </td>

              <td class="px-4 py-4 align-top">
                <div class="max-w-[210px] space-y-3">
                  <div class="rounded-xl border border-gray-200/70 bg-white px-3 py-3 shadow-sm dark:border-gray-800/70 dark:bg-gray-900/50">
                    <div class="flex items-center justify-between gap-3">
                      <div>
                        <div class="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-400 dark:text-gray-500">
                          Cobertura
                        </div>
                        <div class="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100">
                          {{ row.rutasCount }} rutas
                        </div>
                      </div>
                      <UIcon name="i-lucide-route" class="h-5 w-5 text-gray-400 dark:text-gray-500" />
                    </div>
                  </div>

                 
                </div>
              </td>

              <td class="px-4 py-4 align-top">
                <div class="space-y-3">
                  <UBadge
                    :color="getMarkBadge(row).color"
                    :variant="getMarkBadge(row).variant"
                    class="rounded-full px-3 py-1"
                  >
                    {{ getMarkBadge(row).label }}
                  </UBadge>

                  <div
                    v-if="row.dailyRecord"
                    :class="`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getConceptUi(row).className}`"
                  >
                    {{ getConceptUi(row).label }}
                  </div>

                  <div v-else class="text-xs text-gray-500 dark:text-gray-400">
                    Sin concepto diario registrado.
                  </div>
                </div>
              </td>

              <td class="px-4 py-4 align-top" @click.stop>
                <div class="flex flex-wrap items-center justify-end gap-2">
                  <UTooltip text="Validar asistencia manualmente">
                    <UButton
                      v-if="shouldShowValidar(row.validationTarget)"
                      color="primary"
                      variant="soft"
                      size="sm"
                      icon="i-lucide-badge-check"
                      class="rounded-xl"
                      @click.stop="emit('validar', row.validationTarget)"
                    >
                      Validar
                    </UButton>
                  </UTooltip>

                  <UTooltip text="Enviar recordatorio por WhatsApp">
                    <UButton
                      v-if="canSendWhatsApp(row) && row.whatsappTarget"
                      color="success"
                      variant="soft"
                      size="sm"
                      icon="i-lucide-message-circle"
                      class="rounded-xl"
                      @click.stop="emit('sendWhatsApp', row.whatsappTarget)"
                    >
                      WhatsApp
                    </UButton>
                  </UTooltip>
                </div>
              </td>
            </tr>

            <tr v-show="props.expanded[row.key]">
              <td colspan="6" class="p-0">
                <div class="border-t border-gray-200/70 bg-gray-50/70 px-5 py-5 dark:border-gray-800/70 dark:bg-gray-900/25">
                  <div class="grid gap-4 2xl:grid-cols-[1.05fr_1.3fr_1.3fr]">
                    <div class="overflow-hidden rounded-2xl border border-gray-200/70 bg-white dark:border-gray-800/70 dark:bg-gray-950">
                      <div class="flex items-center justify-between border-b border-gray-200/70 px-4 py-3 dark:border-gray-800/70">
                        <div>
                          <div class="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            Perfil del tecnico
                          </div>
                          <div class="text-xs text-gray-500 dark:text-gray-400">
                            Informacion base del colaborador.
                          </div>
                        </div>
                        <UIcon name="i-lucide-user-round-search" class="h-5 w-5 text-gray-400 dark:text-gray-500" />
                      </div>

                      <div class="space-y-3 p-4">
                        <div
                          v-for="item in getProfileItems(row)"
                          :key="item.key"
                          class="flex items-start gap-3 rounded-xl border border-gray-200/70 bg-gray-50/80 px-3 py-3 dark:border-gray-800/70 dark:bg-gray-900/50"
                        >
                          <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-sm dark:bg-gray-950">
                            <UIcon :name="item.icon" class="h-4 w-4 text-gray-500 dark:text-gray-400" />
                          </div>
                          <div class="min-w-0">
                            <div class="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-400 dark:text-gray-500">
                              {{ item.label }}
                            </div>
                            <div class="truncate text-sm text-gray-700 dark:text-gray-200">
                              {{ item.value }}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="overflow-hidden rounded-2xl border border-gray-200/70 bg-white dark:border-gray-800/70 dark:bg-gray-950">
                      <div class="flex items-center justify-between border-b border-gray-200/70 px-4 py-3 dark:border-gray-800/70">
                        <div>
                          <div class="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            Rutas asignadas
                          </div>
                          <div class="text-xs text-gray-500 dark:text-gray-400">
                            Detalle operativo para la fecha seleccionada.
                          </div>
                        </div>
                        <UBadge color="primary" variant="soft" class="rounded-full px-3 py-1">
                          {{ row.rutasCount }}
                        </UBadge>
                      </div>

                      <div v-if="row.rutasCount === 0" class="p-4 text-sm text-gray-600 dark:text-gray-300">
                        Sin rutas asignadas para la fecha seleccionada.
                      </div>

                      <div v-else class="max-h-96 divide-y divide-gray-200/70 overflow-auto dark:divide-gray-800/70">
                        <div v-for="ruta in row.rutas" :key="ruta.ticket_id" class="p-4">
                          <div class="flex items-start justify-between gap-3">
                            <div class="min-w-0">
                              <div class="flex flex-wrap items-center gap-2">
                                <UBadge color="neutral" variant="outline" class="rounded-full px-2.5 py-1 font-mono">
                                  {{ ruta.number }}
                                </UBadge>
                                <UBadge
                                  :color="getRouteStatusColor(ruta.estado)"
                                  variant="soft"
                                  class="rounded-full px-2.5 py-1"
                                >
                                  {{ ruta.estado }}
                                </UBadge>
                              </div>

                              <div class="mt-3 text-sm font-semibold text-gray-900 dark:text-gray-100">
                                {{ ruta.agencia }}
                              </div>
                              <div class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                {{ ruta.topic }} | {{ ruta.cliente }}
                              </div>
                              <div class="mt-1 text-xs text-gray-400 dark:text-gray-500">
                                {{ ruta.subject }}
                              </div>
                            </div>

                            <div class="shrink-0 text-xs font-medium text-gray-500 dark:text-gray-400">
                              {{ ruta.fecha_programada?.split(' ')[1] || '-' }}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="overflow-hidden rounded-2xl border border-gray-200/70 bg-white dark:border-gray-800/70 dark:bg-gray-950">
                      <div class="flex items-center justify-between border-b border-gray-200/70 px-4 py-3 dark:border-gray-800/70">
                        <div>
                          <div class="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            Marcaciones
                          </div>
                          <div class="text-xs text-gray-500 dark:text-gray-400">
                            Evidencia de asistencia y ubicacion.
                          </div>
                        </div>
                        <UBadge
                          :color="hasMarcaciones(row.marcaciones) ? 'success' : 'error'"
                          variant="soft"
                          class="rounded-full px-3 py-1"
                        >
                          {{ getMarcacionesCount(row.marcaciones) }}
                        </UBadge>
                      </div>

                      <div class="max-h-96 overflow-auto">
                        <div v-if="esObjetoSinMarcacion(row.marcaciones)" class="p-4 text-sm text-gray-600 dark:text-gray-300">
                          {{ row.marcaciones.message }}
                        </div>

                        <div
                          v-else-if="getMarcacionesCount(row.marcaciones) === 0"
                          class="p-4 text-sm text-gray-600 dark:text-gray-300"
                        >
                          Sin marcaciones registradas.
                        </div>

                        <div v-else class="divide-y divide-gray-200/70 dark:divide-gray-800/70">
                          <div
                            v-for="marcacion in (Array.isArray(row.marcaciones) ? row.marcaciones : [])"
                            :key="marcacion.id || marcacion.punch_time"
                            class="flex items-start justify-between gap-4 p-4"
                          >
                            <div class="min-w-0">
                              <div class="flex flex-wrap items-center gap-2">
                                <UBadge color="success" variant="outline" class="rounded-full px-2.5 py-1 font-mono">
                                  {{ formatPunchHour(marcacion.punch_time) }}
                                </UBadge>
                              </div>
                              <div class="mt-2 text-sm text-gray-700 dark:text-gray-200">
                                {{ getMarkLocation(marcacion) }}
                              </div>
                            </div>

                            <div v-if="marcacion.imagen_url" class="shrink-0">
                              <img
                                :src="marcacion.imagen_url"
                                alt="Foto"
                                class="h-16 w-16 rounded-xl border border-gray-200/70 object-cover shadow-sm dark:border-gray-800/70"
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
        </tbody>
      </table>
    </div>
  </div>
</template>
