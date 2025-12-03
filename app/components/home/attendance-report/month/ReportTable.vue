<template>

  <UTable :data="data" :columns="dinamicColumns" class="shrink-0" :ui="{
    base: 'table-fixed border-separate border-spacing-0',
    thead: '[&>tr]:bg-elevated/50 [&>tr]:after:content-none',
    tbody: '[&>tr]:last:[&>td]:border-b-0',
    th: 'first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r',
    td: 'border-b border-default'
  }" />


  <!-- Modal para ampliar imagen -->
  <UModal :open="zoomImage" @update:open="(isOpen) => {
    if (!isOpen) {
      zoomImage = false;
    }

  }" title="Vista previa de la imagen">
    <template #content>
      <div class="flex justify-center items-center">
        <img :src="showCurrentImage" alt="Imagen ampliada"
          class="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg border border-gray-300 dark:border-gray-700" />
      </div>
    </template>

  </UModal>
</template>


<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui';
import { lastDayOfMonth, startOfMonth } from 'date-fns';
import { h, ref, resolveComponent } from 'vue';
import { EmployeeType } from '~/store/useAttendanceReportStore';
import type { Range, Sale } from '~/types';

const { employeeType } = defineProps<{
  employeeType: EmployeeType
}>()

const range = shallowRef<Range>({
  start: startOfMonth(new Date()),
  end: lastDayOfMonth(new Date()),
})

const zoomImage = ref<boolean>(false)
const showCurrentImage = ref<string | undefined>(undefined);

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

const dinamicColumns = computed<TableColumn<Sale>[]>(() => [...columns, ...(employeeType === EmployeeType.TECHNICIANS ? [...technicianColumns.value] : [...administratorsColumns.value])]);


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
  header: "Mapa",
  cell: () => h(UButton, {
    class: 'cursor-pointer',
    icon: 'i-lucide-map',
  }, () => 'Ver')
}, {
  accessorKey: 'foto',
  header: "Foto",
  cell: ({ row }) => {
    const image = row.getValue('foto') || 'data:image/jpeg;base64,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';

    if (image) {
      return h('img', {
        src: image,
        alt: 'Imagen de asistencia',
        class: 'w-16 h-16 object-cover rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer',
        onClick: (e: Event) => {
          e.stopPropagation()
          zoomImage.value = true;
          showCurrentImage.value = image as any;
          // openImageModal(image)
        }
      })
    }

    // fallback
    return h('span', {
      class: 'text-xs text-gray-500 dark:text-gray-400'
    }, 'Sin imagen')
  }
}]))

const administratorsColumns = computed<TableColumn<Sale>[]>(() => [
  {
    accessorKey: 'fecha',
    header: ({ column }) => sortColumButton(column, 'Fecha'),
    cell: ({ row }) => row.getValue('fecha')
  },
  {
    accessorKey: 'hora',
    header: ({ column }) => sortColumButton(column, 'Hora'),
    cell: ({ row }) => row.getValue('hora')
  },
  {
    accessorKey: 'anio',
    header: ({ column }) => sortColumButton(column, 'Año'),
    cell: ({ row }) => row.getValue('anio')
  },
  {
    accessorKey: 'dia',
    header: ({ column }) => sortColumButton(column, 'Día'),
    cell: ({ row }) => row.getValue('dia')
  }
]);
</script>
