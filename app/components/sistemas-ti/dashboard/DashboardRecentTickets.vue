<script setup lang="ts">
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import type { DashboardRecentTicket } from '~/services/sistemas-ti/dashboard'
import type { SystemTicketPriority, SystemTicketStatus } from '~/services/sistemas-ti/tickets'

defineProps<{
  tickets: DashboardRecentTicket[]
}>()

const priorityMeta: Record<SystemTicketPriority, { label: string, icon: string, class: string }> = {
  LOW: { label: 'Baja', icon: 'i-lucide-arrow-down', class: 'bg-green-500/10 text-green-600 border-green-500/20' },
  MEDIUM: { label: 'Media', icon: 'i-lucide-minus', class: 'bg-sky-500/10 text-sky-600 border-sky-500/20' },
  HIGH: { label: 'Alta', icon: 'i-lucide-arrow-up', class: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
  URGENT: { label: 'Critica', icon: 'i-lucide-flame', class: 'bg-rose-500/10 text-rose-600 border-rose-500/20' },
}

const statusMeta: Record<SystemTicketStatus, { label: string, icon: string, class: string }> = {
  OPEN: { label: 'Abierto', icon: 'i-lucide-folder-open', class: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
  IN_PROGRESS: { label: 'En progreso', icon: 'i-lucide-loader-circle', class: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20' },
  ON_HOLD: { label: 'En espera del proveedor', icon: 'i-lucide-pause-circle', class: 'bg-orange-500/10 text-orange-600 border-orange-500/20' },
  RESOLVED: { label: 'Resuelto', icon: 'i-lucide-check-circle', class: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
  CLOSED: { label: 'Cerrado', icon: 'i-lucide-archive', class: 'bg-gray-500/10 text-gray-600 border-gray-500/20' },
}

const formatRelativeDate = (date: string) =>
  formatDistanceToNow(new Date(date), { addSuffix: true, locale: es })
</script>

<template>
  <UCard class="border-gray-200/70 dark:border-gray-800/70">
    <template #header>
      <div class="flex items-start justify-between gap-3">
        <div>
          <h3 class="text-base font-semibold text-gray-900 dark:text-gray-100">
            Tickets recientes
          </h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Ultimas solicitudes reportadas por el equipo.
          </p>
        </div>

        <UButton
          to="/sistemas-ti/tickets"
          color="neutral"
          variant="ghost"
          size="sm"
        >
          Ver todos
        </UButton>
      </div>
    </template>

    <div v-if="!tickets.length" class="rounded-xl border border-dashed border-gray-300/80 p-8 text-center dark:border-gray-700">
      <UIcon name="i-lucide-ticket" class="mx-auto h-8 w-8 text-gray-400" />
      <p class="mt-3 text-sm font-semibold text-gray-700 dark:text-gray-200">
        No hay tickets recientes
      </p>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        No se han reportado nuevas solicitudes esta semana.
      </p>
      <UButton to="/sistemas-ti/tickets" class="mt-4" size="sm">
        Crear ticket
      </UButton>
    </div>

    <div v-else class="overflow-x-auto">
      <table class="min-w-full text-sm">
        <thead>
          <tr class="border-b border-gray-200/70 text-left text-xs uppercase tracking-[0.12em] text-gray-500 dark:border-gray-800/70 dark:text-gray-400">
            <th class="px-3 py-2 font-medium">ID</th>
            <th class="px-3 py-2 font-medium">Titulo</th>
            <th class="px-3 py-2 font-medium">Prioridad</th>
            <th class="px-3 py-2 font-medium">Estado</th>
            <th class="px-3 py-2 font-medium">Asignado</th>
            <th class="px-3 py-2 font-medium">Creado</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="ticket in tickets"
            :key="ticket.id"
            class="border-b border-gray-200/70 last:border-b-0 dark:border-gray-800/70"
          >
            <td class="px-3 py-3 font-mono text-primary">
              TK-{{ ticket.id.toString().padStart(3, '0') }}
            </td>
            <td class="px-3 py-3 font-medium text-gray-900 dark:text-gray-100">
              <p class="max-w-64 truncate">
                {{ ticket.title }}
              </p>
            </td>
            <td class="px-3 py-3">
              <UBadge variant="soft" class="border" :class="priorityMeta[ticket.priority].class">
                <UIcon :name="priorityMeta[ticket.priority].icon" class="h-3.5 w-3.5" />
                {{ priorityMeta[ticket.priority].label }}
              </UBadge>
            </td>
            <td class="px-3 py-3">
              <UBadge variant="soft" class="border" :class="statusMeta[ticket.status].class">
                <UIcon :name="statusMeta[ticket.status].icon" class="h-3.5 w-3.5" />
                {{ statusMeta[ticket.status].label }}
              </UBadge>
            </td>
            <td class="px-3 py-3 text-gray-500 dark:text-gray-400">
              {{ ticket.responsible ? ticket.responsible.full_name : 'Sin asignar' }}
            </td>
            <td class="px-3 py-3 text-gray-500 dark:text-gray-400">
              {{ formatRelativeDate(ticket.created_at) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </UCard>
</template>
