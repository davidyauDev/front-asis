<script setup lang="ts">
interface Props {
  code: string
  title: string
  requester: string
  area: string
  priority: string
  updatedAt?: string
  description?: string
}

defineProps<Props>()
</script>

<template>
  <article class="group rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_6px_18px_rgba(15,23,42,0.08)]">
    <div class="flex items-start justify-between gap-3">
      <div class="space-y-1">
        <p class="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
          {{ code }}
        </p>
        <h3 class="text-sm font-semibold leading-5 text-slate-900">
          {{ title }}
        </h3>
      </div>

      <UBadge color="neutral" variant="soft" class="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
        {{ priority }}
      </UBadge>
    </div>

    <p v-if="description" class="mt-3 text-xs leading-5 text-slate-500">
      {{ description }}
    </p>

    <div class="mt-4 grid gap-2 text-xs text-slate-500">
      <div class="flex items-center justify-between gap-3">
        <span class="text-slate-500">Solicitante</span>
        <span class="font-medium text-slate-700">{{ requester }}</span>
      </div>
      <div class="flex items-center justify-between gap-3">
        <span class="text-slate-500">Area</span>
        <span class="font-medium text-slate-700">{{ area }}</span>
      </div>
      <div v-if="updatedAt" class="flex items-center justify-between gap-3">
        <span class="text-slate-500">Actualizado</span>
        <span class="font-medium text-slate-700">{{ updatedAt }}</span>
      </div>
    </div>
  </article>
</template>
