<script setup lang="ts">
import TicketDeskModule from '~/components/sistemas-ti/tickets/desk/TicketDeskModule.vue'

definePageMeta({
  layout: 'sistemas-ti',
  middleware: 'auth',
})

useHead({
  title: 'Sistemas TI - Mesa de Ayuda',
})
</script>

<template>
  <UDashboardPanel id="sistemas-ti-ticket-desk">
    <template #header>
      <AppDashboardHeader
        title="Mesa de Ayuda"
        mobile-title="Ticket Desk"
        subtitle="Flujo operativo de usuario, tecnico y supervisor"
        subtitle-icon="i-lucide-headset"
        icon="i-lucide-life-buoy"
      />
    </template>

    <template #body>
      <div class="p-6">
        <TicketDeskModule />
      </div>
    </template>
  </UDashboardPanel>
</template>
