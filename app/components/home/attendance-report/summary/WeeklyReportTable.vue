<template>

    <DataState :error="attendance.summary.isError" :loading="attendance.summary.loading"
        error-message="No se pudó cagar el reporte semanal" @retry="getAttendanceSummary">

        <!-- Tabla -->
        <div class="overflow-x-auto">
            <UTable
                sticky
                :data="weeklyReportList"
                :columns="columns"
                ref="table"
                :loading="attendance.summary.loading"
                empty="Sin registro semanal"
                :ui="{
                    base: 'w-full',
                    wrapper: 'max-h-[calc(100vh-350px)] overflow-y-auto relative',
                    thead: 'sticky top-0 z-10 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800',
                    th: 'p-0 w-1',
                    td: 'p-0',
                    tbody: `
                        [&>tr]:transition-colors
                        [&>tr:hover]:bg-gray-50
                        dark:[&>tr:hover]:bg-gray-900/50
                    `,
                }"
            />
        </div>

    </DataState>

    <!-- Info de registros -->
    <div class="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        <p class="text-sm text-gray-500 dark:text-gray-400">
            <span class="font-medium text-gray-900 dark:text-gray-100">{{ weeklyReportList.length }}</span>
            {{ weeklyReportList.length === 1 ? 'registro' : 'registros' }}
        </p>
    </div>

</template>

<script setup lang="ts">

import TableCellUserFieldsGroup from './TableCellUserFieldsGroup.vue';
import TableHeaderUserFieldsGroup from './TableHeaderUserFieldsGroup.vue';
import TableHeaderWeekGroup from './TableHeaderWeekGroup.vue';
import TableCellWeekGroup from './TableCellWeekGroup.vue';

import type { TableColumn } from '@nuxt/ui';
import { h, computed, ref } from 'vue';
import { useAttendanceReportStore } from '~/store/useAttendanceReportStore';
import DataState from '~/components/common/DataState.vue';


const store = useAttendanceReportStore()
const { getAttendanceSummary } = store;
const { employee, week, attendance } = storeToRefs(store)

const table = useTemplateRef('table')

onMounted(() => {
    if (attendance.value.summary.list.length) return;
    getAttendanceSummary()
})

const weeklyReportList = computed(() => {
    let reportList: AttendanceSummary[] = attendance.value.summary.list;

    const selectedEmployees = employee.value.department.selecteds

    if (selectedEmployees.length) {
        const codeSet = new Set(selectedEmployees.map(e => e.emp_code))
        reportList = reportList.filter(atten =>
            codeSet.has(atten.dni)
        )
    }

    // if

    if (attendance.value.globalFilter) {
        const search = attendance.value.globalFilter.toLowerCase().trim()

        reportList = reportList.filter(atten => {
            const nombre = (atten.nombres || "").toLowerCase()
            const apellido = (atten.apellidos || "").toLowerCase()
            const dni = (atten.dni || "").toString().toLowerCase()

            return (
                nombre.includes(search) ||
                apellido.includes(search) ||
                dni.includes(search)
            )
        })
    }


    return reportList;
})



const columns = computed<TableColumn<AttendanceSummary>[]>(() => [
    // ==== COLUMNA 1: PERÍODO ====
    {
        accessorKey: 'user-fieds',
        id: 'user-fieds',
        header: () =>
            h(
                TableHeaderUserFieldsGroup
            ),
        cell: (row) => {
            return h(
                TableCellUserFieldsGroup, {
                attendance: row.cell.row.original
            }
            );
        }
    },
    ...getDinamickWeeks.value,
    {
        accessorKey: 'totals',
        id: 'totas',
        header: () =>
            h(
                TableHeaderWeekGroup, {
                week: 'TOTALES',
                gradiantBackgroundColor: 'from-slate-600 to-slate-700',
                firstBackgroundColor: 'bg-slate-100',
                secondBackgroundColor: 'bg-slate-50',
                firstColor: 'text-slate-700',
                secondColor: 'text-slate-800'
            }
            ),

        cell: (row) => {
            const attendance = row.cell.row.original;

            return h(
                TableCellWeekGroup, {
                attendance: totalAttendance(attendance),
                firstBackgroundColor: 'bg-slate-100',
                secondBackgroundColor: 'bg-slate-50',
                firstColor: 'text-slate-700',
                secondColor: 'text-slate-800'


            }
            );
        }
    },

]);



const totalAttendance = (attendance: AttendanceSummary): { delay: string, worked: string } => {
    const selectedWeeks = week.value.selecteds;
    const delayArray = [{
        id: '1',
        delay: attendance.s1_tardanza,
        worked: attendance.s1_trabajadas
    }, {
        id: '2',
        delay: attendance.s2_tardanza,
        worked: attendance.s2_trabajadas
    }, {
        id: '3',
        delay: attendance.s3_tardanza,
        worked: attendance.s3_trabajadas
    }, {
        id: '4',
        delay: attendance.s4_tardanza,
        worked: attendance.s4_trabajadas
    }];
    const getDinamicTotal = delayArray.filter(header =>
        selectedWeeks.some(week => Number(week.id) === Number(header.id))
    );
    return {
        delay: sumTimes(...getDinamicTotal.map((d) => d.delay)),
        worked: sumTimes(...getDinamicTotal.map((d) => d.worked))
    }
}

