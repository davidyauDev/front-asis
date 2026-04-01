<script setup lang="ts">
import TicketHistoryDialog from '~/components/sistemas-ti/tickets/matrix/TicketHistoryDialog.vue'
import type { SystemTicket } from '~/services/sistemas-ti/tickets'

const ticket = defineModel<SystemTicket | null>('ticket', { default: null })
const open = defineModel<boolean>('open', { default: false })
</script>

<template>
  <TicketHistoryDialog v-model:open="open" :ticket="ticket" />
</template>
