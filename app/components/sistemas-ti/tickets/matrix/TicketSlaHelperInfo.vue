<script setup lang="ts">
import {
  SLA_POLICIES,
  systemTicketPriorityColorMap,
} from '~/services/sistemas-ti/tickets'

const getPolicyColor = (priority: (typeof SLA_POLICIES)[number]['priority']) => {
  const map = {
    primary: 'text-primary',
    warning: 'text-amber-600 dark:text-amber-300',
    error: 'text-rose-600 dark:text-rose-300',
    success: 'text-emerald-600 dark:text-emerald-300',
  }

  return map[systemTicketPriorityColorMap[priority]]
}

const formatMinutes = (minutes: number) => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  if (hours && mins) {
    return `${hours}h ${mins}m`
  }

  if (hours) {
    return `${hours}h`
  }

  return `${mins}m`
}
</script>

<template>
  <UPopover>
    <UButton color="neutral" variant="outline" icon="i-lucide-info" />

    <template #content>
      <div class="w-[380px] space-y-4 p-4">
        <div>
          <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Ayuda SLA
          </p>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            Los tiempos se contabilizan solo dentro del horario laboral.
          </p>
        </div>

        <div class="grid gap-2 text-xs">
          <p class="font-semibold uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400">
            Horario laboral
          </p>
          <div class="grid grid-cols-2 gap-2">
            <div class="rounded-lg border border-gray-200/70 p-2 dark:border-gray-800/70">
              <p class="font-semibold text-gray-700 dark:text-gray-200">
                Lunes a Viernes
              </p>
              <p class="text-gray-500 dark:text-gray-400">
                8:30 - 18:00
              </p>
            </div>
            <div class="rounded-lg border border-gray-200/70 p-2 dark:border-gray-800/70">
              <p class="font-semibold text-gray-700 dark:text-gray-200">
                Sabados
              </p>
              <p class="text-gray-500 dark:text-gray-400">
                8:30 - 12:00
              </p>
            </div>
          </div>
          <p class="text-gray-500 dark:text-gray-400">
            Almuerzo: 13:00 - 14:00 (no contabiliza)
          </p>
          <p class="text-gray-500 dark:text-gray-400">
            Feriados: no contabiliza
          </p>
        </div>

        <div class="space-y-2 text-xs">
          <p class="font-semibold uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400">
            Politicas por prioridad
          </p>
          <div class="grid grid-cols-3 rounded-md bg-gray-100 px-2 py-1 text-[11px] font-semibold dark:bg-gray-800/70">
            <span>Prioridad</span>
            <span class="text-center">Respuesta</span>
            <span class="text-center">Solucion</span>
          </div>
          <div
            v-for="policy in SLA_POLICIES"
            :key="policy.priority"
            class="grid grid-cols-3 items-center rounded-md border border-gray-200/70 px-2 py-1 dark:border-gray-800/70"
          >
            <span class="font-semibold" :class="getPolicyColor(policy.priority)">
              {{ policy.label }}
            </span>
            <span class="text-center text-gray-600 dark:text-gray-300">
              {{ formatMinutes(policy.responseTimeMinutes) }}
            </span>
            <span class="text-center text-gray-600 dark:text-gray-300">
              {{ formatMinutes(policy.resolutionTimeMinutes) }}
            </span>
          </div>
        </div>
      </div>
    </template>
  </UPopover>
</template>
