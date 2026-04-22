<script setup lang="ts">
import logoIcon from '~/assets/images/logo-icon.svg'

defineProps<{
  collapsed?: boolean
}>()
</script>

<template>
  <div :class="collapsed ? 'px-2 py-1.5' : 'px-3 py-3'">
    <div v-if="!collapsed" class="flex items-center gap-2.5 px-1 py-1">
      <div class="flex h-7 w-7 items-center justify-center overflow-hidden rounded-md">
        <img :src="logoIcon" alt="Cechriza" class="h-full w-full object-cover">
      </div>
      <p class="text-sm font-semibold tracking-tight text-gray-900 dark:text-gray-100">
        Recursos Humanos
      </p>
    </div>

    <div v-else class="flex items-center justify-center">
      <div class="flex h-8 w-8 items-center justify-center overflow-hidden rounded-md">
        <img :src="logoIcon" alt="Cechriza" class="h-full w-full object-cover">
      </div>
    </div>
  </div>
</template>
