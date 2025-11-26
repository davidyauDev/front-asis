<script setup lang="ts">
import type { UserListItem } from '~/types'

const { data, error, refresh, pending } = await useFetch<{
  data: UserListItem[]
}>('/users/not-checked-in-out-today', {
  key: 'users-not-checked-in-out-today',
  pick: ['data'],
  default: () => ({ data: [] }),
  $fetch: useNuxtApp().$api

})



function formatCurrency(value: number): string {
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  })
}

const stats = computed(() => [
  {
    title: 'Total de Usuarios sin Asistencia',
    icon: 'i-lucide-users',
    value: data.value.data.length,
    variation: 0,
    pending: pending.value,
    refresh: refresh,
    error: error.value
  },
  {
    title: 'Conversions',
    icon: 'i-lucide-chart-pie',
    value: 1,
    variation: 0
  },
  {
    title: 'Revenue',
    icon: 'i-lucide-circle-dollar-sign',
    value: formatCurrency(1),
    variation: 0
  },
  {
    title: 'Orders',
    icon: 'i-lucide-shopping-cart',
    value: 1,
    variation: 0
  }
])
</script>

<template>
  <UPageGrid class="lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-px">
    <!-- to="/customers" -->
    <UPageCard v-for="(stat, index) in stats" :key="index" :icon="stat.icon" :title="stat.title" variant="subtle" :ui="{
      container: 'gap-y-1.5',
      wrapper: 'items-start',
      leading: 'p-2.5 rounded-full bg-primary/10 ring ring-inset ring-primary/25 flex-col',
      title: 'font-normal text-muted text-xs uppercase'
    }" class="lg:rounded-none first:rounded-l-lg last:rounded-r-lg hover:z-1">

      <USkeleton v-if="stat.pending" class="h-8 w-20" />
      <div v-else-if="stat.error" class="text-sm text-red-600 flex items-center">
        Error al cargar
        <UButton size="sm" variant="link" class="text-red-600" @click="stat.refresh()" icon="i-lucide-refresh-cw" />
      </div>
      <div v-else class="flex items-center gap-2">
        <span class="text-2xl font-semibold text-highlighted">

          {{ stat.value }}
        </span>


      </div>
    </UPageCard>
  </UPageGrid>
</template>
