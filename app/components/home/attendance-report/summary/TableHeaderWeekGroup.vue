<template>
    <div class="w-full h-full">
        <div class="bg-linear-to-r h-12 text-white text-center py-3 font-bold text-xs tracking-wide"
            :class="gradiantBackgroundColor">
            {{ week }}
        </div>
        <div class="text-center p-2" :class="firstBackgroundColor">

            <span class="w-full text-xs" :class="firstColor">
                <template v-if="date">

                    {{ date.inicio }} - {{ date.fin }}
                </template>
                <template v-else>

                    Acumulado
                </template>
            </span>

        </div>
        <div class="w-full flex">
            <span class="w-1/2 block px-2 py-5 text-center text-[10px] font-bold uppercase tracking-wider"
                :class="[firstColor, secondBackgroundColor]">
                Tardanza</span>
            <span class="w-1/2 block px-2 py-5 text-center text-[10px] font-bold uppercase tracking-wider"
                :class="[firstColor, firstBackgroundColor]">
                Trabajado</span>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { AttendaceWeeksDates } from '../../composables/useAttendanceReport';


defineProps<{
    week: string,
    date?: AttendaceWeeksDates['s1'],
    gradiantBackgroundColor: string,
    firstBackgroundColor: string,
    secondBackgroundColor: string,
    firstColor: string,
    secondColor: string,
}>()
</script>