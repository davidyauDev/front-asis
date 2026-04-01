<script setup lang="ts">
import SLAHelperInfo from '~/components/sistemas-ti/tickets/SLAHelperInfo.vue'
import Table from '~/components/sistemas-ti/tickets/Table.vue'
import UpsertDialog from '~/components/sistemas-ti/tickets/UpsertDialog.vue'
import { listSystemTickets, type SystemTicket } from '~/services/sistemas-ti/tickets'

definePageMeta({
  layout: 'sistemas-ti',
  middleware: 'auth',
})

useHead({
  title: 'Sistemas TI - Tickets',
})

const open = ref(false)
const selectedTicket = ref<SystemTicket | null>(null)
const tickets = ref<SystemTicket[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const loadTickets = async () => {
  loading.value = true
  error.value = null
  try {
    tickets.value = await listSystemTickets()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'No se pudo cargar la matriz de tickets.'
  } finally {
    loading.value = false
  }
}

const handleOpenCreate = () => {
  selectedTicket.value = null
  open.value = true
}

const handleOpenEdit = (ticket: SystemTicket) => {
  selectedTicket.value = ticket
  open.value = true
}

onMounted(async () => {
  await loadTickets()
})
</script>

<template>
  <UDashboardPanel id="sistemas-ti-tickets">
    <template #header>
      <AppDashboardHeader
        title="Matriz de Tickets"
        mobile-title="Tickets"
        subtitle="Seguimiento centralizado de solicitudes, incidencias y tareas"
        subtitle-icon="i-lucide-ticket"
        icon="i-lucide-ticket"
      >
        <template #right>
          <SLAHelperInfo />
          <UButton color="primary" icon="i-lucide-plus" @click="handleOpenCreate">
            Nuevo Ticket
          </UButton>
        </template>
      </AppDashboardHeader>
    </template>

    <template #body>
      <div class="space-y-4 p-6">
        <UAlert
          v-if="error"
          color="error"
          variant="soft"
          icon="i-lucide-alert-triangle"
          title="No se pudo cargar la matriz"
          :description="error"
        />

        <Table
          :tickets="tickets"
          :loading="loading"
          @update:ticket="handleOpenEdit"
          @changed="loadTickets"
        />
      </div>
    </template>
  </UDashboardPanel>

  <UpsertDialog
    v-model:open="open"
    v-model:selected="selectedTicket"
    @saved="loadTickets"
  />
</template>
