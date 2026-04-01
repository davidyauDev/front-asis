<script setup lang="ts">
import { CalendarDate, getLocalTimeZone } from '@internationalized/date'
import { endOfWeek, format, startOfWeek } from 'date-fns'
import { es } from 'date-fns/locale'
import DashboardActiveAlerts from '~/components/sistemas-ti/dashboard/DashboardActiveAlerts.vue'
import DashboardPriorityChart from '~/components/sistemas-ti/dashboard/DashboardPriorityChart.vue'
import DashboardRecentTickets from '~/components/sistemas-ti/dashboard/DashboardRecentTickets.vue'
import DashboardSlaChart from '~/components/sistemas-ti/dashboard/DashboardSlaChart.vue'
import DashboardStats from '~/components/sistemas-ti/dashboard/DashboardStats.vue'
import { useSystemDashboard } from '~/composables/sistemas-ti/useSystemDashboard'
import type { DashboardFilters } from '~/services/sistemas-ti/dashboard'

type CalendarRangeValue = {
  start?: CalendarDate
  end?: CalendarDate
}

definePageMeta({
  layout: 'sistemas-ti',
  middleware: 'auth',
})

useHead({
  title: 'Sistemas TI - Dashboard',
})

const { error, loading, message, payload, loadDashboard } = useSystemDashboard()

const getDefaultFilters = (): DashboardFilters => {
  const now = new Date()
  return {
    start_date: format(startOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
    end_date: format(endOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
  }
}

const toCalendarDate = (value: Date) =>
  new CalendarDate(value.getFullYear(), value.getMonth() + 1, value.getDate())

const parseDateOnly = (value: string) => new Date(`${value}T00:00:00`)

const defaultFilters = getDefaultFilters()
const activeFilters = ref<Required<DashboardFilters>>({
  start_date: defaultFilters.start_date as string,
  end_date: defaultFilters.end_date as string,
})

const calendarRange = ref<CalendarRangeValue>({
  start: toCalendarDate(parseDateOnly(activeFilters.value.start_date)),
  end: toCalendarDate(parseDateOnly(activeFilters.value.end_date)),
})

const syncingCalendar = ref(false)

const syncCalendarFromFilters = (filters: Required<DashboardFilters>) => {
  syncingCalendar.value = true
  calendarRange.value = {
    start: toCalendarDate(parseDateOnly(filters.start_date)),
    end: toCalendarDate(parseDateOnly(filters.end_date)),
  }

  nextTick(() => {
    syncingCalendar.value = false
  })
}

const formatLongDate = (value: string) =>
  format(parseDateOnly(value), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })

const formattedDateRange = computed(() => {
  const start = activeFilters.value.start_date
  const end = activeFilters.value.end_date

  if (!start || !end) {
    return 'Seleccionar rango'
  }

  const startLabel = formatLongDate(start)
  const endLabel = formatLongDate(end)
  return `${startLabel} - ${endLabel}`
})

const applyFiltersFromCalendar = async () => {
  const start = calendarRange.value.start
  const end = calendarRange.value.end ?? start

  if (!start) {
    return
  }

  const nextFilters: Required<DashboardFilters> = {
    start_date: format(start.toDate(getLocalTimeZone()), 'yyyy-MM-dd'),
    end_date: format((end ?? start).toDate(getLocalTimeZone()), 'yyyy-MM-dd'),
  }

  activeFilters.value = nextFilters
  await loadDashboard(nextFilters)
}

const resetDateRange = async () => {
  const filters = getDefaultFilters() as Required<DashboardFilters>
  activeFilters.value = filters
  syncCalendarFromFilters(filters)
  await loadDashboard(filters)
}

watch(calendarRange, async () => {
  if (syncingCalendar.value) {
    return
  }

  await applyFiltersFromCalendar()
}, { deep: true })

watch(() => payload.value?.activeFilters, (filters) => {
  if (!filters) {
    return
  }

  const normalized = {
    start_date: filters.start_date,
    end_date: filters.end_date,
  }
  activeFilters.value = normalized
  syncCalendarFromFilters(normalized)
}, { immediate: true })

onMounted(async () => {
  await loadDashboard(activeFilters.value)
})
</script>

<template>
  <UDashboardPanel id="sistemas-ti-dashboard">
    <template #header>
      <AppDashboardHeader
        title="Dashboard"
        mobile-title="Dashboard TI"
        subtitle="Vision general del modulo de Sistemas TI"
        subtitle-icon="i-lucide-layout-dashboard"
        icon="i-lucide-computer"
        :notification-count="payload?.stats.sla_breaches.out_sla || 0"
        notification-tooltip="Tickets fuera de SLA"
      />
    </template>

    <template #body>
      <div class="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-6">
        <div class="flex items-center gap-3 self-end">
          <UPopover>
            <UButton
              color="neutral"
              variant="outline"
              class="h-9 w-fit justify-between font-normal"
            >
              {{ formattedDateRange }}
              <UIcon name="i-lucide-chevron-down" class="h-4 w-4" />
            </UButton>

            <template #content>
              <div class="p-2">
                <UCalendar
                  v-model="calendarRange as any"
                  range
                  locale="es"
                  class="rounded-md border shadow-sm"
                  :disable-days-outside-current-view="true"
                />
              </div>
            </template>
          </UPopover>

          <UButton
            v-if="calendarRange.start"
            color="neutral"
            variant="outline"
            class="h-9"
            icon="i-lucide-refresh-cw"
            @click="resetDateRange"
          />
        </div>

        <div v-if="loading" class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <USkeleton class="h-28 rounded-xl" />
          <USkeleton class="h-28 rounded-xl" />
          <USkeleton class="h-28 rounded-xl" />
          <USkeleton class="h-28 rounded-xl" />
        </div>

        <UAlert
          v-else-if="error"
          color="error"
          variant="soft"
          icon="i-lucide-alert-triangle"
          title="No se pudo cargar el dashboard"
          :description="error"
        />

        <template v-else-if="payload">
          <UAlert
            color="success"
            variant="soft"
            icon="i-lucide-check-circle"
            :description="message"
          />

          <DashboardStats :stats="payload.stats" />

          <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <DashboardPriorityChart :tickets="payload.tickets_by_priority" />
            <DashboardSlaChart :sla-compliance="payload.sla_compliance" />
          </div>

          <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <DashboardRecentTickets
              class="lg:col-span-2"
              :tickets="payload.recent_tickets"
            />
            <DashboardActiveAlerts :notifications="payload.recent_contract_notifications" />
          </div>
        </template>
      </div>
    </template>
  </UDashboardPanel>
</template>
