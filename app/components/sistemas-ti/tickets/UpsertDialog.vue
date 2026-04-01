<script setup lang="ts">
import TicketUpsertDialogForm from '~/components/sistemas-ti/tickets/matrix/TicketUpsertDialog.vue'
import {
  createSystemTicket,
  systemTicketCategoryOptions,
  systemTicketImpactOptions,
  systemTicketPriorityOptions,
  systemTicketTypeOptions,
  systemTicketUrgencyOptions,
  updateSystemTicket,
  type CreateSystemTicketPayload,
  type SystemTicket,
} from '~/services/sistemas-ti/tickets'

const open = defineModel<boolean>('open', { default: false })
const selected = defineModel<SystemTicket | null>('selected', { default: null })

const emit = defineEmits<{
  (e: 'saved'): void
}>()

const saving = ref(false)

const save = async (payload: CreateSystemTicketPayload) => {
  if (saving.value) {
    return
  }

  saving.value = true
  try {
    if (selected.value) {
      await updateSystemTicket(selected.value.id, {
        title: payload.title,
        description: payload.description,
        requester: payload.requester,
        area: payload.area,
        category: payload.category,
        type: payload.type,
        impact: payload.impact,
        urgency: payload.urgency,
        priority: payload.priority,
      })
    } else {
      await createSystemTicket(payload)
    }

    emit('saved')
    open.value = false
    selected.value = null
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <TicketUpsertDialogForm
    v-model:open="open"
    :ticket="selected"
    :saving="saving"
    :type-options="systemTicketTypeOptions"
    :category-options="systemTicketCategoryOptions"
    :impact-options="systemTicketImpactOptions"
    :urgency-options="systemTicketUrgencyOptions"
    :priority-options="systemTicketPriorityOptions"
    @save="save"
  />
</template>
