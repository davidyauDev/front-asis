<template>
  <UDashboardPanel id="vacations">
    <template #header>
      <AppDashboardHeader
        title="Reporte de Movilidad"
        mobile-title="Movilidad"
        subtitle-icon="i-heroicons-map"
        notification-tooltip="Vehículos con alertas"
        :notification-count="2"
      />
    </template>

    <template #body>
      <div class="p-2">
        <NuxtPage />
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
</script>
