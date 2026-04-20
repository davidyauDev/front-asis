<script setup lang="ts">
export interface RequestSummaryModel {
  id: number
  productName: string
  productCode: string
  requesterName: string
  locationLabel: string
  statusLabel: string
  statusBadgeClass: string
  nextAction: string
  progressPercent: number
  quantityLabel: string
  registeredAtLabel: string
  observationLabel: string
}

const props = defineProps<{
  summary: RequestSummaryModel
}>()
</script>

<template>
  <div class="space-y-3">
    <div class="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-950/60 sm:p-5">
      <div class="flex items-start justify-between gap-3">
        <div class="space-y-1">
          <p class="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400">
            Producto
          </p>
          <p class="text-lg font-bold leading-6 text-gray-950 dark:text-white">
            {{ props.summary.productName }}
          </p>
          <p class="text-sm text-gray-600 dark:text-gray-300">
            <span class="font-semibold text-gray-900 dark:text-white">Codigo:</span>
            {{ props.summary.productCode }}
          </p>
        </div>

        <span :class="['inline-flex shrink-0 rounded-md px-3 py-1 text-[11px] font-bold', props.summary.statusBadgeClass]">
          {{ props.summary.statusLabel }}
        </span>
      </div>

      <div class="mt-4 grid gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm dark:border-gray-800 dark:bg-gray-900/60">
        <div class="flex items-center justify-between gap-3">
          <p class="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">
            Accion requerida
          </p>
          <p class="text-xs font-semibold text-[#2d5fc0] dark:text-[#9cb7f5]">
            {{ props.summary.progressPercent }}%
          </p>
        </div>
        <p class="font-semibold text-gray-950 dark:text-white">
          {{ props.summary.nextAction }}
        </p>
      </div>
    </div>

    <div class="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950/60 sm:p-5">
      <p class="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400">
        Resumen
      </p>
      <dl class="mt-3 grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt class="text-xs font-semibold text-gray-500 dark:text-gray-400">Solicitud</dt>
          <dd class="mt-1 font-semibold text-gray-950 dark:text-white">#{{ props.summary.id }}</dd>
        </div>
        <div>
          <dt class="text-xs font-semibold text-gray-500 dark:text-gray-400">Solicitante</dt>
          <dd class="mt-1 font-semibold text-gray-950 dark:text-white">{{ props.summary.requesterName }}</dd>
        </div>
        <div>
          <dt class="text-xs font-semibold text-gray-500 dark:text-gray-400">Cantidad</dt>
          <dd class="mt-1 text-gray-700 dark:text-gray-200">{{ props.summary.quantityLabel }}</dd>
        </div>
        <div>
          <dt class="text-xs font-semibold text-gray-500 dark:text-gray-400">Registro</dt>
          <dd class="mt-1 text-gray-700 dark:text-gray-200">{{ props.summary.registeredAtLabel }}</dd>
        </div>
        <div>
          <dt class="text-xs font-semibold text-gray-500 dark:text-gray-400">Ubicacion</dt>
          <dd class="mt-1">
            <span
              v-if="props.summary.locationLabel !== '--'"
              class="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2 py-0.5 text-[11px] font-bold text-teal-800 ring-1 ring-teal-200 dark:bg-teal-950/25 dark:text-teal-200 dark:ring-teal-900/40"
            >
              <UIcon name="i-lucide-map-pin" class="h-3.5 w-3.5" />
              {{ props.summary.locationLabel }}
            </span>
            <span v-else class="text-gray-700 dark:text-gray-200">{{ props.summary.locationLabel }}</span>
          </dd>
        </div>
        <div class="sm:col-span-2">
          <dt class="text-xs font-semibold text-gray-500 dark:text-gray-400">Observacion</dt>
          <dd class="mt-1 text-gray-700 dark:text-gray-200">
            {{ props.summary.observationLabel }}
          </dd>
        </div>
      </dl>
    </div>
  </div>
</template>
