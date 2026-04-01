<script setup lang="ts">
import { differenceInMinutes, format } from 'date-fns'
import RequesterAssetsSheet from '~/components/sistemas-ti/tickets/RequesterAssetsSheet.vue'
import type {
  SystemTicket,
  SystemTicketCategory,
  SystemTicketPriority,
  SystemTicketStatus,
  SystemTicketType,
} from '~/services/sistemas-ti/tickets'

interface Props {
  ticket: SystemTicket | null
  getStatusLabel: (status: SystemTicketStatus) => string
  getPriorityLabel: (priority: SystemTicketPriority) => string
  getTypeLabel: (type: SystemTicketType) => string
  getCategoryLabel: (category: SystemTicketCategory) => string
  getStatusColor: (status: SystemTicketStatus) => 'primary' | 'warning' | 'success' | 'neutral'
  getPriorityColor: (priority: SystemTicketPriority) => 'primary' | 'warning' | 'error' | 'success'
}

const props = defineProps<Props>()

const open = defineModel<boolean>('open', { default: false })
const ticket = computed(() => props.ticket)

const openRequesterAssets = ref(false)

const impactLabels: Record<string, string> = {
  LOW: 'Bajo',
  MEDIUM: 'Medio',
  HIGH: 'Alto',
}

const urgencyLabels: Record<string, string> = {
  LOW: 'Baja',
  MEDIUM: 'Media',
  HIGH: 'Alta',
}

const formatDate = (value?: string | null): string => {
  if (!value) {
    return 'Sin registrar'
  }

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return 'Sin registrar'
  }

  return format(parsed, 'dd/MM/yyyy HH:mm')
}

const formatMinutes = (minutes: number) => {
  const absolute = Math.abs(minutes)
  const hours = Math.floor(absolute / 60)
  const remainder = absolute % 60
  if (hours <= 0) {
    return `${remainder} min`
  }

  if (remainder <= 0) {
    return `${hours} h`
  }

  return `${hours} h ${remainder} min`
}

const responseSla = computed(() => {
  if (!props.ticket) {
    return null
  }

  const due = new Date(props.ticket.slaResponseDueAt)
  if (Number.isNaN(due.getTime())) {
    return null
  }

  if (props.ticket.firstResponseAt) {
    const firstResponse = new Date(props.ticket.firstResponseAt)
    if (Number.isNaN(firstResponse.getTime())) {
      return null
    }

    const diff = differenceInMinutes(due, firstResponse)

    if (diff < 0) {
      return {
        label: `${formatMinutes(diff)} tarde`,
        tone: 'bg-red-500 text-white',
        icon: 'i-lucide-clock-3',
      }
    }

    return {
      label: `${formatMinutes(diff)} antes`,
      tone: 'bg-emerald-500 text-white',
      icon: 'i-lucide-check-circle-2',
    }
  }

  const diff = differenceInMinutes(due, new Date())

  if (diff < 0) {
    return {
      label: `${formatMinutes(diff)} tarde`,
      tone: 'bg-red-500 text-white',
      icon: 'i-lucide-clock-3',
    }
  }

  return {
    label: `${formatMinutes(diff)} restantes`,
    tone: 'bg-amber-500 text-white',
    icon: 'i-lucide-clock-3',
  }
})

const resolutionSla = computed(() => {
  if (!props.ticket) {
    return null
  }

  const due = new Date(props.ticket.slaResolutionDueAt)
  if (Number.isNaN(due.getTime())) {
    return null
  }

  const resolutionReference = props.ticket.resolvedAt ?? props.ticket.closedAt
  if (resolutionReference) {
    const resolved = new Date(resolutionReference)
    if (Number.isNaN(resolved.getTime())) {
      return null
    }

    const diff = differenceInMinutes(due, resolved)

    if (diff < 0) {
      return {
        label: `${formatMinutes(diff)} tarde`,
        tone: 'bg-red-500 text-white',
        icon: 'i-lucide-clock-3',
      }
    }

    return {
      label: `${formatMinutes(diff)} antes`,
      tone: 'bg-emerald-500 text-white',
      icon: 'i-lucide-check-circle-2',
    }
  }

  const diff = differenceInMinutes(due, new Date())
  if (diff < 0) {
    return {
      label: `${formatMinutes(diff)} tarde`,
      tone: 'bg-red-500 text-white',
      icon: 'i-lucide-clock-3',
    }
  }

  return {
    label: `${formatMinutes(diff)} restantes`,
    tone: 'bg-amber-500 text-white',
    icon: 'i-lucide-clock-3',
  }
})

