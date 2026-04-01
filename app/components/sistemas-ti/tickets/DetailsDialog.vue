<script setup lang="ts">
import TicketDetailsDialog from '~/components/sistemas-ti/tickets/matrix/TicketDetailsDialog.vue'
import {
  systemTicketCategoryLabelMap,
  systemTicketPriorityColorMap,
  systemTicketPriorityLabelMap,
  systemTicketStatusColorMap,
  systemTicketStatusLabelMap,
  systemTicketTypeLabelMap,
  type SystemTicket,
} from '~/services/sistemas-ti/tickets'

const ticket = defineModel<SystemTicket | null>('ticket', { default: null })
const open = defineModel<boolean>('open', { default: false })

const getStatusLabel = (status: keyof typeof systemTicketStatusLabelMap) => systemTicketStatusLabelMap[status]
const getPriorityLabel = (priority: keyof typeof systemTicketPriorityLabelMap) => systemTicketPriorityLabelMap[priority]
const getTypeLabel = (type: keyof typeof systemTicketTypeLabelMap) => systemTicketTypeLabelMap[type]
const getCategoryLabel = (category: keyof typeof systemTicketCategoryLabelMap) => systemTicketCategoryLabelMap[category]
const getStatusColor = (status: keyof typeof systemTicketStatusColorMap) => systemTicketStatusColorMap[status]
const getPriorityColor = (priority: keyof typeof systemTicketPriorityColorMap) => systemTicketPriorityColorMap[priority]
</script>

<template>
  <TicketDetailsDialog
    v-model:open="open"
    :ticket="ticket"
    :get-status-label="getStatusLabel"
    :get-priority-label="getPriorityLabel"
    :get-type-label="getTypeLabel"
    :get-category-label="getCategoryLabel"
    :get-status-color="getStatusColor"
    :get-priority-color="getPriorityColor"
  />
</template>
