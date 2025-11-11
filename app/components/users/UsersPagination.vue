<template>
  <div v-if="paginationInfo.totalItems > paginationInfo.perPage" class="mt-6">
    <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
      <!-- Info de paginación -->
      <div class="flex items-center gap-4">
        <p class="text-sm text-gray-600 dark:text-gray-300">
          <span class="font-medium">{{ paginationInfo.from }}</span>
          -
          <span class="font-medium">{{ paginationInfo.to }}</span>
          de
          <span class="font-semibold">{{ paginationInfo.totalItems }}</span>
          usuarios
        </p>
        
        <div v-if="selectedCount > 0" class="text-sm text-primary-600 dark:text-primary-400">
          <UIcon name="i-lucide-check-square" class="w-4 h-4 inline mr-1" />
          {{ selectedCount }} seleccionados
        </div>
      </div>

      <!-- Controles de paginación -->
      <UPagination
        :model-value="paginationInfo.current"
        :total="paginationInfo.totalItems"
        :items-per-page="paginationInfo.perPage"
        @update:page="handlePageChange"
        :max="7"
        size="sm"
        show-first
        show-last
        :prev-button="{ icon: 'i-lucide-chevron-left', label: '', color: 'neutral' as const }"
        :next-button="{ icon: 'i-lucide-chevron-right', label: '', color: 'neutral' as const }"
        :first-button="{ icon: 'i-lucide-chevrons-left', label: '' }"
        :last-button="{ icon: 'i-lucide-chevrons-right', label: '' }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
interface PaginationInfo {
  current: number
  total: number
  from: number
  to: number
  totalItems: number
  perPage: number
}

interface Props {
  paginationInfo: PaginationInfo
  selectedCount: number
}

interface Emits {
  (e: 'goToPage', page: number): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const handlePageChange = (page: number) => {
  emit('goToPage', page);
}

</script>