const imageUrls = computed(() => {
  if (!props.ticket?.images) {
    return []
  }

  return props.ticket.images
})
</script>

<template>
  <UModal v-model:open="open">
    <template #content>
      <div class="mx-auto w-full max-h-screen sm:max-w-4xl overflow-y-auto rounded-xl border border-border bg-background">
        <div class="space-y-3 px-6 pb-4 pt-5">
          <div class="flex items-start gap-4 rounded-xl border bg-linear-to-br from-muted/40 via-background to-background p-4">
            <div class="flex size-16 items-center justify-center rounded-xl bg-linear-to-br from-cyan-100/40 to-blue-100/40 shadow-sm ring-2 ring-blue-200/50 dark:from-cyan-900/30 dark:to-blue-900/30 dark:ring-blue-800/50">
              <UIcon name="i-lucide-ticket" class="size-8 text-blue-600 dark:text-blue-400" />
            </div>

            <div class="min-w-0 flex-1">
              <div class="mb-1 flex items-center gap-2">
                <p class="rounded-md bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground">
                  {{ ticket?.code }}
                </p>
                <UBadge class="text-xs" color="neutral" variant="outline">
                  {{ ticket ? getTypeLabel(ticket.type) : 'Sin tipo' }}
                </UBadge>
              </div>

              <h2 class="line-clamp-2 text-2xl font-bold tracking-tight">
                {{ ticket?.title }}
              </h2>
              <p class="mt-1 text-sm text-muted-foreground">
                {{ ticket?.description }}
              </p>
            </div>
          </div>
        </div>

        <div class="px-6 pb-6">
          <div v-if="ticket" class="grid gap-4 lg:grid-cols-3">
            <div class="grid gap-3 md:grid-cols-2 lg:col-span-2">
              <div class="flex items-start gap-3 rounded-lg border bg-card p-4 transition hover:bg-muted/50">
                <div class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <UIcon name="i-lucide-user" class="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div class="min-w-0 flex-1">
                  <div class="flex items-center justify-between gap-2">
                    <p class="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Solicitante
                    </p>
                    <UButton size="xs" color="neutral" variant="outline" icon="i-lucide-monitor-smartphone" @click="openRequesterAssets = true" />
                  </div>
                  <p class="mt-1 text-sm font-semibold">
                    {{ ticket.requester || 'Sin dato' }}
                  </p>
                  <p class="mt-0.5 text-xs text-muted-foreground">
                    {{ ticket.area || 'Sin departamento' }}
                  </p>
                </div>
              </div>

              <div class="flex items-start gap-3 rounded-lg border bg-card p-4 transition hover:bg-muted/50">
                <div class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
                  <UIcon name="i-lucide-zap" class="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div class="flex-1">
                  <p class="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Asignado a
                  </p>
                  <p v-if="ticket.responsible" class="mt-1 text-sm font-semibold">
                    {{ ticket.responsible }}
                  </p>
                  <UBadge v-else color="neutral" variant="soft" class="mt-1">
                    Sin asignar
                  </UBadge>
                </div>
              </div>

              <div class="flex items-start gap-3 rounded-lg border bg-card p-4 transition hover:bg-muted/50">
                <div class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
                  <UIcon name="i-lucide-tag" class="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div class="flex-1">
                  <p class="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Categoria
                  </p>
                  <UBadge color="neutral" variant="soft" class="mt-1">
                    {{ getCategoryLabel(ticket.category) }}
                  </UBadge>
                </div>
              </div>

              <div class="flex items-start gap-3 rounded-lg border bg-card p-4 transition hover:bg-muted/50">
                <div class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30">
                  <UIcon name="i-lucide-triangle-alert" class="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                <div class="flex-1">
                  <p class="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Prioridad
                  </p>
                  <UBadge :color="getPriorityColor(ticket.priority)" variant="soft" class="mt-1">
                    {{ getPriorityLabel(ticket.priority) }}
                  </UBadge>
                </div>
              </div>

              <div class="flex items-start gap-3 rounded-lg border bg-card p-4 transition hover:bg-muted/50">
                <div class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                  <UIcon name="i-lucide-check-circle-2" class="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div class="flex-1">
                  <p class="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Estado
                  </p>
                  <UBadge :color="getStatusColor(ticket.status)" variant="soft" class="mt-1">
                    {{ getStatusLabel(ticket.status) }}
                  </UBadge>
                </div>
              </div>

              <div class="flex items-start gap-3 rounded-lg border bg-card p-4 transition hover:bg-muted/50">
                <div class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                  <UIcon name="i-lucide-calendar" class="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div class="flex-1">
                  <p class="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Fechas
                  </p>
                  <p class="mt-1 text-sm font-semibold">
                    Creado: {{ formatDate(ticket.createdAt) }}
                  </p>
                  <p class="mt-0.5 text-xs text-muted-foreground">
                    Actualizado: {{ formatDate(ticket.updatedAt) }}
                  </p>
                </div>
              </div>

              <div class="flex items-start gap-3 rounded-lg border bg-card p-4 transition hover:bg-muted/50">
                <div class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-sky-100 dark:bg-sky-900/30">
                  <UIcon name="i-lucide-gauge" class="h-5 w-5 text-sky-600 dark:text-sky-400" />
                </div>
                <div class="flex-1">
                  <p class="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Impacto
                  </p>
                  <UBadge color="neutral" variant="outline" class="mt-1">
                    {{ impactLabels[ticket.impact] || 'Sin dato' }}
                  </UBadge>
                </div>
              </div>

              <div class="flex items-start gap-3 rounded-lg border bg-card p-4 transition hover:bg-muted/50">
                <div class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-rose-100 dark:bg-rose-900/30">
                  <UIcon name="i-lucide-activity" class="h-5 w-5 text-rose-600 dark:text-rose-400" />
                </div>
                <div class="flex-1">
                  <p class="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Urgencia
                  </p>
                  <UBadge color="neutral" variant="outline" class="mt-1">
                    {{ urgencyLabels[ticket.urgency] || 'Sin dato' }}
                  </UBadge>
                </div>
              </div>
            </div>

            <div class="space-y-3">
              <div class="overflow-hidden rounded-lg border bg-card">
                <div class="flex items-center gap-2 bg-muted/30 px-4 py-3 text-xs font-semibold uppercase text-muted-foreground">
                  <UIcon name="i-lucide-clock-3" class="h-4 w-4" />
                  SLA respuesta
                </div>
                <div class="space-y-3 p-4">
                  <UBadge
                    v-if="responseSla"
                    class="flex w-full items-center justify-center gap-2 py-2 text-center"
                    :class="responseSla.tone"
                  >
                    <UIcon :name="responseSla.icon" class="h-4 w-4" />
                    {{ responseSla.label }}
                  </UBadge>

                  <div class="space-y-2 text-xs">
                    <div class="flex items-center justify-between py-1">
                      <span class="text-muted-foreground">Debe responder</span>
                      <span class="font-medium">{{ formatDate(ticket.slaResponseDueAt) }}</span>
                    </div>
                    <div class="flex items-center justify-between py-1">
                      <span class="text-muted-foreground">Primera respuesta</span>
                      <span class="font-medium" :class="{ 'italic text-muted-foreground/60': !ticket.firstResponseAt }">
                        {{ formatDate(ticket.firstResponseAt) }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="overflow-hidden rounded-lg border bg-card">
                <div class="flex items-center gap-2 bg-muted/30 px-4 py-3 text-xs font-semibold uppercase text-muted-foreground">
                  <UIcon name="i-lucide-check-circle-2" class="h-4 w-4" />
                  SLA solucion
                </div>
                <div class="space-y-3 p-4">
                  <UBadge
                    v-if="resolutionSla"
                    class="flex w-full items-center justify-center gap-2 py-2 text-center"
                    :class="resolutionSla.tone"
                  >
                    <UIcon :name="resolutionSla.icon" class="h-4 w-4" />
                    {{ resolutionSla.label }}
                  </UBadge>

                  <div class="space-y-2 text-xs">
                    <div class="flex items-center justify-between py-1">
                      <span class="text-muted-foreground">Debe resolver</span>
                      <span class="font-medium">{{ formatDate(ticket.slaResolutionDueAt) }}</span>
                    </div>
                    <div class="flex items-center justify-between py-1">
                      <span class="text-muted-foreground">Resuelto</span>
                      <span class="font-medium" :class="{ 'italic text-muted-foreground/60': !ticket.resolvedAt }">
                        {{ formatDate(ticket.resolvedAt) }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="ticket" class="mt-4 rounded-lg border bg-card p-4">
            <div class="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
              <UIcon name="i-lucide-image" class="h-4 w-4" />
              Evidencias
            </div>
            <div v-if="imageUrls.length" class="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3">
              <img
                v-for="(image, index) in imageUrls"
                :key="`${image}-${index}`"
                :src="image"
                alt="Evidencia"
                class="h-28 w-full object-cover"
              >
            </div>
            <p v-else class="mt-3 text-xs text-muted-foreground">
              No hay imagenes registradas.
            </p>
          </div>

        </div>
      </div>
    </template>
  </UModal>

  <RequesterAssetsSheet v-model:open="openRequesterAssets" />
</template>
