<script setup lang="ts">
type RankingItem = {
  name: string
  total: number
}

const props = defineProps<{
  title: string
  valueLabel: string
  items: RankingItem[]
  accent: string
  showFooterAction?: boolean
}>()

const month = defineModel<string>({ required: true })

const monthOptions = [
  { label: 'Todos los meses', value: 'all' },
  { label: 'Enero 2026', value: '2026-01' },
  { label: 'Febrero 2026', value: '2026-02' },
  { label: 'Marzo 2026', value: '2026-03' },
] as const

const showFooterAction = computed(() => props.showFooterAction !== false)

const maxValue = computed(() => Math.max(...props.items.map(item => item.total), 1))

const rows = computed(() =>
  props.items.map((item, index) => ({
    ...item,
    rank: index + 1,
    width: `${(item.total / maxValue.value) * 100}%`,
  })),
)
</script>

<template>
  <UCard class="rounded-[1.75rem] border border-gray-200/80 bg-white shadow-[0_10px_24px_-20px_rgba(15,23,42,0.18)] dark:border-gray-800 dark:bg-gray-950" :ui="{ body: 'p-6' }">
    <div class="mb-5 flex items-center justify-between gap-4">
      <div>
        <h2 class="text-xl font-black tracking-[-0.04em] text-gray-950 dark:text-white">
          {{ title }}
        </h2>
        <p class="mt-1 text-sm text-muted">
          {{ valueLabel }}
        </p>
      </div>

      <USelectMenu
        v-model="month"
        :options="monthOptions"
        :search-input="false"
        :ignoreFilter="true"
        value-key="value"
        size="sm"
        class="w-40"
      />
    </div>

    <div class="grid gap-4">
      <div
        v-for="row in rows"
        :key="row.name"
        class="rounded-2xl border border-gray-100 bg-slate-50/80 p-4 dark:border-gray-800 dark:bg-slate-900/50"
      >
        <div class="mb-3 flex items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <span
              class="flex size-7 items-center justify-center rounded-full text-xs font-black text-white"
              :class="accent"
            >
              {{ row.rank }}
            </span>
            <span class="text-sm font-semibold text-gray-950 dark:text-white">
              {{ row.name }}
            </span>
          </div>
          <span class="text-sm font-black text-gray-700 dark:text-gray-200">
            {{ row.total }}
          </span>
        </div>

        <div class="h-2 overflow-hidden rounded-full bg-gray-200/80 dark:bg-gray-800">
          <div
            class="h-full rounded-full transition-all duration-300"
            :class="accent"
            :style="{ width: row.width }"
          />
        </div>
      </div>
    </div>

    <div v-if="showFooterAction" class="mt-6">
      <UButton
        block
        color="primary"
        variant="solid"
        icon="i-lucide-arrow-right"
        :trailing="true"
        class="rounded-full bg-gradient-to-r from-[#5c5cff] to-[#2d72ff] shadow-[0_10px_20px_-16px_rgba(45,114,255,0.45)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_24px_-18px_rgba(45,114,255,0.55)]"
      >
        Ver reporte completo
      </UButton>
    </div>
  </UCard>
</template>
