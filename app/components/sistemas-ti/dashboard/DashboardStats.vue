<script setup lang="ts">
import type { DashboardStatsPayload } from '~/services/sistemas-ti/dashboard'
import type { SystemTicketPriority } from '~/services/sistemas-ti/tickets'

const props = defineProps<{
  stats: DashboardStatsPayload
}>()

const priorityLabel: Record<SystemTicketPriority, string> = {
  URGENT: 'Critica',
  HIGH: 'Alta',
  MEDIUM: 'Media',
  LOW: 'Baja',
}

const priorityIcon: Record<SystemTicketPriority, string> = {
  URGENT: 'i-lucide-flame',
  HIGH: 'i-lucide-arrow-up',
  MEDIUM: 'i-lucide-minus',
  LOW: 'i-lucide-arrow-down',
}

const slaBreachesClass: Record<SystemTicketPriority, {
  delta: string
  card: string
  icon: string
}> = {
  URGENT: {
    delta: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
    card: 'border-rose-500/20 bg-rose-500/5',
    icon: 'text-rose-600 bg-rose-500/10',
  },
  HIGH: {
    delta: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
    card: 'border-orange-500/20 bg-orange-500/5',
    icon: 'text-orange-600 bg-orange-500/10',
  },
  MEDIUM: {
    delta: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
    card: 'border-yellow-500/20 bg-yellow-500/5',
    icon: 'text-yellow-600 bg-yellow-500/10',
  },
  LOW: {
    delta: 'bg-green-500/10 text-green-600 border-green-500/20',
    card: 'border-green-500/20 bg-green-500/5',
    icon: 'text-green-600 bg-green-500/10',
  },
}

const statsParsed = computed(() => {
  const { active_projects, assets_at_risk, open_tickets, sla_breaches } = props.stats

  return [
    {
      title: 'Tickets abiertos',
      value: open_tickets.total,
      helper: `${open_tickets.unassigned} sin asignar`,
      delta: `${open_tickets.trend_direction === 'up' ? '↑' : '↓'} ${Math.abs(open_tickets.trend_percentage)}%`,
      deltaClass: open_tickets.trend_direction === 'up'
        ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
        : 'bg-rose-500/10 text-rose-600 border-rose-500/20',
      icon: 'i-lucide-ticket',
      cardClass: 'border-primary/15 bg-primary/5',
      iconClass: 'text-primary bg-primary/10',
    },
    {
      title: 'Fuera de SLA',
      value: sla_breaches.out_sla,
      helper: sla_breaches.message,
      delta: priorityLabel[sla_breaches.severity],
      deltaClass: slaBreachesClass[sla_breaches.severity].delta,
      icon: priorityIcon[sla_breaches.severity],
      cardClass: slaBreachesClass[sla_breaches.severity].card,
      iconClass: slaBreachesClass[sla_breaches.severity].icon,
    },
    {
      title: 'Activos en riesgo',
      value: assets_at_risk.total,
      helper: assets_at_risk.message,
      delta: `${assets_at_risk.new_assets} nuevos`,
      deltaClass: assets_at_risk.new_assets
        ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
        : 'bg-gray-500/10 text-gray-600 border-gray-500/20',
      icon: 'i-lucide-monitor',
      cardClass: assets_at_risk.new_assets
        ? 'border-amber-500/20 bg-amber-500/5'
        : 'border-gray-500/20 bg-gray-500/5',
      iconClass: assets_at_risk.new_assets
        ? 'text-amber-600 bg-amber-500/10'
        : 'text-gray-600 bg-gray-500/10',
    },
    {
      title: 'Proyectos activos',
      value: active_projects.total,
      helper: `${active_projects.in_development} en fase de desarrollo`,
      delta: `${active_projects.trend_direction === 'up' ? '↑' : '↓'} ${Math.abs(active_projects.trend_percentage)}%`,
      deltaClass: active_projects.trend_direction === 'up'
        ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
        : 'bg-rose-500/10 text-rose-600 border-rose-500/20',
      icon: 'i-lucide-code-2',
      cardClass: active_projects.trend_direction === 'up'
        ? 'border-emerald-500/20 bg-emerald-500/5'
        : 'border-rose-500/20 bg-rose-500/5',
      iconClass: active_projects.trend_direction === 'up'
        ? 'text-emerald-600 bg-emerald-500/10'
        : 'text-rose-600 bg-rose-500/10',
    },
  ]
})
</script>

<template>
  <div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
    <UCard
      v-for="stat in statsParsed"
      :key="stat.title"
      class="border"
      :class="stat.cardClass"
    >
      <div class="flex items-start justify-between gap-4 py-1">
        <div class="space-y-2">
          <p class="text-sm font-medium text-gray-600 dark:text-gray-300">
            {{ stat.title }}
          </p>
          <div class="flex items-center gap-3">
            <p class="text-3xl font-semibold text-gray-900 dark:text-gray-100">
              {{ stat.value }}
            </p>
            <UBadge
              variant="soft"
              class="border"
              :class="stat.deltaClass"
            >
              {{ stat.delta }}
            </UBadge>
          </div>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            {{ stat.helper }}
          </p>
        </div>

        <div class="rounded-lg p-3" :class="stat.iconClass">
          <UIcon :name="stat.icon" class="h-5 w-5" />
        </div>
      </div>
    </UCard>
  </div>
</template>
