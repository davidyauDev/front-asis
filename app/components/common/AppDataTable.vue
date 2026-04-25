<script setup lang="ts">
export interface AppDataTableColumn {
  key: string
  label: string
  align?: 'left' | 'center' | 'right'
  headerClass?: string
  cellClass?: string
}

const props = withDefaults(
  defineProps<{
    columns: readonly AppDataTableColumn[]
    rows: unknown[]
    loading?: boolean
    error?: string | null
    emptyText?: string
    rowKey?: string
    maxHeightClass?: string
    tableClass?: string
    headerClass?: string
    bodyClass?: string
    rowClass?: string
  }>(),
  {
    loading: false,
    error: null,
    emptyText: 'Sin registros para mostrar.',
    rowKey: 'id',
    maxHeightClass: 'max-h-[68vh]',
    tableClass: 'min-w-[960px] w-full table-fixed border-separate border-spacing-0',
    headerClass: 'sticky top-0 z-10 bg-[#2d5fc0] text-white',
    bodyClass: 'divide-y divide-gray-100/80 bg-white dark:divide-gray-800/80 dark:bg-gray-950',
    rowClass: 'transition-colors hover:bg-[#f7f9ff] dark:hover:bg-gray-900/60',
  }
)

const emit = defineEmits<{
  (event: 'retry'): void
}>()

const resolveRowKey = (row: unknown, index: number) => {
  if (row && typeof row === 'object' && props.rowKey in (row as Record<string, unknown>)) {
    const value = (row as Record<string, unknown>)[props.rowKey]
    if (value !== undefined && value !== null && value !== '') return String(value)
  }
  return `row-${index}`
}

const alignClass = (align?: AppDataTableColumn['align']) => {
  if (align === 'center') return 'text-center'
  if (align === 'right') return 'text-right'
  return 'text-left'
}
</script>

<template>
  <div class="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
    <div
      v-if="error"
      class="px-5 py-10 text-center text-sm text-red-600 dark:text-red-400"
    >
      <slot name="error" :error="error">
        <div class="space-y-3">
          <p class="font-semibold">{{ error }}</p>
          <UButton
            color="primary"
            variant="soft"
            class="rounded-full bg-[#eef4ff] text-[#2d5fc0] ring-1 ring-[#cbdcff] hover:bg-[#dfe9ff]"
            @click="emit('retry')"
          >
            Reintentar
          </UButton>
        </div>
      </slot>
    </div>

    <div v-else :class="[maxHeightClass, 'overflow-x-auto overflow-y-auto']">
      <table :class="['crm-table', tableClass]">
        <thead :class="headerClass">
          <tr>
            <th
              v-for="col in columns"
              :key="col.key"
              :class="[
                'px-5 py-3 text-[11px] font-semibold uppercase tracking-wider',
                alignClass(col.align),
                col.headerClass,
              ]"
            >
              <slot :name="`header-${col.key}`" :column="col">
                {{ col.label }}
              </slot>
            </th>
          </tr>
        </thead>

        <tbody :class="bodyClass">
          <tr v-if="loading">
            <td :colspan="columns.length" class="px-5 py-12 text-center text-sm text-gray-500 dark:text-gray-400">
              <slot name="loading">
                <div class="flex items-center justify-center gap-3">
                  <UIcon name="i-lucide-loader-2" class="h-5 w-5 animate-spin text-[#2d5fc0]" />
                  <span>Cargando...</span>
                </div>
              </slot>
            </td>
          </tr>

          <tr v-else-if="!rows.length">
            <td :colspan="columns.length" class="px-5 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
              <slot name="empty">
                {{ emptyText }}
              </slot>
            </td>
          </tr>

          <tr
            v-for="(row, index) in rows"
            v-else
            :key="resolveRowKey(row, index)"
            :class="rowClass"
          >
            <td
              v-for="col in columns"
              :key="`${resolveRowKey(row, index)}-${col.key}`"
              :class="[
                'px-5 py-4 align-top',
                alignClass(col.align),
                col.cellClass,
              ]"
            >
              <slot :name="`cell-${col.key}`" :row="row" :column="col">
                {{ (row as Record<string, unknown>)[col.key] ?? '--' }}
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
