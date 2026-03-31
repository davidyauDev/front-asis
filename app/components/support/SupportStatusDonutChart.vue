<script setup lang="ts">
import type { ApexOptions } from 'apexcharts'

type Slice = {
  label: string
  value: number
  color: string
}

const props = defineProps<{
  title: string
  subtitle?: string
  slices: Slice[]
}>()

const month = defineModel<string>({ required: true })

const colorMode = useColorMode()

const total = computed(() => props.slices.reduce((sum, slice) => sum + slice.value, 0))
const series = computed(() => props.slices.map(slice => slice.value))
const labels = computed(() => props.slices.map(slice => slice.label))
const colors = computed(() => props.slices.map(slice => slice.color))

const chartOptions = computed<ApexOptions>(() => ({
  labels: labels.value,
  colors: colors.value,
  chart: {
    background: 'transparent',
    toolbar: { show: false },
  },
  dataLabels: {
    enabled: true,
    formatter: (value: number) => `${Math.round(value)}%`,
    style: {
      fontSize: '12px',
      fontWeight: 700,
    },
  },
  stroke: {
    width: 3,
    colors: ['#ffffff'],
  },
  legend: {
    show: false,
  },
  plotOptions: {
    pie: {
      donut: {
        size: '72%',
        labels: {
          show: true,
          name: {
            show: true,
            offsetY: 12,
          },
          value: {
            show: true,
            fontSize: '28px',
            fontWeight: 800,
            formatter: value => `${value}`,
          },
          total: {
            show: true,
            label: 'Total',
            formatter: () => `${total.value}`,
          },
        },
      },
    },
  },
  tooltip: {
    y: {
      formatter: (value: number) => `${value} tickets`,
    },
  },
  theme: {
    mode: colorMode.value as 'dark' | 'light',
  },
}))
</script>

<template>
  <UCard class="rounded-[1.75rem] border border-gray-200/80 bg-white shadow-[0_18px_36px_-24px_rgba(15,23,42,0.35)] dark:border-gray-800 dark:bg-gray-950" :ui="{ body: 'p-6' }">
    <div class="mb-6 flex items-center justify-between gap-4">
      <div>
        <h2 class="text-xl font-black tracking-[-0.04em] text-gray-950 dark:text-white">
          {{ title }}
        </h2>
        <p v-if="subtitle" class="mt-1 text-sm text-muted">
          {{ subtitle }}
        </p>
      </div>

      <USelectMenu
        v-model="month"
        :options="[
          { label: 'Todos los meses', value: 'all' },
          { label: 'Enero 2026', value: '2026-01' },
          { label: 'Febrero 2026', value: '2026-02' },
          { label: 'Marzo 2026', value: '2026-03' },
        ]"
        :search-input="false"
        :ignoreFilter="true"
        value-key="value"
        size="sm"
        class="w-40"
      />
    </div>

    <div class="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
      <div class="rounded-[1.4rem] border border-gray-100 bg-gradient-to-b from-slate-50 to-white p-4 dark:border-gray-800 dark:from-slate-900/60 dark:to-gray-950">
        <apexchart
          type="donut"
          height="330"
          :options="chartOptions"
          :series="series"
        />
      </div>

      <div class="flex flex-col justify-between gap-6">
        <div class="grid gap-3">
          <div
            v-for="slice in slices"
            :key="slice.label"
            class="rounded-2xl border border-gray-100 bg-slate-50/80 p-4 dark:border-gray-800 dark:bg-slate-900/50"
          >
            <div class="mb-2 flex items-center justify-between gap-3">
              <div class="flex items-center gap-3">
                <span class="size-3 rounded-full" :style="{ backgroundColor: slice.color }" />
                <span class="text-sm font-semibold text-gray-950 dark:text-white">
                  {{ slice.label }}
                </span>
              </div>
              <span class="text-sm font-bold text-gray-700 dark:text-gray-200">
                {{ slice.value }}
              </span>
            </div>

            <div class="h-2 overflow-hidden rounded-full bg-gray-200/80 dark:bg-gray-800">
              <div
                class="h-full rounded-full"
                :style="{
                  width: `${total ? (slice.value / total) * 100 : 0}%`,
                  backgroundColor: slice.color,
                }"
              />
            </div>
          </div>
        </div>

        <div class="rounded-2xl border border-[#d7e1f5] bg-[#eef4ff] px-4 py-3 text-sm text-[#2d5fc0] dark:border-[#29426d] dark:bg-[#13203a] dark:text-[#c9d9ff]">
          <p class="font-semibold">
            Actualizado al {{ month === 'all' ? '31/03/2026 09:22' : 'mes seleccionado' }}
          </p>
          <p class="mt-1 text-xs leading-5 opacity-90">
            Vista ficticia para seguimiento de estado de tickets.
          </p>
        </div>
      </div>
    </div>
  </UCard>
</template>
