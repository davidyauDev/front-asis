<template>
  <DataState :loading="dailyTakenAttendaces.loading" :error="dailyTakenAttendaces.isError"
    error-message="No se pudo cargar los reportes de hoy" @retry="getDailyTakenAttendances">


    <div class="
        flex flex-wrap items-center justify-between gap-3 p-4 mb-4
        rounded-lg
        bg-gray-50 dark:bg-gray-900
        border border-gray-200 dark:border-gray-800
      ">
      <UInput icon="i-lucide-search" v-model="dailyTakenAttendaces.globalFilter" class="w-full sm:max-w-sm"
        placeholder="Buscar por nombre, apellido o DNI..." />

      <UButton icon="i-lucide-file-spreadsheet" class="bg-green-600 hover:bg-green-700 text-white whitespace-nowrap">
        Exportar Excel
      </UButton>
    </div>

    <UTable ref="table" :data="dailyListAttendaces" :columns="columns" :loading="dailyTakenAttendaces.loading"
      empty="No se encontraron reportes de hoy" v-model:pagination="dailyTakenAttendaces.pagination"
      :pagination-options="{ getPaginationRowModel: getPaginationRowModel() }" :ui="{
        base: 'table-fixed border-separate border-spacing-y-1',
        thead: '[&>tr]:bg-transparent',
        th: `
          px-3 py-2 text-xs font-semibold uppercase tracking-wide
          text-gray-600 dark:text-gray-400
        `,
        td: `
          px-3 py-2 text-sm
          text-gray-800 dark:text-gray-200
        `,
        tbody: `
          [&>tr]:bg-white
          dark:[&>tr]:bg-gray-950
          [&>tr]:rounded-lg
          [&>tr:hover]:bg-primary-50
          dark:[&>tr:hover]:bg-primary-900/20
        `
      }" />

    <div class="
        flex flex-wrap items-center justify-between gap-3 p-4
        border-t border-gray-200 dark:border-gray-800
      ">
      <div class="text-xs text-gray-600 dark:text-gray-400">
        Mostrando
        <strong>{{ getStats().start }}</strong> –
        <strong>{{ getStats().end }}</strong>
        de
        <strong>{{ getStats().total }}</strong>
        registros
      </div>

      <UPagination :page="(table?.tableApi?.getState().pagination.pageIndex || 0) + 1"
        :items-per-page="table?.tableApi?.getState().pagination.pageSize"
        :total="table?.tableApi?.getFilteredRowModel().rows.length"
        @update:page="p => table?.tableApi?.setPageIndex(p - 1)" />
    </div>

  </DataState>
  <UAlert
  v-if="selectedRow?.Tardanza"
  color="warning"
  variant="subtle"
>
  Se detectó una tardanza. El tiempo fue calculado automáticamente.
</UAlert>

<UAlert
  v-else
  color="success"
  variant="subtle"
>
  No se detectó tardanza según el horario registrado.
</UAlert>

  <UModal v-model:open="isIncidenciaOpen" :title="modalTitle" :transition="true">
    <template #body>
      <div class="space-y-6">

  

  <!-- Detalle de la incidencia -->
  <section class="space-y-3">
    <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300">
      Detalle de la incidencia
    </h4>

    <UFormGroup label="Fecha">
      <UInput type="date" v-model="incidenciaForm.fecha" disabled />
    </UFormGroup>

    <UFormGroup label="Tiempo de tardanza">
      <UInput
        :model-value="`${incidenciaForm.minutosTardanza} minutos`"
        disabled
      />
    </UFormGroup>

    <UFormGroup
      label="Motivo"
      description="Describe brevemente la causa de la incidencia"
      required
    >
      <UTextarea
        v-model="incidenciaForm.motivo"
        placeholder="Ej. tráfico, transporte público, clima, etc."
        :rows="3"
      />
    </UFormGroup>
  </section>

</div>

    </template>

    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton variant="ghost" color="neutral" @click="isIncidenciaOpen = false">
          Cancelar
        </UButton>

        <UButton color="primary" :disabled="!incidenciaForm.motivo" @click="guardarIncidencia">
          Guardar incidencia
        </UButton>
      </div>
    </template>
  </UModal>


</template>

<script setup lang="ts">

import type { TableColumn } from '@nuxt/ui'
import { getPaginationRowModel } from '@tanstack/vue-table'
import { parse } from 'date-fns'
import DataState from '~/components/common/DataState.vue'
import { useAttendanceReportStore } from '~/store/useAttendanceReportStore'

const store = useAttendanceReportStore()
const { getDailyTakenAttendances } = store
const { attendance } = storeToRefs(store)

const dailyTakenAttendaces = computed(() => attendance.value.taken.daily)

const dailyListAttendaces = computed<TakenAttendace[]>(() => {
  let list = dailyTakenAttendaces.value.list

  if (dailyTakenAttendaces.value.globalFilter) {
    const search = dailyTakenAttendaces.value.globalFilter.toLowerCase().trim()

    list = list.filter(a => {
      const nombres = (a.Nombres || '').toLowerCase()
      const apellidos = (a.Apellidos || '').toLowerCase()
      const dni = (a.DNI || '').toString().toLowerCase()

      return (
        nombres.includes(search) ||
        apellidos.includes(search) ||
        dni.includes(search)
      )
    })
  }

  return list
})

