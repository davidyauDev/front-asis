<script setup lang="ts">
import DevelopmentRequestCard from './DevelopmentRequestCard.vue'

interface RequestCard {
  code: string
  title: string
  requester: string
  area: string
  priority: string
  updatedAt?: string
  description?: string
}

interface Props {
  title: string
  count: number
  accentClass: string
  badgeClass: string
  cards?: RequestCard[]
}

defineProps<Props>()
</script>

<template>
  <div class="flex h-full min-h-[460px] min-w-[240px] flex-col overflow-hidden rounded-xl border border-slate-200 bg-[#fafafa] shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
    <div class="border-b border-slate-200 px-4 py-3.5 bg-white">
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <div class="mb-3 h-1.5 w-12 rounded-full" :class="accentClass" />
          <h3 class="text-[15px] font-semibold leading-5 text-slate-900">
            {{ title }}
          </h3>
          <p class="mt-0.5 text-xs text-slate-500">
            {{ count }} solicitudes
          </p>
        </div>

        <UBadge color="neutral" variant="soft" class="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600" :class="badgeClass">
          {{ count }}
        </UBadge>
      </div>
    </div>

    <div class="flex flex-1 flex-col gap-3 px-3 py-4 bg-[#fafafa]">
      <template v-if="cards?.length">
        <DevelopmentRequestCard
          v-for="card in cards"
          :key="card.code"
          v-bind="card"
        />
      </template>

      <div
        v-else
        class="flex flex-1 flex-col items-center justify-center rounded-[16px] border border-dashed border-slate-200 bg-transparent px-4 py-10 text-center"
      >
        <div class="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-400">
          <UIcon name="i-lucide-inbox" class="h-7 w-7" />
        </div>

        <p class="mt-4 text-sm font-medium text-slate-700">
          Sin solicitudes
        </p>
        <p class="mt-1 text-sm text-slate-400">
          Arrastra aqui para agregar
        </p>
      </div>
    </div>
  </div>
</template>
