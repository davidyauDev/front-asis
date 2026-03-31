<script setup lang="ts">
defineProps<{
  panelId: string
  title: string
  subtitle: string
  badge?: string
  icon?: string
  subtitleIcon?: string
  showIcon?: boolean
  showNotifications?: boolean
  notificationCount?: number | string | null
  notificationShortcuts?: string[]
}>()
</script>

<template>
  <UDashboardPanel :id="panelId">
    <template #header>
      <AppDashboardHeader
        :title="title"
        :mobile-title="title"
        :subtitle="subtitle"
        :subtitle-icon="subtitleIcon || 'i-lucide-info'"
        :icon="showIcon === false ? undefined : (icon || 'i-lucide-lifebuoy')"
        :show-notifications="showNotifications ?? false"
        :show-user-name="false"
        :show-live-badge="false"
        :notification-count="notificationCount"
        :notification-shortcuts="notificationShortcuts"
        tone="neutral"
      >
        <template v-if="badge" #right>
          <UBadge color="primary" variant="soft">
            {{ badge }}
          </UBadge>
        </template>
      </AppDashboardHeader>
    </template>

    <template #body>
      <div class="support-shell space-y-6 p-4 sm:p-6 lg:p-8">
        <slot />
      </div>
    </template>
  </UDashboardPanel>
</template>
