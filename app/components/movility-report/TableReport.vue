<template>
    <UTable sticky     :loading="loading" :ui="{
        th: 'px-1',
        td: 'px-1'
    }" :data="movilityReportList" :columns="columns" class="flex-1 h-[60vh]">


        <template #empty>
            <div v-if="error" class="w-full flex gap-4 justify-center items-center text-center">
                <Icon name="lucide:alert-triangle" class="text-red-500" size="20" />

                <h2 class="text-sm font-semibold  text-red-600">
                    No se pudo cargar el reporte de movilidad
                </h2>

                <UButton color="error" variant="link" icon="i-lucide-refresh-cw" class="cursor-pointer" @click="refresh"
                    :loading="loading" />
            </div>

            <div v-else class="flex flex-col items-center justify-center p-6">
                <UIcon name="i-lucide-inbox" size="48" class="mb-4 text-gray-400" />
                <p class="text-gray-500">No se encontraron registros para los criterios seleccionados.</p>
            </div>
        </template>

        <template v-for="{ day, isHoliday, number, date } in daysFromMonth" #[`${date}-header`]>
            <div class="flex p-1 rounded flex-col mx-auto text-xs w-full items-center" :class="{
                'bg-red-500/20 border border-red-500/30': isHoliday,
                'bg-blue-500/20 border border-blue-500/30': day === 'D'
            }">
                <span class="text-xs">
                    {{ day }}
                </span>
                <span class="text-xs font-medium">
                    {{ number }}
                </span>
            </div>
        </template>

        <template v-for="{ day, isHoliday, date } in daysFromMonth" #[`${date}-cell`]="{ row }">
            <div class="flex items-center justify-center w-full h-full" :class="{
                'bg-red-500/20': isHoliday,
                'bg-blue-500/20': day === 'D'
            }">


                <UBadge class="text-sm" color="undefined" :class="getCodeOp(row.original[date]?.code).bg">

                    {{ getCodeOp(row.original[date]?.code).value }}

                </UBadge>
            </div>
        </template>

        <template #employee-cell="{ row }">
            <div class="flex items-center gap-3 max-w-fit">

                <UUser :name="row.original.employee.last_name" :description="row.original.employee.first_name" :avatar="{
                    alt: row.original.employee.first_name,

                }" />

                <!-- @click="copy(row.original.email)" -->
                <UButton icon="i-lucide-eye" variant="link" size="sm" class="ml-auto cursor-pointer"
                    @click="open = true, $emit('select:movility-report', row.original)" />
            </div>
        </template>
    </UTable>




    <!-- <div class="flex items-center justify-between p-4">

        <div class="text-sm text-gray-600 dark:text-gray-400">
            Mostrando <span class="font-medium">{{ getStats().start }}</span> - <span class="font-medium">{{
                getStats().end }}</span>
            de <span class="font-medium">{{ getStats().total }}</span> registros
        </div>
        <div class="flex justify-end border-t border-default">
            <UPagination :page="(table?.tableApi?.getState().pagination.pageIndex || 0) + 1"
                :items-per-page="table?.tableApi?.getState().pagination.pageSize"
                :total="table?.tableApi?.getFilteredRowModel().rows.length"
                @update:page="(p) => table?.tableApi?.setPageIndex(p - 1)" />
        </div>
    </div> -->
</template>

<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui';
import { type Column } from '@tanstack/vue-table';
import { eachDayOfInterval, format } from 'date-fns';
import { es, se } from 'date-fns/locale';
import { getCodeOp, type MovilityReport } from '~/interfaces/movility-report';


const open = defineModel('open', {
    type: Boolean,
    required: true
})

const { rangeDate, searchTerm } = defineProps<{
    rangeDate: {
        start: Date,
        end: Date
    },
    searchTerm: string
}>()

defineEmits<{
    (e: 'select:movility-report', movilityReport: MovilityReport): void
}>()



const holidays = ref<string[]>();

