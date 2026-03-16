<template>
  <div>
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

<script setup lang="ts">
import EmployeeMobilityAdmin from '~/components/movility-report/EmployeeMobilityAdmin.vue'

definePageMeta({ middleware: 'auth' })
</script>