function sumTimes(...res: (string | null)[]) {
    // Convertir todo a segundos
    let totalSegundos = 0;

    for (const timeStr of res) {
        const [h = 0, m = 0, s = 0] = (timeStr || '').split(':').map(Number);
        totalSegundos += h * 3600 + m * 60 + s;
    }

    // Convertir de vuelta a H:M:S
    const horas = Math.floor(totalSegundos / 3600);
    const minutos = Math.floor((totalSegundos % 3600) / 60);
    const segundos = totalSegundos % 60;

    // Formatear con ceros
    return [
        horas.toString().padStart(2, '0'),
        minutos.toString().padStart(2, '0'),
        segundos.toString().padStart(2, '0')
    ].join(':');
}


const getDinamickWeeks = computed(() => {
    const selectedWeeks = week.value.selecteds;


    return headerWeeks.filter(header =>
        selectedWeeks.some(week => Number(week.id) === Number(header.id))
    );
});

const headerWeeks: TableColumn<AttendanceSummary>[] = [
    {

        accessorKey: '1',
        id: '1',
        header: () =>
            h(
                TableHeaderWeekGroup, {
                week: '1era Semana',
                gradiantBackgroundColor: 'from-rose-500 to-rose-600',
                date: attendance.value.summary.weeks.s1,
                firstBackgroundColor: 'bg-rose-100',
                secondBackgroundColor: 'bg-rose-50',
                firstColor: 'text-rose-700',
                secondColor: 'text-rose-800'
                
            }
            ),
        cell: (row) => {
            const attendance = row.cell.row.original;
            return h(
                TableCellWeekGroup, {
                attendance: {
                    delay: attendance.s1_tardanza,
                    worked: attendance.s1_trabajadas
                },
                firstBackgroundColor: 'bg-rose-100',
                secondBackgroundColor: 'bg-rose-50',
                firstColor: 'text-rose-700',
                secondColor: 'text-rose-800'


            }
            );
        }

    },

    {
        accessorKey: '2',
        id: '2',
        header: () =>
            h(
                TableHeaderWeekGroup, {
                week: '2da Semana',
                gradiantBackgroundColor: 'from-amber-500 to-amber-600',
                date: attendance.value.summary.weeks.s2,
                firstBackgroundColor: 'bg-amber-100',
                secondBackgroundColor: 'bg-amber-50',
                firstColor: 'text-amber-700',
                secondColor: 'text-amber-800'
            }
            ),

        cell: (row) => {
            const attendance = row.cell.row.original;
            return h(
                TableCellWeekGroup, {
                attendance: {
                    delay: attendance.s2_tardanza,
                    worked: attendance.s2_trabajadas
                },
                firstBackgroundColor: 'bg-amber-100',
                secondBackgroundColor: 'bg-amber-50',
                firstColor: 'text-amber-700',
                secondColor: 'text-amber-800'


            }
            );
        }
    },

    {
        accessorKey: '3',
        id: '3',
        header: () =>
            h(
                TableHeaderWeekGroup, {
                week: '3ra Semana',
                gradiantBackgroundColor: 'from-emerald-500 to-emerald-600',
                date: attendance.value.summary.weeks.s3,
                firstBackgroundColor: 'bg-emerald-100',
                secondBackgroundColor: 'bg-emerald-50',
                firstColor: 'text-emerald-700',
                secondColor: 'text-emerald-800'
            }
            ),
        cell: (row) => {
            const attendance = row.cell.row.original;
            return h(
                TableCellWeekGroup, {
                attendance: {
                    delay: attendance.s3_tardanza,
                    worked: attendance.s3_trabajadas
                },
                firstBackgroundColor: 'bg-emerald-100',
                secondBackgroundColor: 'bg-emerald-50',
                firstColor: 'text-emerald-700',
                secondColor: 'text-emerald-800'


            }
            );
        }
    },

    {
        accessorKey: '4',
        id: '4',
        header: () =>
            h(
                TableHeaderWeekGroup, {
                week: '4ta Semana',
                gradiantBackgroundColor: 'from-fuchsia-500 to-fuchsia-600',
                date: attendance.value.summary.weeks.s4,
                firstBackgroundColor: 'bg-fuchsia-100',
                secondBackgroundColor: 'bg-fuchsia-50',
                firstColor: 'text-fuchsia-700',
                secondColor: 'text-fuchsia-800'
            }
            ),
        cell: (row) => {
            const attendance = row.cell.row.original;
            return h(
                TableCellWeekGroup, {
                attendance: {
                    delay: attendance.s4_tardanza,
                    worked: attendance.s4_trabajadas
                },
                firstBackgroundColor: 'bg-fuchsia-100',
                secondBackgroundColor: 'bg-fuchsia-50',
                firstColor: 'text-fuchsia-700',
                secondColor: 'text-fuchsia-800'


            }
            );
        }
    },
]


</script>

<style>
/* Ajustar ancho fijo por columna en UTable */
.ut-table th,
.ut-table td {
    white-space: nowrap;
}
</style>
