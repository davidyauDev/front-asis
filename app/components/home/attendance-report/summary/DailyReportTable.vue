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
import type { TableColumn } from '@nuxt/ui'
import { getPaginationRowModel } from '@tanstack/vue-table'
import { h, resolveComponent } from 'vue'
import DataState from '~/components/common/DataState.vue'
import { type AttendanceDetails } from '~/composables/useAttendanceReport'
import { useAttendanceReportStore } from '~/store/useAttendanceReportStore'

const store = useAttendanceReportStore()
const { getAttendanceDetails } = store
const { employee, attendance } = storeToRefs(store)

const pagination = ref({
  pageIndex: 0,
  pageSize: 10
})

const table = useTemplateRef('table')


const dailyReportList = computed(() => {
  let reportList: AttendanceDetails[] = attendance.value.details.list

  const selectedEmployees = employee.value.department.selecteds
  if (selectedEmployees.length) {
    const codeSet = new Set(selectedEmployees.map(e => e.emp_code))
    reportList = reportList.filter(r => codeSet.has(r.dni))
  }

  if (attendance.value.globalFilter) {
    const search = attendance.value.globalFilter.toLowerCase().trim()
    reportList = reportList.filter(r =>
      (r.nombres || '').toLowerCase().includes(search) ||
      (r.apellidos || '').toLowerCase().includes(search) ||
      r.dni.toString().includes(search)
    )
  }

  return reportList
})

onMounted(() => {
  if (!attendance.value.details.list.length) {
    getAttendanceDetails()
  }
})


const getStats = () => {
  const pageIndex = table?.value?.tableApi?.getState().pagination.pageIndex || 0
  const pageSize = table?.value?.tableApi?.getState().pagination.pageSize || 10
  const total = table?.value?.tableApi?.getFilteredRowModel().rows.length || 0

  return {
    start: total === 0 ? 0 : pageIndex * pageSize + 1,
    end: Math.min((pageIndex + 1) * pageSize, total),
    total
  }
}


const UBadge = resolveComponent('UBadge')
const UIcon = resolveComponent('UIcon')
const UButton = resolveComponent('UButton')

const sortColumButton = (column: any, label: string) =>
  h(UButton, {
    color: 'neutral',
    variant: 'ghost',
    label,
    icon: column.getIsSorted()
      ? column.getIsSorted() === 'asc'
        ? 'i-lucide-arrow-up-narrow-wide'
        : 'i-lucide-arrow-down-wide-narrow'
      : 'i-lucide-arrow-up-down',
    class: 'text-slate-400 hover:text-slate-700 -mx-2.5',
    onClick: () => column.toggleSorting(column.getIsSorted() === 'asc')
  })


const badge = (text: string, color: any, icon?: string) =>
  h(
    UBadge,
    { variant: 'subtle', color, class: 'inline-flex items-center gap-1 whitespace-nowrap' },
    () => [
      icon ? h(UIcon, { name: icon, class: 'w-4 h-4' }) : null,
      text
    ]
  )

const columns: TableColumn<AttendanceDetails>[] = [
  { accessorKey: 'dni', header: ({ column }) => sortColumButton(column, 'DNI') },
  { accessorKey: 'apellidos', header: ({ column }) => sortColumButton(column, 'Apellidos') },
  { accessorKey: 'nombres', header: ({ column }) => sortColumButton(column, 'Nombres') },
  { accessorKey: 'departamento', header: ({ column }) => sortColumButton(column, 'Departamento') },
  { accessorKey: 'empresa', header: ({ column }) => sortColumButton(column, 'Empresa') },
  { accessorKey: 'fecha', header: ({ column }) => sortColumButton(column, 'Fecha') },
  { accessorKey: 'h_ingreso', header: ({ column }) => sortColumButton(column, 'H. Ingreso') },
  { accessorKey: 'h_salida', header: ({ column }) => sortColumButton(column, 'H. Salida') },

  {
    accessorKey: 'm_ingreso',
    header: ({ column }) => sortColumButton(column, 'M. Ingreso'),
    cell: ({ row }) =>
      row.getValue('m_ingreso')
        ? badge(row.getValue('m_ingreso'), 'success', 'i-lucide-log-in')
        : badge('No marcó entrada', 'error', 'i-lucide-alert-circle')
  },
  {
    accessorKey: 'm_salida',
    header: ({ column }) => sortColumButton(column, 'M. Salida'),
    cell: ({ row }) =>
      row.getValue('m_salida')
        ? badge(row.getValue('m_salida'), 'neutral', 'i-lucide-log-out')
        : badge('No marcó salida', 'error', 'i-lucide-alert-circle')
  },
  {
    accessorKey: 'tardanza',
    header: ({ column }) => sortColumButton(column, 'Tardanza'),
    cell: ({ row }) =>
      row.getValue('tardanza')
        ? badge(row.getValue('tardanza'), 'warning', 'i-lucide-clock')
        : badge('Sin tardanza', 'success', 'i-lucide-check-circle')
  },
  {
    accessorKey: 'total_trabajado',
    header: ({ column }) => sortColumButton(column, 'T. Trabajado'),
    cell: ({ row }) => badge(row.getValue('total_trabajado'), 'info', 'i-lucide-timer')
  }
]
</script>

