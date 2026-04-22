<template>
  <UDashboardPanel id="empleados-biotime">
    <template #header>
      <AppDashboardHeader
        title="Usuarios BioTime"
        mobile-title="BioTime"
        subtitle-icon="i-lucide-users"
        notification-tooltip="Empleados pendientes"
        notification-attention
        @notification-click="openRrhhNotifications"
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

const { openNotifications: openRrhhNotifications } = useRrhhNotificationsPanel()
</script>
