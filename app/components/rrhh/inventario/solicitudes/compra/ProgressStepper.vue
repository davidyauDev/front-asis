<script setup lang="ts">
export type StepState = 'done' | 'current' | 'upcoming'

export interface StepperStep {
  key: string
  label: string
  state: StepState
}

const props = defineProps<{
  stepIndex: number
  stepCount: number
  currentLabel: string
  steps: StepperStep[]
}>()

const stepCircleClass = (state: StepState) => {
  if (state === 'done') return 'bg-emerald-600 text-white ring-emerald-600'
  if (state === 'current') return 'bg-[#2d5fc0] text-white ring-[#2d5fc0]'
  return 'bg-white text-gray-500 ring-gray-300 dark:bg-gray-950 dark:text-gray-300 dark:ring-gray-700'
}

const stepLabelClass = (state: StepState) => {
  if (state === 'done') return 'text-emerald-700 dark:text-emerald-300'
  if (state === 'current') return 'text-[#2d5fc0] dark:text-[#9cb7f5]'
  return 'text-gray-500 dark:text-gray-400'
}

const connectorClass = (left: StepState, right: StepState) => {
  if (left === 'done') return 'bg-emerald-600/60'
  if (left === 'current' || right === 'current') return 'bg-[#2d5fc0]/40'
  return 'bg-gray-200 dark:bg-gray-800'
}
</script>

<template>
  <div class="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-950/60 sm:p-5">
    <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
      <p class="text-sm font-semibold text-gray-950 dark:text-white">
        Paso {{ props.stepIndex }} de {{ props.stepCount }}
        <span class="text-gray-500 dark:text-gray-400">—</span>
        <span class="text-gray-700 dark:text-gray-200">{{ props.currentLabel }}</span>
      </p>
      <p class="text-xs text-gray-500 dark:text-gray-400">
        Estado y progreso del flujo
      </p>
    </div>

    <ol class="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:gap-0" aria-label="Stepper de flujo">
      <template v-for="(step, idx) in props.steps" :key="step.key">
        <li class="flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 dark:border-gray-800 dark:bg-gray-900/50 md:flex-1 md:flex-col md:items-center md:border-0 md:bg-transparent md:p-0">
          <div class="flex items-center gap-3 md:flex-col md:gap-2">
            <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-2" :class="stepCircleClass(step.state)">
              <UIcon v-if="step.state === 'done'" name="i-lucide-check" class="h-4 w-4" />
              <span v-else class="text-xs font-bold">{{ idx + 1 }}</span>
            </div>

            <div class="min-w-0 md:text-center">
              <p class="text-xs font-semibold uppercase tracking-[0.12em]" :class="stepLabelClass(step.state)">
                {{ step.label }}
              </p>
              <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {{ step.state === 'done' ? 'Completado' : step.state === 'current' ? 'Activo' : 'Pendiente' }}
              </p>
            </div>
          </div>
        </li>

        <li
          v-if="idx < props.steps.length - 1"
          aria-hidden="true"
          class="hidden h-px flex-1 md:block"
          :class="connectorClass(step.state, props.steps[idx + 1].state)"
        />
      </template>
    </ol>
  </div>
</template>
