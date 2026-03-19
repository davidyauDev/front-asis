<script setup lang="ts">
import { computed } from 'vue'
import {
  formatDailyRecord,
  getConceptBadge,
  getDailyModalPanelClass,
  getDailyModalPreClass,
} from '~/utils/seguimiento'

const props = defineProps<{
  show: boolean
  dailyRecord: unknown | null
}>()

const emit = defineEmits<{
  close: []
}>()

const badge = computed(() => getConceptBadge(props.dailyRecord))
const panelClass = computed(() => getDailyModalPanelClass(props.dailyRecord))
const preClass = computed(() => getDailyModalPreClass(props.dailyRecord))
</script>

<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center">
    <div class="absolute inset-0 bg-black/50" aria-hidden="true" @click="emit('close')" />

    <div
      class="relative rounded-lg shadow-lg w-full max-w-2xl mx-4 p-5"
      :class="panelClass"
      role="dialog"
      aria-modal="true"
    >
      <header class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-2 min-w-0">
          <h3 class="text-lg font-medium text-gray-900 dark:text-gray-50 truncate">Detalle de Registro</h3>
          <span v-if="dailyRecord" :class="`px-2 py-1 text-xs font-medium rounded-md ${badge.color}`">
            {{ badge.text }}
          </span>
        </div>

        <button class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300" @click="emit('close')">
          ✕
        </button>
      </header>

      <pre
        class="text-xs overflow-auto max-h-[60vh] p-3 rounded border"
        :class="preClass"
      >{{ formatDailyRecord(dailyRecord) }}</pre>
    </div>
  </div>
</template>
