<template>
  <DataState :loading="dailyTakenAttendaces.loading" :error="dailyTakenAttendaces.isError"
    error-message="No se pudo cargar los reportes de hoy" @retry="getDailyTakenAttendances">

    <div class="flex gap-2 mb-4">
  <UInput
    icon="i-lucide-search"
    v-model="dailyTakenAttendaces.globalFilter"
    class="w-full"
    placeholder="Buscar por nombre, apellido o DNI..."
  />

<UButton
  variant="solid"
  icon="i-lucide-file-spreadsheet"
  class="
    whitespace-nowrap
    bg-green-500
    hover:bg-green-600
    active:bg-green-700
    text-white
  "
>
  Exportar Excel
</UButton>




</div>


    <UTable ref="table" :data="dailyListAttendaces" :columns="columns" class="shrink-0" :ui="{
      base: 'table-fixed border-separate border-spacing-0',
      thead: '[&>tr]:bg-elevated/50 [&>tr]:after:content-none',
      tbody: `
  [&>tr:nth-child(even)]:bg-gray-50
  dark:[&>tr:nth-child(even)]:bg-gray-900
  [&>tr:hover]:bg-primary-50
  dark:[&>tr:hover]:bg-primary-900/20
`,

      th: 'first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r',
      td: 'border-b border-default'
    }" :loading="dailyTakenAttendaces.loading" empty="No se encontraron reportes de hoy"
      v-model:pagination="dailyTakenAttendaces.pagination" :pagination-options="{
        getPaginationRowModel: getPaginationRowModel()
      }" />


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
  </DataState>
</template>


<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui';
import { getPaginationRowModel } from '@tanstack/vue-table';
import { parse } from 'date-fns';
import { h, resolveComponent } from 'vue';
import DataState from '~/components/common/DataState.vue';
import { useAttendanceReportStore } from '~/store/useAttendanceReportStore';

const store = useAttendanceReportStore();
const { getDailyTakenAttendances } = store;
const { attendance } = storeToRefs(store);


const dailyTakenAttendaces = computed(() => attendance.value.taken.daily);

const dailyListAttendaces = computed<TakenAttendace[]>(() => {
  let reportList: TakenAttendace[] = dailyTakenAttendaces.value.list;


  if (dailyTakenAttendaces.value.globalFilter) {
    const search = dailyTakenAttendaces.value.globalFilter.toLowerCase().trim()

    reportList = reportList.filter(atten => {
      const nombre = (atten.Nombres || "").toLowerCase()
      const apellido = (atten.Apellidos || "").toLowerCase()
      const dni = (atten.DNI || "").toString().toLowerCase()

      return (
        nombre.includes(search) ||
        apellido.includes(search) ||
        dni.includes(search)
      )
    })
  }


  return reportList;
})

const table = useTemplateRef('table')

const UBadge = resolveComponent('UBadge')



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


const columns: TableColumn<TakenAttendace>[] = [
  {
    accessorKey: 'DNI',
    header: ({ column }) => sortColumButton(column, 'DNI'),
    cell: ({ row }) => row.getValue('DNI')
  },
  {
    accessorKey: 'Apellidos',
    header: ({ column }) => sortColumButton(column, 'Apellidos'),
    cell: ({ row }) =>
      h('span', { class: 'font-medium text-gray-900 dark:text-gray-100' }, row.getValue('Apellidos'))

  },
  {
    accessorKey: 'Nombres',
    header: ({ column }) => sortColumButton(column, 'Nombres'),
    cell: ({ row }) => row.getValue('Nombres')
  },
  {
    accessorKey: 'Departamento',
    header: ({ column }) => sortColumButton(column, 'Departamento'),
    cell: ({ row }) => row.getValue('Departamento')
  },
  {
    accessorKey: 'Empresa',
    header: ({ column }) => sortColumButton(column, 'Empresa'),
    cell: ({ row }) =>
      h('span', { class: 'text-sm text-gray-500' }, row.getValue('Empresa'))

  },
  {
    accessorKey: 'Horario',
    header: ({ column }) => sortColumButton(column, 'Horario'),
    cell: ({ row }) => row.getValue('Horario') || h(UBadge, { class: 'capitalize', variant: 'subtle', color: 'info' }, () =>
      'Sin horario'
    )
  },
  {
    accessorKey: 'Ingreso',
    header: ({ column }) => sortColumButton(column, 'Ingreso'),
    cell: ({ row }) => {
      const ingreso = row.getValue('Ingreso') as string | null

      if (!ingreso) {
        return h(
          UBadge,
          { variant: 'subtle', color: 'info' },
          () => 'Sin ingreso'
        )
      }

      const horario = row.getValue('Horario') as string | null

      if (!horario) {
        return h(
          UBadge,
          { variant: 'subtle', color: 'neutral' },
          () => ingreso
        )
      }

      const hIngreso = parse(ingreso, 'HH:mm:ss', new Date())
      const hHorario = parse(horario, 'HH:mm:ss', new Date())

      const isLate = hIngreso > hHorario

      return h(
        UBadge,
        {
          variant: 'subtle',
          color: isLate ? 'error' : 'success',
          class: 'inline-flex items-center gap-1 whitespace-nowrap',
          title: isLate ? 'Ingreso fuera de horario' : 'Ingreso a tiempo'
        },
        () => [
          h(UIcon, {
            name: isLate ? 'i-lucide-alert-circle' : 'i-lucide-check-circle',
            class: 'w-4 h-4'
          }),
          ingreso
        ]
      )


    }
  },

  {
  accessorKey: 'Salida',
  header: ({ column }) => sortColumButton(column, 'Salida'),
  cell: ({ row }) => {
    const salida = row.getValue('Salida') as string | null

    if (!salida) {
      return h(
        UBadge,
        {
          variant: 'subtle',
          color: 'info',
          class: 'inline-flex items-center gap-1 whitespace-nowrap',
          title: 'Aún no registra salida'
        },
        () => [
          h(UIcon, {
            name: 'i-lucide-clock',
            class: 'w-4 h-4'
          }),
          'Sin salida'
        ]
      )
    }

    return h(
      UBadge,
      {
        variant: 'subtle',
        color: 'neutral',
        class: 'inline-flex items-center gap-1 whitespace-nowrap',
        title: 'Hora de salida registrada'
      },
      () => [
        h(UIcon, {
          name: 'i-lucide-log-out',
          class: 'w-4 h-4'
        }),
        salida
      ]
    )
  }
}
,
]
</script>
