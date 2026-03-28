<script setup lang="ts">
import logoIcon from '~/assets/images/logo-icon.svg'

defineProps<{
  collapsed?: boolean
}>()
</script>

<template>
  <div class="px-3 py-3">
    <div v-if="!collapsed" class="flex items-center gap-2">
      <div class="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg ring-1 ring-primary-100 dark:ring-primary-900/40">
        <img :src="logoIcon" alt="Cechriza" class="h-full w-full object-cover">
      </div>
      <div class="flex flex-col">
        <p class="text-sm font-semibold text-gray-900">Cechriza</p>
        <p class="text-xs text-gray-500">Asistencia</p>
      </div>
    </div>
    <div v-else class="flex items-center justify-center">
      <div class="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg ring-1 ring-primary-100 dark:ring-primary-900/40">
        <img :src="logoIcon" alt="Cechriza" class="h-full w-full object-cover">
      </div>
    </div>
  </div>
</template>
