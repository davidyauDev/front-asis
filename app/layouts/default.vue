<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

// Verificar autenticación
const { isLoggedIn } = useAuth()
const { user } = useAuth()
const route = useRoute()
const { isOpen: rrhhNotificationsOpen, closeNotifications: closeRrhhNotifications } = useRrhhNotificationsPanel()

// Proteger el layout - redirigir a login si no está autenticado
definePageMeta({
  middleware: 'auth'
})

const open = ref(false)

watch(
  () => route.fullPath,
  () => {
    closeRrhhNotifications()
  },
  { immediate: true }
)

// Dashboard
const dashboardLinks = [{
  label: 'Asistencias',
  icon: 'i-lucide-clipboard-check',
  to: '/rrhh',
  exact: true,
  onSelect: () => { open.value = false }
}]

// Gestión
const managementLinks = [{
  label: 'Seguimiento',
  icon: 'i-lucide-hard-hat',
  to: '/rrhh/seguimiento',
  exact: true,
  onSelect: () => { open.value = false }
}, {
  label: 'Usuarios',
  icon: 'i-lucide-users',
  to: '/rrhh/users',
  exact: true,
  onSelect: () => { open.value = false }
}, {
  label: 'BioTime',
  icon: 'i-lucide-fingerprint',
  to: '/rrhh/empleados-biotime',
  exact: true,
  onSelect: () => { open.value = false }
}]

// Inventario
const inventoryLinks = [{
  label: 'Inventario',
  icon: 'i-lucide-boxes',
  defaultOpen: false,
  children: [{
    label: 'Gestion de Inventario',
    icon: 'i-lucide-clipboard-list',
    to: '/rrhh/inventario/gestion',
    exact: true,
    onSelect: () => { open.value = false }
  }, {
    label: 'Solicitar Reabastecimiento',
    icon: 'i-lucide-package-plus',
    to: '/rrhh/inventario/solicitar-reabastecimiento',
    exact: true,
    onSelect: () => { open.value = false }
  }]
}]

// Solicitudes
const requestsLinks = [{
  label: 'Solicitudes',
  icon: 'i-lucide-list-checks',
  defaultOpen: false,
  children: [{
    label: 'Mixta',
    icon: 'i-lucide-layers-3',
    to: '/rrhh/inventario/solicitudes',
    exact: true,
    onSelect: () => { open.value = false }
  }, {
    label: 'Compra',
    icon: 'i-lucide-shopping-bag',
    to: '/rrhh/inventario/solicitudes-compra',
    exact: true,
    onSelect: () => { open.value = false }
  }]
}]

// Reportes
const reportLinks = [{
  label: 'Incidencias',
  icon: 'i-lucide-alert-triangle',
  to: '/rrhh/incidencias',
  exact: true,
  onSelect: () => { open.value = false }
}, {
  label: 'Tardanzas',
  icon: 'i-lucide-clock-3',
  to: '/rrhh/tardanzas',
  exact: true,
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
  exact: true,
  onSelect: () => { open.value = false }
}]

// Sistema
const systemLinks = [{
  label: 'Configuración',
  icon: 'i-lucide-settings',
  to: '/rrhh/settings',
  onSelect: () => { open.value = false }
}]

const links = [dashboardLinks, managementLinks, inventoryLinks, requestsLinks, reportLinks, systemLinks] satisfies NavigationMenuItem[][]

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
      class="sidebar-shell"
      :ui="{ body: 'px-3 py-3', footer: 'border-t border-gray-200/80 px-3 py-2 dark:border-gray-800' }"
    >
      <template #header="{ collapsed }">
        <div class="sidebar-header">
          <TeamsMenu :collapsed="collapsed" />
        </div>
      </template>
      <template #default="{ collapsed }">


        <div :class="['sidebar-nav', collapsed ? 'mt-1 sidebar-nav--collapsed space-y-2' : 'mt-2 space-y-2']">
        <UNavigationMenu
          :collapsed="collapsed"
          :items="links[0]"
          orientation="vertical"
          tooltip
          popover
        />

        <!-- Gestión -->
        <!-- <div v-if="!collapsed" class="sidebar-section-title">Gestión</div> -->
        <UNavigationMenu
          :collapsed="collapsed"
          :items="links[1]"
          orientation="vertical"
          tooltip
          popover
        />

        <!-- Inventario -->
        <div v-if="!collapsed" class="sidebar-section-title">Inventario</div>
        <UNavigationMenu
          :collapsed="collapsed"
          :items="links[2]"
          orientation="vertical"
          tooltip
          popover
        />

        <!-- Solicitudes -->
        <div v-if="!collapsed" class="sidebar-section-title">Solicitudes</div>
        <UNavigationMenu
          :collapsed="collapsed"
          :items="links[3]"
          orientation="vertical"
          tooltip
          popover
        />

        <!-- Reportes -->
        <!-- <div v-if="!collapsed" class="sidebar-section-title">Reportes</div> -->
        <UNavigationMenu
          :collapsed="collapsed"
          :items="links[4]"
          orientation="vertical"
          tooltip
          popover
        />

        <div v-if="!collapsed" class="sidebar-section-title">Sistema</div>
        <!-- Sistema -->
        <UNavigationMenu
          :collapsed="collapsed"
          :items="links[5]"
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
.sidebar-shell {
  margin: 0.75rem;
  border: 1px solid rgb(233 236 241);
  border-radius: 1rem;
  background: #eceef2;
  box-shadow: 0 1px 2px rgb(15 23 42 / 0.06);
  overflow: hidden;
}

