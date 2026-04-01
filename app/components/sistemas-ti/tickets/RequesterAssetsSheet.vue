<script setup lang="ts">
import { listDeskAssets } from '~/services/sistemas-ti/tickets'

const open = defineModel<boolean>('open', { default: false })

defineProps<{
  requesterId?: number | null
}>()

const assets = computed(() => listDeskAssets())
</script>

<template>
  <USlideover v-model:open="open" title="Activos del solicitante">
    <template #body>
      <div class="space-y-2 p-4">
        <div
          v-for="asset in assets"
          :key="asset.serial"
          class="rounded-lg border border-gray-200/70 p-3 text-sm dark:border-gray-800/70"
        >
          <p class="font-semibold text-gray-900 dark:text-gray-100">
            {{ asset.name }}
          </p>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            {{ asset.type }} · {{ asset.serial }} · {{ asset.status }}
          </p>
        </div>
      </div>
    </template>
  </USlideover>
</template>
