<script setup lang="ts">
import {
  changeSystemTicketStatus,
  systemTicketStatusColorMap,
  systemTicketStatusLabelMap,
  systemTicketStatusOptions,
  type SystemTicket,
  type SystemTicketStatus,
} from '~/services/sistemas-ti/tickets'

const open = defineModel<boolean>('open', { default: false })

const props = defineProps<{
  ticket: SystemTicket | null
}>()

const emit = defineEmits<{
  (e: 'saved'): void
}>()

const saving = ref(false)
const status = ref<SystemTicketStatus>('OPEN')

const statusHelperMap: Record<SystemTicketStatus, string> = {
  OPEN: 'Ticket creado, pendiente de atención.',
  IN_PROGRESS: 'Atención activa por el equipo TI.',
  ON_HOLD: 'Pausado por espera de usuario/proveedor.',
  RESOLVED: 'Se registró una solución para el ticket.',
  CLOSED: 'Proceso finalizado y ticket cerrado.',
}

const disabled = computed(() => {
  if (!props.ticket) {
    return true
  }

  if (saving.value) {
    return true
  }

  return props.ticket.status === status.value
})

watch(
  () => [open.value, props.ticket?.status] as const,
  ([isOpen, currentStatus]) => {
    if (!isOpen || !currentStatus) {
      return
    }

    status.value = currentStatus
  },
  { immediate: true },
)

const save = async () => {
  if (!props.ticket || disabled.value) {
    return
  }

  saving.value = true
  try {
    await changeSystemTicketStatus(props.ticket.id, status.value)
    emit('saved')
    open.value = false
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <UModal v-model:open="open">
    <template #content>
      <div class="mx-auto w-full max-h-screen sm:max-w-2xl overflow-y-auto rounded-xl border border-border bg-background">
        <div class="space-y-3 px-6 pb-4 pt-5">
          <div class="flex items-center gap-3">
            <div class="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/20">
              <UIcon name="i-lucide-ticket" class="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 class="text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                Cambiar Estado de Ticket
              </h2>
              <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {{ props.ticket?.code || 'Sin ticket' }}
              </p>
            </div>
          </div>
        </div>

        <div class="space-y-6 px-6 py-6">
          <div
            v-if="props.ticket"
            class="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50"
          >
            <p class="text-sm font-medium text-gray-700 dark:text-gray-300">
              Estado actual
            </p>
            <div class="mt-2">
              <UBadge :color="systemTicketStatusColorMap[props.ticket.status]" variant="soft">
                {{ systemTicketStatusLabelMap[props.ticket.status] }}
              </UBadge>
            </div>
          </div>

          <div class="space-y-2">
            <p class="text-base font-semibold text-gray-900 dark:text-gray-100">
              Seleccionar nuevo estado
            </p>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Elige el estado al que deseas cambiar este ticket.
            </p>
            <USelect v-model="status" :items="systemTicketStatusOptions" />
            <p class="text-xs text-gray-500 dark:text-gray-400">
              {{ statusHelperMap[status] }}
            </p>
          </div>
        </div>

        <div class="flex flex-col gap-3 border-t px-6 py-4 sm:flex-row sm:justify-end">
          <UButton color="neutral" variant="outline" :disabled="saving" class="flex-1 sm:flex-initial" @click="open = false">
            Cancelar
          </UButton>
          <UButton color="primary" :disabled="disabled" :loading="saving" class="flex-1 sm:flex-initial" @click="save">
            {{ saving ? 'Cambiando...' : 'Cambiar estado' }}
          </UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>
