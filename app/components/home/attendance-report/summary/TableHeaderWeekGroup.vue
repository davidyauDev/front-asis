<template>
  <div class="w-full h-full border border-gray-200 dark:border-gray-800 rounded-md overflow-hidden mt-4 bg-white dark:bg-gray-950">
    <div
      class="h-12 text-white text-center py-3 font-bold text-xs tracking-wide bg-[#2d5fc0]"
    >
      {{ week }}
    </div>

    <div class="text-center p-2 bg-[#eef4ff] dark:bg-[#101b31]">
      <span class="w-full text-xs text-[#2d5fc0] dark:text-[#d1ddfb]">
        <template v-if="date">
          {{ date.inicio }} - {{ date.fin }}
        </template>
        <template v-else>
          Acumulado
        </template>
      </span>
    </div>

    <div
      class="flex text-[10px] font-semibold uppercase tracking-wider text-center bg-[#f8faff] dark:bg-[#101b31] text-[#2d5fc0] dark:text-[#d1ddfb]"
    >
      <span class="w-1/2 py-2 border-r border-white/40 dark:border-gray-700">
        Tardanza
      </span>
      <span class="w-1/2 py-2">
        Trabajado
      </span>
    </div>

    <div class="w-full flex">
      <span
        class="w-1/2 block px-2 py-5 text-center text-[10px] font-bold bg-[#eef4ff] text-[#2d5fc0] dark:bg-[#101b31] dark:text-[#d1ddfb]"
      >
        <!-- aquí van los valores -->
      </span>

      <span
        class="w-1/2 block px-2 py-5 text-center text-[10px] font-bold bg-white text-[#2d5fc0] dark:bg-[#0d1627] dark:text-[#d1ddfb]"
      >
        <!-- aquí van los valores -->
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AttendaceWeeksDates } from '../../composables/useAttendanceReport'

defineProps<{
  week: string
  date?: AttendaceWeeksDates['s1']
  gradiantBackgroundColor: string
  firstBackgroundColor: string
  secondBackgroundColor: string
  firstColor: string
  secondColor: string
}>()
</script>
