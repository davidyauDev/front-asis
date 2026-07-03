<script setup lang="ts">
import TicketsKanbanBoard from '~/components/rrhh/tickets/TicketsKanbanBoard.vue'

definePageMeta({ middleware: 'auth' })

useHead({
  title: 'RRHH - Tickets',
})
</script>

<template>
  <UDashboardPanel id="tickets">
    <template #header>
      <AppDashboardHeader
        title="Tickets"
        mobile-title="Tickets"
        subtitle-icon="i-lucide-ticket"
      />
    </template>

    <template #body>
      <div class="min-h-[calc(100vh-12rem)] bg-white px-4 pb-4 pt-4 text-slate-900">
        <TicketsKanbanBoard />
      </div>
    </template>
  </UDashboardPanel>
</template>
