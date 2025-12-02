<template>
    <DataState :error="attendance.details.isError" :loading="attendance.details.loading" @retry="getAttendanceDetails()"
        error-message="No se pudo cargar los detalles diarios">

        <UTable ref="table" :data="dailyReportList" :columns="columns" v-model:pagination="pagination"
            :pagination-options="{
                getPaginationRowModel: getPaginationRowModel()
            }" empty="Sin registro diario" />

    </DataState>
    <div class="flex items-center justify-between p-4">

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
    </div>
</template>

<script setup lang="ts">


import type { TableColumn } from '@nuxt/ui';
import { getPaginationRowModel } from '@tanstack/vue-table';
import { h, resolveComponent } from 'vue';
import { type AttendanceDetails } from '~/composables/useAttendanceReport';
import { useAttendanceReportStore, } from '~/store/useAttendanceReportStore';
import DataState from '../common/DataState.vue';
const store = useAttendanceReportStore()
const { getAttendanceDetails } = store;
const { employee, attendance } = storeToRefs(store)


const pagination = ref({
    pageIndex: 0,
    pageSize: 10
})


const table = useTemplateRef('table')


const dailyReportList = computed(() => {
    let reportList: AttendanceDetails[] = attendance.value.details.list;

    const selectedEmployees = employee.value.department.selecteds

    if (selectedEmployees.length) {
        const codeSet = new Set(selectedEmployees.map(e => e.emp_code))
        reportList = reportList.filter(atten =>
            codeSet.has(atten.dni)
        )
    }

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


onMounted(() => {
    if (attendance.value.details.list.length) return;
    getAttendanceDetails();
})

const getStats = () => {
    const pageIndex = table?.value?.tableApi?.getState().pagination.pageIndex || 0;
    const pageSize = table?.value?.tableApi?.getState().pagination.pageSize || 10;
    const total = table?.value?.tableApi?.getFilteredRowModel().rows.length || 0;

    const start = total === 0 ? 0 : pageIndex * pageSize + 1;
    const end = Math.min((pageIndex + 1) * pageSize, total);
    return {
        total,
        end,
        start
    }
}

const UBadge = resolveComponent('UBadge')

const UButton = resolveComponent('UButton');

const sortColumButton = (column: any, label: string) => {
    const isSorted = column.getIsSorted();
    return h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        label,
        icon: isSorted
            ? isSorted === 'asc'
                ? 'i-lucide-arrow-up-narrow-wide'
                : 'i-lucide-arrow-down-wide-narrow'
            : 'i-lucide-arrow-up-down',
        class: '-mx-2.5',
        onClick: () => column.toggleSorting(column.getIsSorted() === 'asc')
    })
}

const columns: TableColumn<AttendanceDetails>[] = [
    {
        accessorKey: 'dni',
        // header: 'DNI',
        header: ({ column }) => sortColumButton(column, 'DNI'),
        cell: ({ row }) => `${row.getValue('dni')}`
    },
    {
        accessorKey: 'apellidos',
        header: ({ column }) => sortColumButton(column, 'Apellidos'),
        cell: ({ row }) => `${row.getValue('apellidos')}`
    },
    {
        accessorKey: 'nombres',
        header: ({ column }) => sortColumButton(column, 'Nombres'),
        cell: ({ row }) => `${row.getValue('nombres')}`
    },
    {
        accessorKey: 'departamento',
        header: ({ column }) => sortColumButton(column, 'Departamento'),
        cell: ({ row }) => `${row.getValue('departamento')}`
    },
    {
        accessorKey: 'empresa',
        header: ({ column }) => sortColumButton(column, 'Empresa'),
        cell: ({ row }) => `${row.getValue('empresa')}`
    },
    {
        accessorKey: 'fecha',
        header: ({ column }) => sortColumButton(column, 'Fecha'),
        cell: ({ row }) => `${row.getValue('fecha')}`
    },
    {
        accessorKey: 'h_ingreso',
        header: ({ column }) => sortColumButton(column, 'H. Ingreso'),
        cell: ({ row }) => `${row.getValue('h_ingreso')}`
    },
    {
        accessorKey: 'h_salida',
        header: ({ column }) => sortColumButton(column, 'H. Salida'),
        cell: ({ row }) => `${row.getValue('h_salida')}`
    },

    {
        accessorKey: 'm_ingreso',
        header: ({ column }) => sortColumButton(column, 'M. Ingreso'),
        cell: ({ row }) => {
            const salida = row.getValue('m_ingreso')
            return salida || h(
                UBadge, {
                class: 'capitalize', variant: 'subtle', color: 'error'
            }, () => "No marco entrada"
            )
        }
    },
    {
        accessorKey: 'm_salida',
        header: ({ column }) => sortColumButton(column, 'M. Salida'),
        cell: ({ row }) => {
            const salida = row.getValue('m_salida')
            return salida || h(
                UBadge, {
                class: 'capitalize', variant: 'subtle', color: 'error'
            }, () => "No marco salida"
            )
        }
    },

    {
        accessorKey: 'tardanza',
        header: ({ column }) => sortColumButton(column, 'Tardanza'),
        cell: ({ row }) => {
            const tardanza = row.getValue('tardanza')
            return tardanza || h(
                UBadge, {
                class: 'capitalize', variant: 'subtle', color: 'info'
            }, () => "Sin tardanza"
            )
        }
    },
    {
        accessorKey: 'total_trabajado',
        header: ({ column }) => sortColumButton(column, 'T. Trabajado'),
        cell: ({ row }) => `${row.getValue('total_trabajado')}`
    },
]


</script>
