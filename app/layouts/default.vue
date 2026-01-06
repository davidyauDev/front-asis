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

const links = [[{
  label: 'Inicio',
  icon: 'i-lucide-house',
  to: '/',
  onSelect: () => {
    open.value = false
  }
},
{
  label: 'Seguimiento',
  icon: 'i-lucide-map-pin',
  to: '/seguimiento',
  onSelect: () => {
    open.value = false;
  }
},
{
  label: 'Movilidad',
  icon: 'i-lucide-wallet',
  to: '/movility-report',
  onSelect: () => {
    open.value = false;
  }
}
,
{
  label: 'Incidencias',
  icon: 'i-lucide-clock-alert',
  to: '/incidencias',
  onSelect: () => {
    open.value = false;
  }
}
,

{
  label: 'Usuarios',
  icon: 'i-lucide-users',
  to: '/users',
  onSelect: () => {
    open.value = false
  }
}, {
  label: 'Eventos Especiales',
  icon: 'i-lucide-calendar-heart',
  to: '/eventos',
  onSelect: () => {
    open.value = false
  }
}, {
  label: 'Rutas GPS',
  icon: 'i-lucide-map',
  to: '/rutas',
  onSelect: () => {
    open.value = false
  }
}

, {
  label: 'Settings',
  icon: 'i-lucide-settings',
  to: '/rutas',
  onSelect: () => {
    open.value = false
  }
},



]] satisfies NavigationMenuItem[][]

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

        <UNavigationMenu
          :collapsed="collapsed"
          :items="links[0]"
          orientation="vertical"
          tooltip
          popover
        />

        <UNavigationMenu
          :collapsed="collapsed"
          :items="links[1]"
          orientation="vertical"
          tooltip
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
