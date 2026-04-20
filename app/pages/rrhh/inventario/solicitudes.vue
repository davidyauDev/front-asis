<script setup lang="ts">
import AppTabs, { type AppTabItem } from '~/components/AppTabs.vue'

definePageMeta({ middleware: 'auth' })

useHead({
  title: 'RRHH - Solicitudes',
})

const route = useRoute()
const router = useRouter()

const tabItems = computed<AppTabItem[]>(() => [
  { label: 'MIXTA', value: 'mixta' },
  { label: 'COMPRA', value: 'compra' },
])

const visibleTabItems = computed<AppTabItem[]>(() => {
  return tabItems.value.filter((tab) => tab.value === activeTab.value)
})

const activeTab = computed<'mixta' | 'compra'>({
  get: () => route.path.endsWith('/compra') ? 'compra' : 'mixta',
  set: (tab) => {
    const target = tab === 'compra'
      ? '/rrhh/inventario/solicitudes/compra'
      : '/rrhh/inventario/solicitudes'

    if (route.path !== target) {
      void router.push(target)
    }
  },
})
</script>

<template>
  <div class="space-y-5">
    <UCard
      class="overflow-hidden border-gray-200/70 bg-white/85 shadow-sm dark:border-gray-800/70 dark:bg-gray-950/85"
      :ui="{ body: 'p-0' }"
    >
      <div class="space-y-5">
        <div class="px-5">
          <AppTabs
            v-model="activeTab"
            :ariaLabel="'Solicitudes de inventario'"
            :items="visibleTabItems"
          />
        </div>

        <div class="pb-5">
          <NuxtPage />
        </div>
      </div>
    </UCard>
  </div>
</template>
