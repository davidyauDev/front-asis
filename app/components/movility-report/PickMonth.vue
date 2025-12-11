<script setup lang="ts">
import { CalendarDate, DateFormatter, getLocalTimeZone } from '@internationalized/date';
import { endOfMonth } from 'date-fns';
import { fromCalToDate, toCalendarDate } from '~/utils/formatDate';

const df = new DateFormatter('es-ES', {
    dateStyle: 'medium'
})

const modelValue = defineModel<{
    start: CalendarDate,
    end: CalendarDate
}>({
    required: true
})

const onUpdateRange = (value: any) => {
    const startDate = fromCalToDate(value.start);
    const endDate = value?.end ? fromCalToDate(value.end) : null;

    const endOfStartMonth = endOfMonth(startDate);

    // Nuevo endDate = endDate limitado al fin de mes del start
    const limitedEnd = endDate > endOfStartMonth ? endOfStartMonth : endDate;


    modelValue.value = {
        start: value.start,
        end: value.end ? toCalendarDate(limitedEnd) : null
    };
};


const maxDate = computed<CalendarDate>(() => {
    const date = endOfMonth(modelValue.value.start.toDate(getLocalTimeZone()));
    return toCalendarDate(date)
})
</script>

<template>
    <UPopover>
        <UButton color="neutral" variant="subtle" icon="i-lucide-calendar">
            <template v-if="modelValue.start">
                <template v-if="modelValue.end">
                    {{ df.format(modelValue.start.toDate(getLocalTimeZone())) }} - {{
                        df.format(modelValue.end.toDate(getLocalTimeZone())) }}
                </template>

                <template v-else>
                    {{ df.format(modelValue.start.toDate(getLocalTimeZone())) }}
                </template>
            </template>
            <template v-else>
                Selecciona una fecha
            </template>
        </UButton>

        <template #content>

            <UCalendar :ui="{
                heading: 'px-2'
            }" :model-value="modelValue" @update:model-value="onUpdateRange" class="p-2" range locale="es">

            </UCalendar>

        </template>
    </UPopover>
</template>
