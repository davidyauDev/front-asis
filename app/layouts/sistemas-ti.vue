<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

definePageMeta({
  middleware: 'auth',
})

const route = useRoute()
const open = ref(false)

const coreLinks = [{
  label: 'Dashboard TI',
  icon: 'i-lucide-layout-dashboard',
  to: '/sistemas-ti',
  exact: true,
  onSelect: () => { open.value = false },
}, {
  label: 'Tickets',
  icon: 'i-lucide-ticket',
  to: '/sistemas-ti/tickets',
  exact: true,
  onSelect: () => { open.value = false },
}, {
  label: 'Mesa de Ayuda',
  icon: 'i-lucide-headset',
  to: '/sistemas-ti/ticket-desk',
  exact: true,
  onSelect: () => { open.value = false },
}] satisfies NavigationMenuItem[]

const opsLinks = [{
  label: 'Activos TI',
  icon: 'i-lucide-hard-drive',
  to: '/sistemas-ti/assets',
  exact: true,
  onSelect: () => { open.value = false },
}, {
  label: 'Desarrollos',
  icon: 'i-lucide-code-2',
  to: '/sistemas-ti/developments',
  exact: true,
  onSelect: () => { open.value = false },
}, {
  label: 'Control Administrativo',
  icon: 'i-lucide-shield-check',
  to: '/sistemas-ti/admin-control',
  exact: true,
  onSelect: () => { open.value = false },
}] satisfies NavigationMenuItem[]

const systemLinks = [{
  label: 'Accesos',
  icon: 'i-lucide-key-round',
  to: '/sistemas-ti/access',
  exact: true,
  onSelect: () => { open.value = false },
}, {
  label: 'Selector de modulos',
  icon: 'i-lucide-layout-grid',
  to: '/',
  exact: true,
  onSelect: () => { open.value = false },
}] satisfies NavigationMenuItem[]

const links = [coreLinks, opsLinks, systemLinks] satisfies NavigationMenuItem[][]

const groups = computed(() => [{
  id: 'links',
  label: 'Navegacion TI',
  items: links.flat(),
}, {
  id: 'code',
  label: 'Code',
  items: [{
    id: 'source',
    label: 'View page source',
    icon: 'i-simple-icons-github',
    to: `https://github.com/nuxt-ui-templates/dashboard/blob/main/app/pages${route.path === '/' ? '/index' : route.path}.vue`,
    target: '_blank',
  }],
}])
</script>

<template>
  <UDashboardGroup unit="rem">
    <UDashboardSidebar
      id="sistemas-ti"
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
          <UNavigationMenu
            :collapsed="collapsed"
            :items="links[0]"
            orientation="vertical"
            tooltip
            popover
          />

          <UDivider class="my-2" />

          <div v-if="!collapsed" class="mb-1 px-3">
            <p class="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Operaciones TI
            </p>
          </div>
          <UNavigationMenu
            :collapsed="collapsed"
            :items="links[1]"
            orientation="vertical"
            tooltip
            popover
          />

          <UDivider class="my-2" />

          <div v-if="!collapsed" class="mb-1 px-3">
            <p class="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Sistema
            </p>
          </div>
          <UNavigationMenu
            :collapsed="collapsed"
            :items="links[2]"
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
  background: rgb(6 95 70 / 0.1);
  color: rgb(6 95 70);
  box-shadow: inset 0 0 0 1px rgb(6 95 70 / 0.15);
}

.sidebar-nav :deep(a[aria-current='page'] span[class*='i-']),
.sidebar-nav :deep(a[aria-current='page'] .iconify),
.sidebar-nav :deep(a[aria-current='page'] svg),
.sidebar-nav :deep(button[aria-current='page'] span[class*='i-']),
.sidebar-nav :deep(button[aria-current='page'] .iconify),
.sidebar-nav :deep(button[aria-current='page'] svg) {
  color: rgb(6 95 70);
  stroke: currentColor;
}

:global(.dark) .sidebar-nav :deep(a[aria-current='page']),
:global(.dark) .sidebar-nav :deep(button[aria-current='page']) {
  background: rgb(20 184 166 / 0.2);
  color: rgb(204 251 241);
  box-shadow: inset 0 0 0 1px rgb(45 212 191 / 0.25);
}

:global(.dark) .sidebar-nav :deep(a[aria-current='page'] span[class*='i-']),
:global(.dark) .sidebar-nav :deep(a[aria-current='page'] .iconify),
:global(.dark) .sidebar-nav :deep(a[aria-current='page'] svg),
:global(.dark) .sidebar-nav :deep(button[aria-current='page'] span[class*='i-']),
:global(.dark) .sidebar-nav :deep(button[aria-current='page'] .iconify),
:global(.dark) .sidebar-nav :deep(button[aria-current='page'] svg) {
  color: rgb(204 251 241);
}

.sidebar-nav :deep(span[class*='i-']),
.sidebar-nav :deep(.iconify),
.sidebar-nav :deep(svg) {
  width: 1.1rem;
  height: 1.1rem;
}
</style>
