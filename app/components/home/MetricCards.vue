<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    <div 
      v-for="card in metrics" 
      :key="card.title"
      class="bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800 p-6"
    >
      <div class="space-y-2">
        <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          {{ card.title }}
        </p>
        <div class="flex items-baseline justify-between">
          <h3 class="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {{ card.value }}
          </h3>
          <div class="flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-500">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
            <span>{{ card.change }}</span>
          </div>
        </div>
        <p class="text-xs text-gray-500 dark:text-gray-400">
          {{ card.description }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface MetricCard {
  title: string
  value: string
  change: string
  description: string
}

const props = defineProps<{
  metrics: MetricCard[]
}>()
</script>
