<template>
    <DataState
     :error="attendance.details.isError"
     :loading="attendance.details.loading"
     @retry="getAttendanceDetails()"
     error-message="No se pudo cargar los detalles diarios"
    >

        <UTable ref="table" v-model:global-filter="attendance.globalFilter" :data="dailyReportList" :columns="columns"
            v-model:pagination="pagination" :pagination-options="{
                getPaginationRowModel: getPaginationRowModel()
            }" />


    </DataState>
    <div class="flex items-center justify-between p-4">

        <div class="text-sm text-gray-600 dark:text-gray-400">
            Mostrando <span class="font-medium">1</span> - <span class="font-medium">1</span>
            de <span class="font-medium">2</span> registros
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


import { h, resolveComponent } from 'vue'
import { getPaginationRowModel, type Column } from '@tanstack/vue-table';
import type { TableColumn } from '@nuxt/ui'
import DataState from '../common/DataState.vue';
import { useAttendanceReportStore, } from '~/store/useAttendanceReportStore';
import { type AttendanceDetails } from '~/composables/useAttendanceReport';
const store = useAttendanceReportStore()
const { getEmployeesByDepartment, getAttendanceDetails } = store;
const { department, employee, attendance } = storeToRefs(store)


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
    console.log(attendance.value.details.list.length)
    if (attendance.value.details.list.length) return;
    getAttendanceDetails();
})

const UBadge = resolveComponent('UBadge')

type Payment = {
    id: string
    date: string
    status: 'paid' | 'failed' | 'refunded'
    email: string
    amount: number
}

const data = ref<Payment[]>([
    {
        id: '4600',
        date: '2024-03-11T15:30:00',
        status: 'paid',
        email: 'james.anderson@example.com',
        amount: 594
    },
    {
        id: '4599',
        date: '2024-03-11T10:10:00',
        status: 'failed',
        email: 'mia.white@example.com',
        amount: 276
    },
    {
        id: '4598',
        date: '2024-03-11T08:50:00',
        status: 'refunded',
        email: 'william.brown@example.com',
        amount: 315
    },
    {
        id: '4597',
        date: '2024-03-10T19:45:00',
        status: 'paid',
        email: 'emma.davis@example.com',
        amount: 529
    },
    {
        id: '4596',
        date: '2024-03-10T15:55:00',
        status: 'paid',
        email: 'ethan.harris@example.com',
        amount: 639
    }
])

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
        accessorKey: 'lastname',
        header: ({ column }) => sortColumButton(column, 'Apellidos'),
        cell: ({ row }) => `${row.getValue('lastname')}`
    },
    {
        accessorKey: 'firstname',
        header: ({ column }) => sortColumButton(column, 'Nombres'),
        cell: ({ row }) => `${row.getValue('firstname')}`
    },
    {
        accessorKey: 'department',
        header: ({ column }) => sortColumButton(column, 'Departamento'),
        cell: ({ row }) => `${row.getValue('department')}`
    },
    {
        accessorKey: 'company',
        header: ({ column }) => sortColumButton(column, 'Empresa'),
        cell: ({ row }) => `${row.getValue('company')}`
    },
    {
        accessorKey: 'date',
        header: ({ column }) => sortColumButton(column, 'Fecha'),
        cell: ({ row }) => `${row.getValue('date')}`
    },
    {
        accessorKey: 'check-in',
        header: ({ column }) => sortColumButton(column, 'H. Ingreso'),
        cell: ({ row }) => `${row.getValue('check-in')}`
    },
    {
        accessorKey: 'check-out',
        header: ({ column }) => sortColumButton(column, 'H. Salida'),
        cell: ({ row }) => `${row.getValue('check-out')}`
    },

    {
        accessorKey: 'mark-check-in',
        header: ({ column }) => sortColumButton(column, 'M. Ingreso'),
        cell: ({ row }) => `${row.getValue('mark-check-in')}`
    },
    {
        accessorKey: 'mark-check-out',
        header: ({ column }) => sortColumButton(column, 'M. Salida'),
        cell: ({ row }) => `${row.getValue('check-out')}`
    },

    {
        accessorKey: 'tardy',
        header: ({ column }) => sortColumButton(column, 'Tardanza'),
        cell: ({ row }) => `${row.getValue('tardy')}`
    },
    {
        accessorKey: 'work-time',
        header: ({ column }) => sortColumButton(column, 'T. Trabajado'),
        cell: ({ row }) => `${row.getValue('work-time')}`
    },
]


</script>
