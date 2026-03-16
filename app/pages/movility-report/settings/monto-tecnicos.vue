<template>
  <UDashboardPanel id="mobility-settings">
    <template #header>
      <UDashboardNavbar title="Movilidad · Settings">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UButton
            color="neutral"
            variant="outline"
            icon="i-heroicons-arrow-left"
            to="/movility-report"
          >
            Volver al reporte
          </UButton>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="p-2">
        <UPageCard
          title="Monto Técnicos"
          description="Administra los montos de movilidad por técnico."
          variant="naked"
          class="mb-3"
        />

        <UPageCard variant="subtle" :ui="{ body: 'p-4' }">
          <EmployeeMobilityAdmin />
        </UPageCard>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import EmployeeMobilityAdmin from '~/components/movility-report/EmployeeMobilityAdmin.vue'

definePageMeta({ middleware: 'auth' })
</script>

