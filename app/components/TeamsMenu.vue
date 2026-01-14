<script setup lang="ts">
defineProps<{
  collapsed?: boolean
}>()
</script>

<template>
  <div class="px-3 py-3">
    <div v-if="!collapsed" class="flex items-center gap-2">
      <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
        <span class="text-sm font-semibold text-white">CA</span>
      </div>
      <div class="flex flex-col">
        <p class="text-sm font-semibold text-gray-900">Cechriza</p>
        <p class="text-xs text-gray-500">Asistencia</p>
      </div>
    </div>
    <div v-else class="flex items-center justify-center">
      <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
        <span class="text-sm font-semibold text-white">CA</span>
      </div>
    </div>
  </div>
</template>
