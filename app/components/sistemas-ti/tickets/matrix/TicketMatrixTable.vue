<script setup lang="ts">
import type {
  SystemTicket,
  SystemTicketStatus,
} from '~/services/sistemas-ti/tickets'

interface Props {
  tickets: SystemTicket[]
  statusOptions: Array<{ label: string, value: SystemTicketStatus }>
  loadingTicketId: number | null
  getStatusLabel: (status: SystemTicketStatus) => string
  getPriorityLabel: (priority: SystemTicket['priority']) => string
  getTypeLabel: (type: SystemTicket['type']) => string
  getCategoryLabel: (category: SystemTicket['category']) => string
  getStatusColor: (status: SystemTicketStatus) => 'primary' | 'warning' | 'success' | 'neutral'
  getPriorityColor: (priority: SystemTicket['priority']) => 'primary' | 'warning' | 'error' | 'success'
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'assign', ticket: SystemTicket, responsible: string | null): void
  (e: 'change-status', ticket: SystemTicket, status: SystemTicketStatus): void
  (e: 'edit', ticket: SystemTicket): void
  (e: 'details', ticket: SystemTicket): void
  (e: 'history', ticket: SystemTicket): void
  (e: 'delete', ticket: SystemTicket): void
}>()

const responsibleDrafts = reactive<Record<number, string>>({})
const statusDrafts = reactive<Record<number, SystemTicketStatus>>({})

const syncDrafts = () => {
  for (const ticket of props.tickets) {
    if (responsibleDrafts[ticket.id] === undefined) {
      responsibleDrafts[ticket.id] = ticket.responsible ?? ''
    }

    statusDrafts[ticket.id] = ticket.status
  }
}

watch(() => props.tickets, () => {
  syncDrafts()
}, { immediate: true, deep: true })

const formatDateTime = (value: string) => {
  return new Date(value).toLocaleString()
}

const formatHours = (hours: number) => {
  if (!Number.isFinite(hours)) {
    return '-'
  }

  return `${hours.toFixed(1)}h`
}

const slaTone = (hours: number) => {
  if (hours <= 0) {
    return 'bg-rose-500/10 text-rose-600 border-rose-500/20'
  }

  if (hours <= 2) {
    return 'bg-amber-500/10 text-amber-600 border-amber-500/20'
  }

  return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
}

const handleAssign = (ticket: SystemTicket) => {
  const responsible = responsibleDrafts[ticket.id]?.trim() || null
  emit('assign', ticket, responsible)
}

const handleStatus = (ticket: SystemTicket) => {
  const status = statusDrafts[ticket.id] ?? ticket.status
  emit('change-status', ticket, status)
}
</script>

<template>
  <UCard class="border-gray-200/70 dark:border-gray-800/70">
    <div class="overflow-x-auto">
      <table class="min-w-[1380px] w-full text-sm">
        <thead>
          <tr class="border-b border-gray-200/70 text-left text-xs uppercase tracking-[0.12em] text-gray-500 dark:border-gray-800/70 dark:text-gray-400">
            <th class="px-3 py-2 font-medium">
              Ticket
            </th>
            <th class="px-3 py-2 font-medium">
              Tipo
            </th>
            <th class="px-3 py-2 font-medium">
              Prioridad
            </th>
            <th class="px-3 py-2 font-medium">
              Estado
            </th>
            <th class="px-3 py-2 font-medium">
              Categoria
            </th>
            <th class="px-3 py-2 font-medium">
              Solicitante
            </th>
            <th class="px-3 py-2 font-medium">
              Responsable
            </th>
            <th class="px-3 py-2 font-medium">
              SLA solucion
            </th>
            <th class="px-3 py-2 font-medium">
              Ult. actualizacion
            </th>
            <th class="px-3 py-2 font-medium">
              Acciones
            </th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="ticket in tickets"
            :key="ticket.id"
            class="border-b border-gray-200/70 align-top last:border-0 dark:border-gray-800/70"
          >
            <td class="px-3 py-3">
              <p class="font-mono text-xs font-semibold text-primary">
                {{ ticket.code }}
              </p>
              <p class="font-semibold text-gray-900 dark:text-gray-100">
                {{ ticket.title }}
              </p>
              <p class="line-clamp-2 max-w-[260px] text-xs text-gray-500 dark:text-gray-400">
                {{ ticket.description }}
              </p>
            </td>

            <td class="px-3 py-3">
              <UBadge color="neutral" variant="subtle">
                {{ getTypeLabel(ticket.type) }}
              </UBadge>
            </td>

            <td class="px-3 py-3">
              <UBadge :color="getPriorityColor(ticket.priority)" variant="soft">
                {{ getPriorityLabel(ticket.priority) }}
              </UBadge>
            </td>

            <td class="px-3 py-3">
              <UBadge :color="getStatusColor(ticket.status)" variant="soft">
                {{ getStatusLabel(ticket.status) }}
              </UBadge>
            </td>

            <td class="px-3 py-3">
              <UBadge color="neutral" variant="outline">
                {{ getCategoryLabel(ticket.category) }}
              </UBadge>
            </td>

            <td class="px-3 py-3">
              <p class="font-medium text-gray-900 dark:text-gray-100">
                {{ ticket.requester }}
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                {{ ticket.area }}
              </p>
            </td>

            <td class="px-3 py-3 min-w-[220px]">
              <div class="space-y-2">
                <UInput v-model="responsibleDrafts[ticket.id]" size="sm" placeholder="Responsable TI" />
                <UButton
                  size="sm"
                  color="neutral"
                  variant="outline"
                  icon="i-lucide-user-check"
                  :loading="loadingTicketId === ticket.id"
                  @click="handleAssign(ticket)"
                >
                  Asignar
                </UButton>
              </div>
            </td>

            <td class="px-3 py-3">
              <div class="space-y-2">
                <UBadge variant="soft" class="border" :class="slaTone(ticket.slaRemainingHours)">
                  {{ formatHours(ticket.slaRemainingHours) }}
                </UBadge>
                <p class="text-[11px] text-gray-500 dark:text-gray-400">
                  Vence: {{ formatDateTime(ticket.slaResolutionDueAt) }}
                </p>
              </div>
            </td>

            <td class="px-3 py-3">
              <p class="text-xs text-gray-500 dark:text-gray-400">
                {{ formatDateTime(ticket.updatedAt) }}
              </p>
              <div class="mt-2 space-y-1">
                <USelect v-model="statusDrafts[ticket.id]" :items="statusOptions" size="sm" />
                <UButton
                  size="sm"
                  color="neutral"
                  variant="outline"
                  icon="i-lucide-check"
                  :loading="loadingTicketId === ticket.id"
                  @click="handleStatus(ticket)"
                >
                  Estado
                </UButton>
              </div>
            </td>

            <td class="px-3 py-3">
              <div class="flex flex-wrap gap-1">
                <UButton size="xs" color="neutral" variant="ghost" icon="i-lucide-eye" @click="emit('details', ticket)" />
                <UButton size="xs" color="neutral" variant="ghost" icon="i-lucide-history" @click="emit('history', ticket)" />
                <UButton size="xs" color="neutral" variant="ghost" icon="i-lucide-pencil" @click="emit('edit', ticket)" />
                <UButton size="xs" color="error" variant="ghost" icon="i-lucide-trash-2" @click="emit('delete', ticket)" />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </UCard>
</template>
