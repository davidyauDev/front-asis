<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

// Verificar autenticación
const { isLoggedIn } = useAuth()
const { user } = useAuth()
const route = useRoute()
const { isOpen: rrhhNotificationsOpen } = useRrhhNotificationsPanel()

// Proteger el layout - redirigir a login si no está autenticado
definePageMeta({
  middleware: 'auth'
})

const open = ref(false)

watch(
  () => route.path,
  (path) => {
    if (!path.startsWith('/rrhh')) {
      rrhhNotificationsOpen.value = false
    }
  },
  { immediate: true }
)

// Dashboard
const dashboardLinks = [{
  label: 'Asistencias',
  icon: 'i-lucide-clipboard-check',
  to: '/rrhh',
  onSelect: () => { open.value = false }
}]

// Gestión
const managementLinks = [{
  label: 'Seguimiento',
  icon: 'i-lucide-map-pin',
  to: '/rrhh/seguimiento',
  onSelect: () => { open.value = false }
}, {
  label: 'Usuarios',
  icon: 'i-lucide-users',
  to: '/rrhh/users',
  exact: true,
  onSelect: () => { open.value = false }
}, {
  label: 'Empleados BioTime',
  icon: 'i-lucide-fingerprint',
  to: '/rrhh/empleados-biotime',
  exact: true,
  onSelect: () => { open.value = false }
}, {
  label: 'Rutas GPS',
  icon: 'i-lucide-route',
  to: '/rrhh/rutas',
  onSelect: () => { open.value = false }
}]

// Reportes
const reportLinks = [{
  label: 'Incidencias',
  icon: 'i-lucide-alert-triangle',
  to: '/rrhh/incidencias',
  onSelect: () => { open.value = false }
}, {
  label: 'Movilidad',
  icon: 'i-lucide-car',
  children: [{
    label: 'Reporte',
    icon: 'i-lucide-file-text',
    to: '/rrhh/movility-report',
    exact: true,
    onSelect: () => { open.value = false }
  }, {
    label: 'Monto Técnicos',
    icon: 'i-lucide-hand-coins',
    to: '/rrhh/movility-report/settings/monto-tecnicos',
    exact: true,
    onSelect: () => { open.value = false }
  }]
}, {
  label: 'Eventos',
  icon: 'i-lucide-calendar-days',
  to: '/rrhh/eventos',
  onSelect: () => { open.value = false }
}]

// Sistema
const systemLinks = [{
  label: 'Configuración',
  icon: 'i-lucide-settings',
  to: '/rrhh/settings',
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

        <div class="sidebar-nav mt-3 space-y-3">
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
          <p class="text-[11px] font-semibold tracking-wide uppercase text-gray-500 dark:text-gray-400">Gestión</p>
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
          <p class="text-[11px] font-semibold tracking-wide uppercase text-gray-500 dark:text-gray-400">Reportes</p>
        </div>
        <UNavigationMenu
          :collapsed="collapsed"
          :items="links[2]"
          orientation="vertical"
          tooltip
          popover
        />

        <UDivider class="my-2" />

        <div v-if="!collapsed" class="px-3 mb-1">
          <p class="text-[11px] font-semibold tracking-wide uppercase text-gray-500 dark:text-gray-400">Sistema</p>
        </div>
        <!-- Sistema -->
        <UNavigationMenu
          :collapsed="collapsed"
          :items="links[3]"
          orientation="vertical"
          tooltip
          popover
          class="mt-auto"
        />
        </div>
      </template>

      <template #footer="{ collapsed }">
        <UserMenu :collapsed="collapsed" />
      </template>
    </UDashboardSidebar>

    <UDashboardSearch :groups="groups" />

    <slot />

    <RrhhNotificationsModal
      v-if="route.path.startsWith('/rrhh')"
      v-model:open="rrhhNotificationsOpen"
      :user-name="user?.name"
    />
  </UDashboardGroup>
</template>

<style scoped>
.sidebar-nav :deep(a),
.sidebar-nav :deep(button[role='menuitem']),
.sidebar-nav :deep(button[role='menuitemcheckbox']),
.sidebar-nav :deep(button[role='menuitemradio']) {
  font-size: 0.95rem;
  line-height: 1.25rem;
}

.sidebar-nav :deep(a),
.sidebar-nav :deep(button) {
  border-radius: 0.9rem;
  padding: 0.65rem 0.85rem;
}

.sidebar-nav :deep(a[aria-current='page']),
.sidebar-nav :deep(button[aria-current='page']) {
  background: rgb(45 95 192 / 0.1);
  color: rgb(45 95 192);
  box-shadow: inset 0 0 0 1px rgb(45 95 192 / 0.15);
}

.sidebar-nav :deep(a[aria-current='page'] span[class*='i-']),
.sidebar-nav :deep(a[aria-current='page'] .iconify),
.sidebar-nav :deep(a[aria-current='page'] svg),
.sidebar-nav :deep(button[aria-current='page'] span[class*='i-']),
.sidebar-nav :deep(button[aria-current='page'] .iconify),
.sidebar-nav :deep(button[aria-current='page'] svg) {
  color: rgb(45 95 192);
  stroke: currentColor;
}

:global(.dark) .sidebar-nav :deep(a[aria-current='page']),
:global(.dark) .sidebar-nav :deep(button[aria-current='page']) {
  background: rgb(45 95 192 / 0.18);
  color: rgb(201 217 255);
  box-shadow: inset 0 0 0 1px rgb(111 143 218 / 0.22);
}

:global(.dark) .sidebar-nav :deep(a[aria-current='page'] span[class*='i-']),
:global(.dark) .sidebar-nav :deep(a[aria-current='page'] .iconify),
:global(.dark) .sidebar-nav :deep(a[aria-current='page'] svg),
:global(.dark) .sidebar-nav :deep(button[aria-current='page'] span[class*='i-']),
:global(.dark) .sidebar-nav :deep(button[aria-current='page'] .iconify),
:global(.dark) .sidebar-nav :deep(button[aria-current='page'] svg) {
  color: rgb(201 217 255);
}

.sidebar-nav :deep(span[class*='i-']),
.sidebar-nav :deep(.iconify),
.sidebar-nav :deep(svg) {
  width: 1.1rem;
  height: 1.1rem;
}
</style>

