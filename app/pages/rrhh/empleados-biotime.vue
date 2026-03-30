<template>
  <UDashboardPanel id="empleados-biotime">
    <template #header>
      <AppDashboardHeader
        title="Empleados BioTime"
        mobile-title="BioTime"
        subtitle-icon="i-lucide-users"
        notification-tooltip="Empleados pendientes"
      />
    </template>

    <template #body>
      <PersonnelEmployeesAdmin />
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import PersonnelEmployeesAdmin from '~/components/biotime/PersonnelEmployeesAdmin.vue'

definePageMeta({ middleware: 'auth' })
</script>
