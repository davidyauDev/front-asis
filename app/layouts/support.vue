<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

definePageMeta({
  middleware: 'auth',
})

const open = shallowRef(false)

const statisticsLinks = [{
  label: 'Tickets',
  icon: 'i-lucide-ticket',
  to: '/mesa-de-ayuda',
  exact: true,
  onSelect: () => { open.value = false },
}, {
  label: 'Llamadas',
  icon: 'i-lucide-phone-call',
  to: '/mesa-de-ayuda/llamadas',
  onSelect: () => { open.value = false },
}]

const userLinks = [{
  label: 'Usuarios',
  icon: 'i-lucide-users',
  to: '/mesa-de-ayuda/usuarios',
  onSelect: () => { open.value = false },
}]

const ticketLinks = [{
  label: 'Support Ticket',
  icon: 'i-lucide-headphones',
  to: '/mesa-de-ayuda/support-ticket',
  onSelect: () => { open.value = false },
}, {
  label: 'Support Llamadas',
  icon: 'i-lucide-phone-call',
  to: '/mesa-de-ayuda/support-llamadas',
  onSelect: () => { open.value = false },
}, {
  label: 'WhatsApp',
  icon: 'i-simple-icons-whatsapp',
  to: '/mesa-de-ayuda/whatsapp',
  onSelect: () => { open.value = false },
}]

const settingsLinks = [{
  label: 'Settings',
  icon: 'i-lucide-settings',
  to: '/mesa-de-ayuda/settings',
  onSelect: () => { open.value = false },
}, {
  label: 'Modelos',
  icon: 'i-lucide-clipboard-list',
  to: '/mesa-de-ayuda/modelos',
  onSelect: () => { open.value = false },
}]

const groups = [statisticsLinks, userLinks, ticketLinks, settingsLinks] satisfies NavigationMenuItem[][]
</script>

<template>
  <UDashboardGroup unit="rem">
    <UDashboardSidebar
      id="support"
      v-model:open="open"
      collapsible
      resizable
      class="bg-elevated/20"
      :ui="{ footer: 'lg:border-t lg:border-default' }"
    >
      <template #header="{ collapsed }">
        <TeamsMenu :collapsed="collapsed" />
      </template>

      <template #default="{ collapsed }">
        <div class="support-sidebar mt-3 space-y-3">
          <div v-if="!collapsed" class="px-3 pb-1">
            <p class="text-[11px] font-semibold uppercase tracking-[0.3em] text-gray-500 dark:text-gray-400">
              Mesa de ayuda
            </p>
          </div>

          <div v-if="!collapsed" class="px-3">
            <p class="text-[11px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
              ESTADISTICAS
            </p>
          </div>
          <UNavigationMenu
            :collapsed="collapsed"
            :items="groups[0]"
            orientation="vertical"
            tooltip
            popover
          />

          <div v-if="!collapsed" class="px-3">
            <p class="text-[11px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
              USERS
            </p>
          </div>
          <UNavigationMenu
            :collapsed="collapsed"
            :items="groups[1]"
            orientation="vertical"
            tooltip
            popover
          />

          <div v-if="!collapsed" class="px-3">
            <p class="text-[11px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
              TICKETS
            </p>
          </div>
          <UNavigationMenu
            :collapsed="collapsed"
            :items="groups[2]"
            orientation="vertical"
            tooltip
            popover
          />

          <div v-if="!collapsed" class="px-3">
            <p class="text-[11px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
              SETTINGS
            </p>
          </div>
          <UNavigationMenu
            :collapsed="collapsed"
            :items="groups[3]"
            orientation="vertical"
            tooltip
            popover
          />
        </div>
      </template>

      <template #footer="{ collapsed }">
        <UserMenu :collapsed="collapsed" />
      </template>
    </UDashboardSidebar>

    <slot />
  </UDashboardGroup>
</template>

<style scoped>
.support-sidebar :deep(a),
.support-sidebar :deep(button[role='menuitem']),
.support-sidebar :deep(button[role='menuitemcheckbox']),
.support-sidebar :deep(button[role='menuitemradio']) {
  font-size: 0.95rem;
  line-height: 1.25rem;
}

.support-sidebar :deep(a),
.support-sidebar :deep(button) {
  border-radius: 0.9rem;
  padding: 0.65rem 0.85rem;
}

.support-sidebar :deep(a[aria-current='page']),
.support-sidebar :deep(button[aria-current='page']) {
  background: rgb(45 95 192 / 0.1);
  color: rgb(45 95 192);
  box-shadow: inset 0 0 0 1px rgb(45 95 192 / 0.15);
}

.support-sidebar :deep(a[aria-current='page'] span[class*='i-']),
.support-sidebar :deep(a[aria-current='page'] .iconify),
.support-sidebar :deep(a[aria-current='page'] svg),
.support-sidebar :deep(button[aria-current='page'] span[class*='i-']),
.support-sidebar :deep(button[aria-current='page'] .iconify),
.support-sidebar :deep(button[aria-current='page'] svg) {
  color: rgb(45 95 192);
  stroke: currentColor;
}

:global(.dark) .support-sidebar :deep(a[aria-current='page']),
:global(.dark) .support-sidebar :deep(button[aria-current='page']) {
  background: rgb(45 95 192 / 0.18);
  color: rgb(201 217 255);
  box-shadow: inset 0 0 0 1px rgb(111 143 218 / 0.22);
}

:global(.dark) .support-sidebar :deep(a[aria-current='page'] span[class*='i-']),
:global(.dark) .support-sidebar :deep(a[aria-current='page'] .iconify),
:global(.dark) .support-sidebar :deep(a[aria-current='page'] svg),
:global(.dark) .support-sidebar :deep(button[aria-current='page'] span[class*='i-']),
:global(.dark) .support-sidebar :deep(button[aria-current='page'] .iconify),
:global(.dark) .support-sidebar :deep(button[aria-current='page'] svg) {
  color: rgb(201 217 255);
}

.support-sidebar :deep(span[class*='i-']),
.support-sidebar :deep(.iconify),
.support-sidebar :deep(svg) {
  width: 1.1rem;
  height: 1.1rem;
}
</style>
