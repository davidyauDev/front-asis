<script setup lang="ts">
import {
  assignSystemTicket,
  listDeskTechnicians,
  type SystemTicket,
} from '~/services/sistemas-ti/tickets'

const ticket = defineModel<SystemTicket | null>('ticket', { default: null })
const open = defineModel<boolean>('open', { default: false })

const emit = defineEmits<{
  (e: 'saved'): void
}>()

const saving = ref(false)
const responsible = ref('')

const technicianItems = computed(() => {
  return listDeskTechnicians().map(item => ({
    label: item,
    value: item,
  }))
})

const placeholder = computed(() => {
  if (ticket.value?.responsible) {
    return ticket.value.responsible
  }

  return 'Selecciona un responsable'
})

const disabled = computed(() => {
  if (!ticket.value) {
    return true
  }

  if (saving.value) {
    return true
  }

  if (!responsible.value) {
    return true
  }

  return responsible.value === (ticket.value.responsible ?? '')
})

watch(
  () => [open.value, ticket.value?.responsible] as const,
  ([isOpen, currentResponsible]) => {
    if (!isOpen) {
      return
    }

    responsible.value = currentResponsible || ''
  },
  { immediate: true },
)

const save = async () => {
  if (disabled.value || !ticket.value) {
    return
  }

  saving.value = true
  try {
    await assignSystemTicket(ticket.value.id, responsible.value || null)
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
      <div class="mx-auto w-full max-h-screen sm:max-w-lg overflow-y-auto rounded-xl border border-border bg-background">
        <div class="space-y-3 border-b px-6 pb-4 pt-5">
          <div class="flex items-center gap-3">
            <div class="rounded-lg bg-amber-500/10 p-2">
              <UIcon name="i-lucide-zap" class="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h2 class="text-xl font-semibold">
                Reasignar Ticket
              </h2>
              <p class="mt-1 text-sm text-muted-foreground">
                <span class="font-medium text-foreground">{{ ticket?.code || 'Sin ticket' }}</span>
                - Selecciona un nuevo responsable
              </p>
            </div>
          </div>
        </div>

        <div class="space-y-5 px-6 py-6">
          <div
            v-if="ticket?.responsible"
            class="rounded-lg border border-border bg-muted/50 p-4"
          >
            <p class="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <UIcon name="i-lucide-user-check" class="h-4 w-4" />
              Responsable actual
            </p>
            <p class="text-sm font-medium">
              {{ ticket.responsible }}
            </p>
          </div>

          <div class="space-y-2">
            <p class="text-sm font-semibold">
              Nuevo responsable
            </p>
            <USelect v-model="responsible" :items="technicianItems" :placeholder="placeholder" />
          </div>
        </div>

        <div class="flex flex-col gap-3 border-t px-6 pb-5 pt-6 sm:flex-row sm:justify-end">
          <UButton color="neutral" variant="outline" :disabled="saving" class="flex-1 sm:flex-none" @click="open = false">
            Cancelar
          </UButton>
          <UButton color="primary" :loading="saving" :disabled="disabled" class="flex-1 gap-2 shadow-md transition-all hover:shadow-lg sm:flex-none" @click="save">
            {{ saving ? 'Asignando...' : 'Asignar ticket' }}
          </UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>