const modalTitle = computed(() => {
  if (!selectedRow.value) return 'Incidencia'

  return `Incidencia – ${selectedRow.value.Apellidos} ${selectedRow.value.Nombres}`
})


const table = useTemplateRef('table')
const UBadge = resolveComponent('UBadge')
const UButton = resolveComponent('UButton')
const UIcon = resolveComponent('UIcon')
const UTooltip = resolveComponent('UTooltip')

const isIncidenciaOpen = ref(false)
const incidenciaForm = reactive({
  fecha: '',
  minutosTardanza: 0,
  motivo: ''
})


const selectedRow = ref<TakenAttendace | null>(null)


const openIncidenciaModal = (row: TakenAttendace) => {
  selectedRow.value = row

  incidenciaForm.fecha = new Date().toISOString().slice(0, 10)

  incidenciaForm.minutosTardanza = row.Tardanza
    ? calcularTardanza(row.Ingreso, row.Horario)
    : 0

  incidenciaForm.motivo = ''

  isIncidenciaOpen.value = true
}


const calcularTardanza = (
  ingreso: string | null,
  horario: string | null
): number => {
  if (!ingreso || !horario) return 0

  const ingresoDate = parse(ingreso, 'HH:mm:ss', new Date())
  const horarioDate = parse(horario, 'HH:mm:ss', new Date())

  if (ingresoDate <= horarioDate) return 0

  return Math.floor(
    (ingresoDate.getTime() - horarioDate.getTime()) / 60000
  )
}



const guardarIncidencia = () => {
  if (!selectedRow.value) return

  const payload = {
    dni: selectedRow.value.DNI,
    fecha: incidenciaForm.fecha,
    minutos: incidenciaForm.minutosTardanza,
    motivo: incidenciaForm.motivo
  }

  console.log('Incidencia a guardar:', payload)

  // aquí llamarías a tu API / store
  isIncidenciaOpen.value = false
}



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


const sortColumButton = (column: any, label: string) => {
  const isSorted = column.getIsSorted()
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
    onClick: () => column.toggleSorting(isSorted === 'asc')
  })
}




const columns: TableColumn<TakenAttendace>[] = [
  {
    accessorKey: 'DNI',
    header: ({ column }) => sortColumButton(column, 'DNI')
  },
  {
    accessorKey: 'Apellidos',
    header: ({ column }) => sortColumButton(column, 'Empleado'),
    cell: ({ row }) =>
      h('div', { class: 'flex flex-col' }, [
        h('span', { class: 'font-medium text-gray-900 dark:text-gray-100' }, row.getValue('Apellidos')),
        h('span', { class: 'text-xs text-gray-500 dark:text-gray-400' }, row.getValue('Nombres'))
      ])
  },
  {
    accessorKey: 'Departamento',
    header: ({ column }) => sortColumButton(column, 'Departamento')
  },
  {
    accessorKey: 'Empresa',
    header: ({ column }) => sortColumButton(column, 'Empresa'),
    cell: ({ row }) =>
      h('span', { class: 'text-sm text-gray-500 dark:text-gray-400' }, row.getValue('Empresa'))
  },
  {
    accessorKey: 'Horario',
    header: ({ column }) => sortColumButton(column, 'Horario'),
    cell: ({ row }) =>
      row.getValue('Horario') ||
      h(UBadge, { variant: 'subtle', color: 'info' }, () => 'Sin horario')
  },
  {
    accessorKey: 'Ingreso',
    header: ({ column }) => sortColumButton(column, 'Ingreso'),
    cell: ({ row }) => {
      const ingreso = row.getValue('Ingreso') as string | null
      const horario = row.getValue('Horario') as string | null

      if (!ingreso) {
        return h(UBadge, { variant: 'subtle', color: 'info' }, () => 'Sin ingreso')
      }

      if (!horario) {
        return h(UBadge, { variant: 'subtle', color: 'neutral' }, () => ingreso)
      }

      const isLate =
        parse(ingreso, 'HH:mm:ss', new Date()) >
        parse(horario, 'HH:mm:ss', new Date())

      return h(
        UBadge,
        {
          variant: 'subtle',
          color: isLate ? 'error' : 'success',
          class: 'inline-flex items-center gap-1 whitespace-nowrap'
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
          { variant: 'subtle', color: 'info', class: 'inline-flex gap-1' },
          () => [
            h(UIcon, { name: 'i-lucide-clock', class: 'w-4 h-4' }),
            'Sin salida'
          ]
        )
      }

      return h(
        UBadge,
        { variant: 'subtle', color: 'neutral', class: 'inline-flex gap-1' },
        () => [
          h(UIcon, { name: 'i-lucide-log-out', class: 'w-4 h-4' }),
          salida
        ]
      )
    }
  },
  {
  id: 'acciones',
  header: 'Acciones',
  cell: ({ row }) => {
  const hasTardanza = Boolean(row.original.Tardanza)

  const button = h(
    UButton,
    {
      icon: 'i-lucide-alert-circle',
      size: 'xs',
      color: 'warning',
      variant: 'ghost',
      disabled: !hasTardanza,
      onClick: () => hasTardanza && openIncidenciaModal(row.original)
    },
    () => 'Incidencia'
  )

  return !hasTardanza
    ? h(UTooltip, { text: 'El empleado no presenta tardanza' }, () => button)
    : button
},
  }


]
</script>
