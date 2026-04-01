<script setup lang="ts">
import type { SystemTicket } from '~/services/sistemas-ti/tickets'

defineProps<{
  ticket: SystemTicket
}>()
</script>

<template>
  <div class="space-y-1">
    <p class="font-mono text-xs font-semibold text-primary">
      {{ ticket.code }}
    </p>
    <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">
      {{ ticket.title }}
    </p>
    <p class="line-clamp-2 text-xs text-gray-500 dark:text-gray-400">
      {{ ticket.description }}
    </p>
  </div>
</template>
