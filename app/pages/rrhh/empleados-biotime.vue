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
      <UDashboardToolbar>
        <div class="mt-2 w-full">
          <AppTabs
            v-model="usersTabModel"
            aria-label="Seccion BioTime"
            :items="usersTabItems"
          />
        </div>
      </UDashboardToolbar>
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
const usersTabModel = ref<'users'>('users')
const usersTabItems = [{ label: 'Usuarios', value: 'users' }] as const
</script>
