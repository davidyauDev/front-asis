<script setup lang="ts">
import { format } from 'date-fns'
import { getLocalTimeZone } from '@internationalized/date'
import type { SystemTicket, TicketHistoryType } from '~/services/sistemas-ti/tickets'

const props = defineProps<{
  ticket: SystemTicket | null
}>()

const open = defineModel<boolean>('open', { default: false })
const ticket = computed(() => props.ticket)

const actions = ref<TicketHistoryType[]>([])
const dateRange = ref<{ start?: any, end?: any } | undefined>()
const perPage = ref(10)
const currentPage = ref(1)

const actionOptions: Array<{ label: string, value: TicketHistoryType, icon: string, tone: string }> = [
  { value: 'TICKET_CREATED', label: 'Creado', icon: 'i-lucide-ticket-plus', tone: 'bg-blue-500/10 text-blue-700 dark:text-blue-300' },
  { value: 'COMMENT', label: 'Comentario', icon: 'i-lucide-message-square', tone: 'bg-slate-500/10 text-slate-700 dark:text-slate-300' },
  { value: 'STATUS_CHANGED', label: 'Cambio estado', icon: 'i-lucide-refresh-cw', tone: 'bg-violet-500/10 text-violet-700 dark:text-violet-300' },
  { value: 'ASSIGNED', label: 'Asignado', icon: 'i-lucide-user-check', tone: 'bg-amber-500/10 text-amber-700 dark:text-amber-300' },
  { value: 'ESCALATED', label: 'Escalado', icon: 'i-lucide-arrow-up-right', tone: 'bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-300' },
  { value: 'RESOLVED', label: 'Resuelto', icon: 'i-lucide-check-circle-2', tone: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' },
  { value: 'CLOSED', label: 'Cerrado', icon: 'i-lucide-archive', tone: 'bg-gray-500/10 text-gray-700 dark:text-gray-300' },
  { value: 'REOPENED', label: 'Reabierto', icon: 'i-lucide-rotate-ccw', tone: 'bg-amber-500/10 text-amber-700 dark:text-amber-300' },
  { value: 'ASSET_LINKED', label: 'Activo vinculado', icon: 'i-lucide-hard-drive', tone: 'bg-teal-500/10 text-teal-700 dark:text-teal-300' },
  { value: 'SLA_EVENT', label: 'SLA', icon: 'i-lucide-timer', tone: 'bg-rose-500/10 text-rose-700 dark:text-rose-300' },
]

const actionOptionMap = computed(() => {
  return Object.fromEntries(actionOptions.map(item => [item.value, item]))
})

const actionItems = computed(() => {
  return actionOptions.map(item => ({ label: item.label, value: item.value }))
})

const filteredHistories = computed(() => {
  if (!ticket.value?.histories) {
    return []
  }

  return [...ticket.value.histories]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .filter((history) => {
      if (actions.value.length && !actions.value.includes(history.type)) {
        return false
      }

      const date = new Date(history.createdAt)
      if (Number.isNaN(date.getTime())) {
        return false
      }

      const fromRange = dateRange.value?.start?.toDate?.(getLocalTimeZone())
      if (fromRange && date.getTime() < new Date(fromRange).setHours(0, 0, 0, 0)) {
        return false
      }

      const toRange = dateRange.value?.end?.toDate?.(getLocalTimeZone())
      if (toRange && date.getTime() > new Date(toRange).setHours(23, 59, 59, 999)) {
        return false
      }

      return true
    })
})

const total = computed(() => filteredHistories.value.length)
const lastPage = computed(() => Math.max(1, Math.ceil(total.value / perPage.value)))
const from = computed(() => (total.value ? ((currentPage.value - 1) * perPage.value) + 1 : 0))
const to = computed(() => Math.min(currentPage.value * perPage.value, total.value))

const paginatedHistories = computed(() => {
  const start = (currentPage.value - 1) * perPage.value
  return filteredHistories.value.slice(start, start + perPage.value)
})

const hasFilters = computed(() => actions.value.length > 0 || !!dateRange.value)

const resetFilters = () => {
  actions.value = []
  dateRange.value = undefined
  currentPage.value = 1
}

watch(
  () => [actions.value.join('|'), JSON.stringify(dateRange.value || {})],
  () => {
    currentPage.value = 1
  },
)

watch(
  () => lastPage.value,
  (value) => {
    if (currentPage.value > value) {
      currentPage.value = value
    }
  },
)

watch(
  () => open.value,
  (isOpen) => {
    if (!isOpen) {
      resetFilters()
    }
  },
)
</script>

<template>
  <UModal v-model:open="open">
    <template #content>
      <div class="mx-auto w-full max-h-screen sm:max-w-5xl overflow-y-auto rounded-xl border border-border bg-background">
        <div class="space-y-2 border-b px-6 pb-3 pt-5">
          <div class="flex items-start gap-3">
            <div class="flex size-12 items-center justify-center rounded-xl bg-primary/10 ring-2 ring-primary/15">
              <UIcon name="i-lucide-ticket" class="size-6 text-primary" />
            </div>
            <div class="min-w-0 flex-1">
              <h2 class="line-clamp-1 text-xl font-semibold leading-tight">
                Historial de {{ ticket?.title || 'ticket' }}
              </h2>
              <p class="text-sm text-muted-foreground">
                Consulta los movimientos y acciones realizadas sobre este ticket.
              </p>
              <p
                v-if="ticket"
                class="mt-1 inline-flex items-center gap-2 rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground"
              >
                <span class="font-mono">{{ ticket.code }}</span>
                <span class="text-foreground">·</span>
                <span class="line-clamp-1 font-medium">{{ ticket.description }}</span>
              </p>
            </div>
          </div>
        </div>

        <div class="px-6 pb-3">
          <div class="relative space-y-6">
            <div class="sticky top-0 z-10 border-b border-border/80 bg-background/90 pb-3 pt-4 backdrop-blur">
              <div class="flex flex-col gap-3 md:flex-row md:items-center">
                <div class="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <UBadge color="neutral" variant="outline">
                    Filtros
                  </UBadge>
                  <UBadge v-if="actions.length" color="neutral" variant="soft" class="cursor-pointer" @click="actions = []">
                    {{ actions.length }} accion(es)
                    <UIcon name="i-lucide-x-circle" class="ml-1 h-3.5 w-3.5" />
                  </UBadge>
                  <UBadge v-if="dateRange" color="neutral" variant="soft" class="cursor-pointer" @click="dateRange = undefined">
                    Rango aplicado
                    <UIcon name="i-lucide-x-circle" class="ml-1 h-3.5 w-3.5" />
                  </UBadge>
                </div>

                <div class="flex flex-wrap items-center gap-2 md:ml-auto">
                  <USelectMenu
                    v-model="actions"
                    multiple
                    :items="actionItems"
                    value-key="value"
                    label-key="label"
                    placeholder="Seleccione una accion"
                    class="w-52"
                  />

                  <UPopover>
                    <UButton color="neutral" variant="outline" class="w-full justify-between font-normal sm:w-60">
                      {{
                        JSON.stringify(dateRange) !== '{}' && dateRange
                          ? `${dateRange?.start?.toDate(getLocalTimeZone()).toLocaleDateString()}${dateRange?.end?.toDate(getLocalTimeZone()).toLocaleDateString() ? ' - ' : ''}${dateRange?.end?.toDate(getLocalTimeZone()).toLocaleDateString() || ''}`
                          : 'Seleccionar rango de fechas'
                      }}
                      <UIcon name="i-lucide-chevron-down" class="h-4 w-4" />
                    </UButton>
                    <template #content>
                      <div class="w-auto overflow-hidden p-0">
                        <UCalendar
                          v-model="dateRange as any"
                          range
                          locale="es"
                          :number-of-months="2"
                          :disable-days-outside-current-view="true"
                        />
                      </div>
                    </template>
                  </UPopover>

                  <UButton
                    color="neutral"
                    variant="ghost"
                    size="sm"
                    icon="i-lucide-refresh-ccw"
                    :disabled="!hasFilters"
                    @click="resetFilters"
                  />
                </div>
              </div>
            </div>

            <div class="space-y-6">
              <div v-if="!paginatedHistories.length" class="rounded-xl border border-dashed border-border py-12 text-center">
                <UIcon name="i-lucide-history" class="mx-auto h-8 w-8 text-muted-foreground" />
                <p class="mt-2 text-sm font-semibold">
                  Sin historial
                </p>
                <p class="mt-1 text-xs text-muted-foreground">
                  No hay movimientos registrados para este ticket.
                </p>
              </div>

              <div
                v-for="history in paginatedHistories"
                :key="history.id"
                class="relative flex gap-4 pl-12"
              >
                <div class="absolute bottom-0 left-4 top-0 w-px bg-border" />
                <div class="absolute left-2 flex size-6 items-center justify-center rounded-full border-2 bg-card text-primary shadow-sm">
                  <UIcon :name="actionOptionMap[history.type]?.icon || 'i-lucide-circle'" class="h-3 w-3" />
                </div>

                <div class="flex-1 rounded-xl border bg-muted/40 p-4">
                  <div class="flex items-start justify-between gap-3">
                    <UBadge
                      color="neutral"
                      variant="soft"
                      :class="actionOptionMap[history.type]?.tone || 'bg-gray-500/10 text-gray-700 dark:text-gray-300'"
                    >
                      {{ actionOptionMap[history.type]?.label || history.type }}
                    </UBadge>
                    <span class="text-xs text-muted-foreground">
                      {{ format(new Date(history.createdAt), 'dd/MM/yyyy HH:mm') }}
                    </span>
                  </div>

                  <p class="mt-2 text-sm text-muted-foreground">
                    {{ history.description }}
                  </p>

                  <p class="mt-3 text-xs text-muted-foreground">
                    Por:
                    <UBadge color="neutral" variant="outline" class="ml-1">
                      {{ history.actor }}
                    </UBadge>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="border-t px-6 py-4">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p class="text-sm text-muted-foreground">
              Mostrando <span class="font-semibold text-foreground">{{ from }}</span> a
              <span class="font-semibold text-foreground">{{ to }}</span> de
              <span class="font-semibold text-foreground">{{ total }}</span> eventos
            </p>

            <UPagination
              :model-value="currentPage"
              :total="total"
              :items-per-page="perPage"
              :max="5"
              size="sm"
              :prev-button="{ icon: 'i-lucide-chevron-left', label: '', color: 'neutral' }"
              :next-button="{ icon: 'i-lucide-chevron-right', label: '', color: 'neutral' }"
              @update:page="currentPage = $event"
            />
          </div>
        </div>
      </div>
    </template>
  </UModal>
</template>
