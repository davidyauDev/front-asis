<template>
    <DataState :error="attendance.details.isError" :loading="attendance.details.loading" @retry="getAttendanceDetails()"
        error-message="No se pudo cargar los detalles diarios">

        <div class="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800">
            <UTable
                ref="table"
                :data="dailyReportList"
                :columns="columns"
                :loading="attendance.details.loading"
                empty="Sin registro diario"
                :ui="{
                    base: 'min-w-full table-fixed border-separate border-spacing-0',
                    root: 'relative max-h-[calc(100vh-300px)] overflow-y-auto overflow-x-hidden',
                    thead: 'sticky top-0 z-10 bg-[#2d5fc0] text-white border-b border-[#244ea4]',
                    th: `
                        px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-white
                    `,
                    td: `
                        px-4 py-3 text-sm
                        text-gray-900 dark:text-gray-100
                    `,
                    tbody: `
                        [&>tr]:transition-colors
                        [&>tr:hover]:bg-[#f7f9ff]
                        dark:[&>tr:hover]:bg-gray-900/60
                    `,
                }"
            />
        </div>

    </DataState>
    <div class="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        <p class="text-sm text-gray-500 dark:text-gray-400">
            <span class="font-medium text-gray-900 dark:text-gray-100">{{ dailyReportList.length }}</span>
            {{ dailyReportList.length === 1 ? 'registro' : 'registros' }}
        </p>
    </div>
</template>

<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import { h, resolveComponent, computed, ref } from 'vue'
import DataState from '~/components/common/DataState.vue'
import { type AttendanceDetails } from '~/composables/useAttendanceReport'
import { useAttendanceReportStore } from '~/store/useAttendanceReportStore'

const store = useAttendanceReportStore()
const { getAttendanceDetails } = store
const { employee, attendance } = storeToRefs(store)

const table = useTemplateRef('table')

// Filtrado optimizado con computed
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
    class: '-mx-2.5 text-[11px] font-semibold uppercase tracking-wider text-white hover:text-white',
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
  {
    accessorKey: 'fecha',
    header: ({ column }) => sortColumButton(column, 'Fecha'),
    cell: ({ row }) => {
      const raw = row.getValue('fecha')
      if (!raw) return h('span', { class: 'text-xs text-gray-400 italic' }, 'Sin fecha')

      const [y, m, d] = String(raw).split('-').map(Number)
      const date = new Date(y, (m || 1) - 1, d || 1)

      const fecha = new Intl.DateTimeFormat('es-PE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(date)

      return h('span', { class: 'text-sm font-semibold text-gray-900 dark:text-gray-100' }, fecha)
    }
  },
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

