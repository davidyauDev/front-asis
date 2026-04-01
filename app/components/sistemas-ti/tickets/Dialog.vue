<script setup lang="ts">
import UpsertDialog from '~/components/sistemas-ti/tickets/UpsertDialog.vue'
import type { SystemTicket } from '~/services/sistemas-ti/tickets'

const open = defineModel<boolean>('open', { default: false })
const ticket = defineModel<SystemTicket | null>('ticket', { default: null })

const emit = defineEmits<{
  (e: 'saved'): void
}>()
</script>

<template>
  <UpsertDialog
    v-model:open="open"
    v-model:selected="ticket"
    @saved="emit('saved')"
  />
</template>
