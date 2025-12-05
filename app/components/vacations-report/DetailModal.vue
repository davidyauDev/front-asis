<template>
    <UModal v-model:open="open" :ui="{
        title: 'py-6'
    }">
        <template #title>
            <div class="flex items-center gap-4">
                <UAvatar size="xl" alt="Reyna, Fredy Kenlly" />
                <div class="flex-1 gap-2 flex flex-col">
                    <h4 id="radix-_r_5_" data-slot="dialog-title" class="text-xl font-bold text-foreground">Portugal
                        Reyna, Fredy Kenlly</h4>

                    <div class="flex gap-2">


                        <UBadge variant="subtle" color="info" icon="i-lucide-id-card" size="xs">
                            73829648
                        </UBadge>

                        <UBadge variant="subtle" color="info" icon="i-lucide-cake" size="xs">
                            11/12/24
                        </UBadge>

                        <UBadge variant="subtle" color="info" icon="i-lucide-map-pin" size="xs">
                            Tumbes
                        </UBadge>

                        <UBadge variant="subtle" color="info" icon="i-lucide-building" size="xs">
                            Cechriza S.A.C
                        </UBadge>

                    </div>

                </div>
            </div>


        </template>
        <template #body>
            <div class="p-6">
                <div class="flex flex-col gap-6">
                    <div class="flex-1">
                        <h3 class="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Calendario
                            de Asistencia</h3>
                        <UCalendar variant="soft" disabled locale="es" :model-value="rangeDate" range>
                            <template #day="{ day }">

                                <UChip text="✓"  :show="!!getColorByDate(day.toDate(getLocalTimeZone()))"
                                    
                                    :color="getColorByDate(day.toDate(getLocalTimeZone()))" size="3xl" class="size-6">
                                    <UTooltip :delay-duration="0" text="Presente">
                                        <span>
                                            {{ day.day }}
                                        </span>

                                    </UTooltip>
                                </UChip>
                            </template>
                        </UCalendar>
                    </div>
                    <div class="w-full flex flex-col gap-3">
                        <h3 class="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Resumen</h3>
                        <div class="p-4 rounded-xl bg-primary/5 border border-primary/20">
                            <div class="flex items-center justify-between mb-2"><span
                                    class="text-xs text-muted-foreground">Asistencia</span><span
                                    class="text-lg font-bold text-foreground">26<span
                                        class="text-muted-foreground text-sm">/31</span></span></div>
                            <div aria-valuemax="100" aria-valuemin="0" role="progressbar" data-state="indeterminate"
                                data-max="100" data-slot="progress"
                                class="bg-primary/20 relative w-full overflow-hidden rounded-full h-2">
                                <div data-state="indeterminate" data-max="100" data-slot="progress-indicator"
                                    class="bg-primary h-full w-full flex-1 transition-all"
                                    style="transform: translateX(-16%);"></div>
                            </div>
                            <p class="text-xs text-muted-foreground mt-2 text-center">84%</p>
                        </div>
                        <div class="grid grid-cols-3 gap-2">
                            <div
                                class="flex flex-col items-center justify-center p-3 rounded-lg bg-primary/5 border border-primary/20">
                                <span class="text-xl font-bold text-present">26</span><span
                                    class="text-[10px] text-muted-foreground">Trabajados</span>
                            </div>
                            <div
                                class="flex flex-col items-center justify-center p-3 rounded-lg bg-primary/5 border border-primary/20">
                                <span class="text-xl font-bold text-vacation">0</span><span
                                    class="text-[10px] text-muted-foreground">Vacaciones</span>
                            </div>
                            <div
                                class="flex flex-col items-center justify-center p-3 rounded-lg bg-primary/5 border border-primary/20">
                                <span class="text-xl font-bold text-medical">0</span><span
                                    class="text-[10px] text-muted-foreground">D.
                                    Médico</span>
                            </div>
                            <div
                                class="flex flex-col items-center justify-center p-3 rounded-lg bg-primary/5 border border-primary/20">
                                <span class="text-xl font-bold text-foreground">0</span><span
                                    class="text-[10px] text-muted-foreground">No
                                    Marcó</span>
                            </div>
                            <div
                                class="flex flex-col items-center justify-center p-3 rounded-lg bg-primary/5 border border-primary/20">
                                <span class="text-xl font-bold text-foreground">0</span><span
                                    class="text-[10px] text-muted-foreground">LCGH</span>
                            </div>
                            <div
                                class="flex flex-col items-center justify-center p-3 rounded-lg bg-primary/5 border border-primary/20">
                                <span class="text-xl font-bold text-foreground">0</span><span
                                    class="text-[10px] text-muted-foreground">LSGH</span>
                            </div>
                        </div>
                        <div class="p-4 rounded-xl bg-primary/5 border border-primary/20">
                            <div class="flex items-center gap-2 mb-1"><svg xmlns="http://www.w3.org/2000/svg" width="24"
                                    height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                                    stroke-linecap="round" stroke-linejoin="round"
                                    class="lucide lucide-trending-up w-4 h-4 text-primary">
                                    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
                                    <polyline points="16 7 22 7 22 13"></polyline>
                                </svg><span class="text-xs text-muted-foreground">Monto a Depositar</span></div>
                            <p class="text-3xl font-bold text-present">S/ 73</p><span data-slot="badge"
                                class="inline-flex items-center justify-center rounded-md px-2 py-0.5 font-medium w-fit whitespace-nowrap shrink-0 [&amp;&gt;svg]:size-3 gap-1 [&amp;&gt;svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden border-transparent [a&amp;]:hover:bg-primary/90 mt-2 bg-sunday/20 text-sunday border-0 text-xs">+S/
                                8 bono Vac &gt;23</span>
                        </div>
                    </div>
                </div>
            </div>
        </template>
    </UModal>
</template>

<script setup lang="ts">
import { CalendarDate, getLocalTimeZone } from '@internationalized/date';

const open = defineModel('open', {
    type: Boolean,
    required: true
})


const { rangeDate } = defineProps<{
    rangeDate: {
        start: CalendarDate,
        end: CalendarDate
    }
}>()


// const modelValue = shallowRef(new CalendarDate(2022, 1, 10))

function getColorByDate(date: Date) {
    const isWeekend = date.getDay() % 6 == 0
    const isDayMeeting = date.getDay() % 3 == 0

    if (isWeekend) {
        return undefined
    }

    if (isDayMeeting) {
        return 'error'
    }

    return 'success'
}

</script>