.sidebar-header {
  border-bottom: 1px solid rgb(221 226 232);
  padding: 0.2rem 0.15rem;
}

.sidebar-section-title {
  margin-top: 0.3rem;
  margin-bottom: 0.15rem;
  padding: 0 0.75rem;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgb(107 114 128);
}

.sidebar-nav :deep(a),
.sidebar-nav :deep(button[role='menuitem']),
.sidebar-nav :deep(button[role='menuitemcheckbox']),
.sidebar-nav :deep(button[role='menuitemradio']) {
  font-size: 0.92rem;
  line-height: 1.2rem;
}

.sidebar-nav :deep(a),
.sidebar-nav :deep(button) {
  border-radius: 0.75rem;
  border: 1px solid transparent;
  padding: 0.62rem 0.82rem;
  transition: background-color 160ms ease, color 160ms ease, border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease;
}

.sidebar-nav :deep(a:hover),
.sidebar-nav :deep(button:hover) {
  background: rgb(255 255 255 / 0.98);
  color: rgb(17 24 39);
  border-color: rgb(212 219 230);
  box-shadow: 0 2px 8px rgb(15 23 42 / 0.08);
  transform: translateX(1px);
}

.sidebar-nav :deep(a[data-state='open']:not([aria-current='page'])),
.sidebar-nav :deep(button[data-state='open']:not([aria-current='page'])) {
  background: transparent;
  color: rgb(55 65 81);
  border-color: transparent;
  box-shadow: none;
  transform: none;
}

.sidebar-nav :deep(a[aria-current='page']),
.sidebar-nav :deep(button[aria-current='page']) {
  background: rgb(255 255 255);
  color: rgb(17 24 39);
  border-color: rgb(191 203 222);
  box-shadow: 0 2px 8px rgb(15 23 42 / 0.08);
  font-weight: 600;
}

.sidebar-nav :deep(a[aria-current='page'] span[class*='i-']),
.sidebar-nav :deep(a[aria-current='page'] .iconify),
.sidebar-nav :deep(a[aria-current='page'] svg),
.sidebar-nav :deep(button[aria-current='page'] span[class*='i-']),
.sidebar-nav :deep(button[aria-current='page'] .iconify),
.sidebar-nav :deep(button[aria-current='page'] svg) {
  color: rgb(75 85 99);
  stroke: currentColor;
}

:global(.dark) .sidebar-nav :deep(a[aria-current='page']),
:global(.dark) .sidebar-nav :deep(button[aria-current='page']) {
  background: rgb(31 41 55 / 0.96);
  color: rgb(243 244 246);
  border-color: rgb(100 112 130);
  box-shadow: 0 2px 8px rgb(0 0 0 / 0.28);
  font-weight: 600;
}

:global(.dark) .sidebar-nav :deep(a:hover),
:global(.dark) .sidebar-nav :deep(button:hover) {
  background: rgb(31 41 55 / 0.92);
  color: rgb(243 244 246);
  border-color: rgb(96 109 128);
  box-shadow: 0 2px 8px rgb(0 0 0 / 0.22);
  transform: translateX(1px);
}

:global(.dark) .sidebar-nav :deep(a[data-state='open']:not([aria-current='page'])),
:global(.dark) .sidebar-nav :deep(button[data-state='open']:not([aria-current='page'])) {
  background: transparent;
  color: rgb(209 213 219);
  border-color: transparent;
  box-shadow: none;
  transform: none;
}

:global(.dark) .sidebar-nav :deep(a[aria-current='page'] span[class*='i-']),
:global(.dark) .sidebar-nav :deep(a[aria-current='page'] .iconify),
:global(.dark) .sidebar-nav :deep(a[aria-current='page'] svg),
:global(.dark) .sidebar-nav :deep(button[aria-current='page'] span[class*='i-']),
:global(.dark) .sidebar-nav :deep(button[aria-current='page'] .iconify),
:global(.dark) .sidebar-nav :deep(button[aria-current='page'] svg) {
  color: rgb(229 231 235);
}

.sidebar-nav :deep(span[class*='i-']),
.sidebar-nav :deep(.iconify),
.sidebar-nav :deep(svg) {
  width: 1rem;
  height: 1rem;
}

.sidebar-nav--collapsed :deep(a),
.sidebar-nav--collapsed :deep(button[role='menuitem']),
.sidebar-nav--collapsed :deep(button[role='menuitemcheckbox']),
.sidebar-nav--collapsed :deep(button[role='menuitemradio']) {
  width: 2.25rem;
  height: 2.25rem;
  min-height: 2.25rem;
  padding: 0;
  margin-inline: auto;
  justify-content: center;
  border-radius: 0.7rem;
}
</style>


