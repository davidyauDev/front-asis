<script setup lang="ts">
import DevelopmentKanbanBoard from '~/components/rrhh/desarrollo/DevelopmentKanbanBoard.vue'

definePageMeta({ middleware: 'auth' })

useHead({
  title: 'RRHH - Desarrollo',
})

const { openNotifications: openRrhhNotifications } = useRrhhNotificationsPanel()
</script>

<template>
  <UDashboardPanel id="desarrollo">
    <template #header>
      <AppDashboardHeader
        title="Desarrollo"
        mobile-title="Desarrollo"
        subtitle-icon="i-lucide-git-branch"
          notification-tooltip="Alertas de desarrollo"
        notification-attention
        @notification-click="openRrhhNotifications"
      />
    </template>

    <template #body>
      <div class="w-full min-h-[calc(100vh-12rem)] bg-white px-4 pb-4 pt-4 text-slate-900">
        <DevelopmentKanbanBoard />
      </div>
    </template>
  </UDashboardPanel>
</template>
