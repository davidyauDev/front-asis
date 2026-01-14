<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

// Verificar autenticación
const { isLoggedIn } = useAuth()

// Proteger el layout - redirigir a login si no está autenticado
definePageMeta({
  middleware: 'auth'
})

const route = useRoute()
const toast = useToast()

const open = ref(false)

// Dashboard
const dashboardLinks = [{
  label: 'Dashboard',
  icon: 'i-heroicons-home',
  to: '/',
  onSelect: () => { open.value = false }
}]

// Gestión
const managementLinks = [{
  label: 'Seguimiento',
  icon: 'i-heroicons-map-pin',
  to: '/seguimiento',
  onSelect: () => { open.value = false }
}, {
  label: 'Usuarios',
  icon: 'i-heroicons-user-group',
  to: '/users',
  onSelect: () => { open.value = false }
}, {
  label: 'Rutas GPS',
  icon: 'i-heroicons-map',
  to: '/rutas',
  onSelect: () => { open.value = false }
}]

// Reportes
const reportLinks = [{
  label: 'Incidencias',
  icon: 'i-heroicons-exclamation-triangle',
  to: '/incidencias',
  onSelect: () => { open.value = false }
}, {
  label: 'Movilidad',
  icon: 'i-heroicons-currency-dollar',
  to: '/movility-report',
  onSelect: () => { open.value = false }
}, {
  label: 'Eventos',
  icon: 'i-heroicons-calendar',
  to: '/eventos',
  onSelect: () => { open.value = false }
}]

// Sistema
const systemLinks = [{
  label: 'Configuración',
  icon: 'i-heroicons-cog-6-tooth',
  to: '/settings',
  onSelect: () => { open.value = false }
}]

const links = [dashboardLinks, managementLinks, reportLinks, systemLinks] satisfies NavigationMenuItem[][]

const groups = computed(() => [{
  id: 'links',
  label: 'Go to',
  items: links.flat()
}, {
  id: 'code',
  label: 'Code',
  items: [{
    id: 'source',
    label: 'View page source',
    icon: 'i-simple-icons-github',
    to: `https://github.com/nuxt-ui-templates/dashboard/blob/main/app/pages${route.path === '/' ? '/index' : route.path}.vue`,
    target: '_blank'
  }]
}])

onMounted(async () => {
  const cookie = useCookie('cookie-consent')
  if (cookie.value === 'accepted') {
    return
  }
  
})
</script>

<template>
  <UDashboardGroup unit="rem">
    <UDashboardSidebar
      id="default"
      v-model:open="open"
      collapsible
      resizable
      class="bg-elevated/25"
      :ui="{ footer: 'lg:border-t lg:border-default' }"
    >
      <template #header="{ collapsed }">
        <TeamsMenu :collapsed="collapsed" />
      </template>

      <template #default="{ collapsed }">
        <UDashboardSearchButton :collapsed="collapsed" class="bg-transparent ring-default" />

        <!-- Dashboard -->
        <UNavigationMenu
          :collapsed="collapsed"
          :items="links[0]"
          orientation="vertical"
          tooltip
          popover
        />

        <UDivider class="my-2" />

        <!-- Gestión -->
        <div v-if="!collapsed" class="px-3 mb-1">
          <p class="text-xs font-medium text-gray-500">Gestión</p>
        </div>
        <UNavigationMenu
          :collapsed="collapsed"
          :items="links[1]"
          orientation="vertical"
          tooltip
          popover
        />

        <UDivider class="my-2" />

        <!-- Reportes -->
        <div v-if="!collapsed" class="px-3 mb-1">
          <p class="text-xs font-medium text-gray-500">Reportes</p>
        </div>
        <UNavigationMenu
          :collapsed="collapsed"
          :items="links[2]"
          orientation="vertical"
          tooltip
          popover
        />

        <UDivider class="my-2" />

        <!-- Sistema -->
        <UNavigationMenu
          :collapsed="collapsed"
          :items="links[3]"
          orientation="vertical"
          tooltip
          popover
          class="mt-auto"
        />
      </template>

      <template #footer="{ collapsed }">
        <UserMenu :collapsed="collapsed" />
      </template>
    </UDashboardSidebar>

    <UDashboardSearch :groups="groups" />

    <slot />

    <!-- <NotificationsSlideover /> -->
  </UDashboardGroup>
</template>
