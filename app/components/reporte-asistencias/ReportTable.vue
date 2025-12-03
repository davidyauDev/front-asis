<template>
  {{ employeeType }}
  <UTable :data="data" :columns="dinamicColumns" class="shrink-0" :ui="{
    base: 'table-fixed border-separate border-spacing-0',
    thead: '[&>tr]:bg-elevated/50 [&>tr]:after:content-none',
    tbody: '[&>tr]:last:[&>td]:border-b-0',
    th: 'first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r',
    td: 'border-b border-default'
  }" />
</template>


<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import type { Period, Range, Sale } from '~/types'
import { sub } from 'date-fns'
import { EmployeeType } from '~/store/useAttendanceReportStore';

const { employeeType } = defineProps<{
  employeeType: EmployeeType
}>()

const range = shallowRef<Range>({
  start: sub(new Date(), { days: 14 }),
  end: new Date()
})
const period = ref<Period>('daily')

const UBadge = resolveComponent('UBadge')



const sampleEmails = [
  'james.anderson@example.com',
  'mia.white@example.com',
  'william.brown@example.com',
  'emma.davis@example.com',
  'ethan.harris@example.com'
]

const { data } = await useAsyncData('sales', async () => {
  const sales: Sale[] = []
  const currentDate = new Date()

  for (let i = 0; i < 5; i++) {
    const hoursAgo = randomInt(0, 48)
    const date = new Date(currentDate.getTime() - hoursAgo * 3600000)

    sales.push({
      id: (4600 - i).toString(),
      date: date.toISOString(),
      status: randomFrom(['paid', 'failed', 'refunded']),
      email: randomFrom(sampleEmails),
      amount: randomInt(100, 1000)
    })
  }

  return sales.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}, {
  watch: [() => range.value.start, () => range.value.end],
  default: () => []
})

const UButton = resolveComponent('UButton');

const UIcon = resolveComponent('UIcon');

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

const dinamicColumns = computed<TableColumn<Sale>[]>(() => [...columns, ...(employeeType === EmployeeType.TECHNICIANS ? [...technicianColumns.value] : [])]);


const columns: TableColumn<Sale>[] = [
  {
    accessorKey: 'dni',
    header: ({ column }) => sortColumButton(column, 'DNI'),
    cell: ({ row }) => row.getValue('dni')
  },
  {
    accessorKey: 'apellidos',
    header: ({ column }) => sortColumButton(column, 'Apellidos'),
    cell: ({ row }) => row.getValue('apellidos')
  },
  {
    accessorKey: 'nombres',
    header: ({ column }) => sortColumButton(column, 'Nombres'),
    cell: ({ row }) => row.getValue('nombres')
  },
  {
    accessorKey: 'departamento',
    header: ({ column }) => sortColumButton(column, 'Departamento'),
    cell: ({ row }) => row.getValue('departamento')
  },
  {
    accessorKey: 'empresa',
    header: ({ column }) => sortColumButton(column, 'Empresa'),
    cell: ({ row }) => row.getValue('empresa')
  },
]

const technicianColumns = computed<TableColumn<Sale>[]>(() => ([{
  accessorKey: 'tipo',
  header: ({ column }) => sortColumButton(column, 'Tipo'),
  cell: ({ row }) => row.getValue('tipo')
}, {
  accessorKey: 'fecha',
  header: ({ column }) => sortColumButton(column, 'Fecha'),
  cell: ({ row }) => row.getValue('fecha')
}, {
  accessorKey: 'hora',
  header: ({ column }) => sortColumButton(column, 'Hora'),
  cell: ({ row }) => row.getValue('hora')
}, {
  accessorKey: 'direccion',
  header: ({ column }) => sortColumButton(column, 'Dirección'),
  cell: ({ row }) => row.getValue('direccion')
}, {
  accessorKey: 'mapa',
  header: ({ column }) => sortColumButton(column, 'Map'),
  // cell: ({ row }) => h(UIcon, {
  //   name: 
  // })
}]))
</script>
