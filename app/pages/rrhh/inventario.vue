<template>
  <UDashboardPanel id="inventario">
    <template #header>
      <AppDashboardHeader
        title="Inventario"
        mobile-title="Inventario"
        subtitle-icon="i-lucide-boxes"
        notification-attention
        notification-tooltip="Alertas de inventario"
        @notification-click="openRrhhNotifications"
      />
    </template>

    <template #body>
      <NuxtPage />
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

useHead({
  title: 'RRHH - Inventario',
})

const { openNotifications: openRrhhNotifications } = useRrhhNotificationsPanel()
</script>