// const datesArray = eachDayOfInterval(rangeDate);
const currentYear = computed(() => format(rangeDate.start, 'yyyy'));
const currentMonth = computed(() => format(rangeDate.start, 'MM'));


const {
    data, pending: loading, error, refresh } = await useFetch<MovilityReport[]>('/daily-records/monthly-summary', {
        method: 'POST',
        $fetch: useNuxtApp().$api,
        body: computed(() => ({
            year: Number(currentYear.value),
            month: Number(currentMonth.value)
        })
        ),
        default: () => [],




        watch: [currentYear, currentMonth],
    });

    

const movilityReportList = computed<MovilityReport[]>(() => {
    let filtered = data.value;

    if (searchTerm) {
        const term = searchTerm.toLowerCase().trim();
        filtered = filtered.filter(item =>
            item.employee.first_name.toLowerCase().includes(term) ||
            item.employee.last_name.toLowerCase().includes(term) ||
            item.employee.position_name.toLowerCase().includes(term)
            //  ||item.provincia.toLowerCase().includes(term) 
            //  || item.empresa.toLowerCase().includes(term)
        );
    }

    return filtered;
})


const daysFromMonth = computed(() => eachDayOfInterval(rangeDate).map((date) => ({
    date: format(date, 'yyyy-MM-dd'),
    day: format(date, 'eee', {
        locale: es
    }).toUpperCase().slice(0, 1),
    number: format(date, 'dd', {
        locale: es
    }),
    isHoliday: holidays.value?.some(holiday => {
        const onlyDate = format(date, 'yyyy-MM-dd');
        return onlyDate === holiday
    }) || false
})));



type Holiday = {
    date: string
    localName: string
    name: string
    countryCode: string
    fixed: boolean
    global: boolean
    counties: string[] | null
    launchYear: number | null
    types: string[]
}




watch(currentYear, async (year) => {
    const res = await $fetch<Holiday[]>(`https://date.nager.at/api/v4/PublicHolidays/${year}/PE`);
    holidays.value = res.map(d => d.date);
}, {
    immediate: true
})


const UButton = resolveComponent('UButton');

const columns = computed<TableColumn<MovilityReport>[]>(() => {
    const base: TableColumn<MovilityReport>[] = [
        { accessorKey: 'employee.id', header: '#' },
        { accessorKey: 'employee', header: ({ column }) => getHeader(column, 'Empleado', 'left') },
        { accessorKey: 'employee.position_name', header: ({ column }) => getHeader(column, 'Cargo', 'left') },
        { accessorKey: 'fechaIngreso', header: 'F. Ingreso' },
        { accessorKey: 'movilidad', header: 'Movilidad' },
        { accessorKey: 'provincia', header: 'Provincia' },
        { accessorKey: 'empresa', header: 'Empresa' },

        // { accessorKey: 'debug_details', header: 'Sede' },
        { accessorKey: 'summary.total_days', header: 'Total' },
        { accessorKey: 'summary.vacation_days', header: 'Vacaciones' },
        { accessorKey: 'summary.no_mark_days', header: 'No Marco' },
        { accessorKey: 'summary.days_with_mobility', header: 'DM' },
        // { accessorKey: 'summary.days_without_mobility', header: 'DSM' },
        // { accessorKey: 'summary.days_on_leave', header: 'DL' },
        // { accessorKey: 'summary.days_worked_remotely', header: 'DTR' },
    ]

    // FORZAR reevaluación
    const days = daysFromMonth.value

    const dynamicCols = days.map(({ day, number, date }) => ({
        accessorKey: date,
        header: `${day} ${number}`,

    }))



    return [...base.slice(0, 7), ...dynamicCols, ...base.slice(7)]
    // return [...base]
})


function getHeader(column: Column<any>, label: string, position: 'left' | 'right') {
    const isPinned = column.getIsPinned()

    return h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        label,
        icon: isPinned ? 'i-lucide-pin-off' : 'i-lucide-pin',
        class: '-mx-2.5',
        onClick() {
            column.pin(isPinned === position ? false : position)
        }
    })
}
</script>