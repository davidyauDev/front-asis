<template>
  <DataState :loading="attendances.loading" :error="attendances.isError" error-message="No se pudo cargar los reportes"
    @retry="employeeType === EmployeeType.TECHNICIANS ? getTechTakenAttendances() : getAllTakenAttendances()">

    <UInput icon="i-lucide-search" v-model="attendances.globalFilter" class="w-full"
      placeholder="Buscar por nombre, apellido o DNI..." />

    <UTable  ref="table" :data="attendances.listFiltered" :columns="dinamicColumns" class="shrink-0" :ui="{
      base: 'table-fixed border-separate border-spacing-0',
      thead: '[&>tr]:bg-elevated/50 [&>tr]:after:content-none',
      tbody: '[&>tr]:last:[&>td]:border-b-0',
      th: 'first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r',
      td: 'border-b border-default'
    }" v-model:pagination="attendances.pagination" :pagination-options="{
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


  <ModalMap v-model:open="openModalMap"  :map-url="currentMap" />


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
import { getPaginationRowModel } from '@tanstack/vue-table';
import { h, ref, resolveComponent } from 'vue';
import DataState from '~/components/common/DataState.vue';
import { EmployeeType, useAttendanceReportStore } from '~/store/useAttendanceReportStore';
import ModalMap from './ModalMap.vue';


const store = useAttendanceReportStore();
const { getAllTakenAttendances, getTechTakenAttendances } = store;
const { attendance } = storeToRefs(store);



const { employeeType } = defineProps<{
  employeeType: EmployeeType
}>()

const attendances = computed(() => employeeType === EmployeeType.TECHNICIANS ? attendance.value.taken.tech : attendance.value.taken.all);


const zoomImage = ref<boolean>(false)
const showCurrentImage = ref<string | undefined>(undefined);

const openModalMap = ref<boolean>(false);
const currentMap = ref<string | undefined>(undefined)


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

const table = useTemplateRef('table')

// const pagination = ref({
//   pageIndex: 0,
//   pageSize: 10
// })

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

const dinamicColumns = computed<TableColumn<TakenAttendace>[]>(() => [...columns, ...(employeeType === EmployeeType.TECHNICIANS ? [...technicianColumns.value] : [...administratorsColumns.value])]);


const columns: TableColumn<TakenAttendace>[] = [
  {
    accessorKey: 'DNI',
    header: ({ column }) => sortColumButton(column, 'DNI'),
    cell: ({ row }) => row.getValue('DNI')
  },
  {
    accessorKey: 'Apellidos',
    header: ({ column }) => sortColumButton(column, 'Apellidos'),
    cell: ({ row }) => row.getValue('Apellidos')
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
    cell: ({ row }) => row.getValue('Empresa')
  },
]



const technicianColumns = computed<TableColumn<TakenAttendace>[]>(() => ([{
  accessorKey: 'Tipo_Marcacion',
  header: ({ column }) => sortColumButton(column, 'Tipo de marcación'),
  cell: ({ row }) => {
    const value = row.getValue('Tipo_Marcacion');

    if (parseInt(value) === 0) return 'Entrada';
    if (parseInt(value) === 1) return 'Salida';
    return 'Otro';
  }
}
, {
  accessorKey: 'Fecha_Hora_Marcacion',
  header: ({ column }) => sortColumButton(column, 'Fecha y hora de marcación'),
  cell: ({ row }) => {
    const raw = row.getValue('Fecha_Hora_Marcacion');
    if (!raw) return 'Sin fecha';

    const date = new Date(raw);

    const fecha = new Intl.DateTimeFormat('es-PE', {
      dateStyle: 'long',
      timeZone: 'America/Lima'
    }).format(date);

    const hora = new Intl.DateTimeFormat('es-PE', {
      timeStyle: 'short',
      timeZone: 'America/Lima'
    }).format(date);

    return h('div', { class: 'flex flex-col leading-tight' }, [
      h('span', { class: 'text-sm font-medium text-gray-800 dark:text-gray-200' }, fecha),
      h('span', { class: 'text-xs text-gray-500 dark:text-gray-400' }, hora)
    ]);
  }
}

, {
  accessorKey: 'Ubicacion',
  header: ({ column }) => sortColumButton(column, 'Dirección'),
  cell: ({ row }) => {
    const value = row.getValue('Ubicacion') as string | null;

    if (!value) {
      return h('span', {
        class: 'text-xs text-gray-400 italic'
      }, 'Sin dirección');
    }

    return h(
      'div',
      {
        class: `
          max-w-[220px]
          truncate
          text-sm
          text-gray-700
          dark:text-gray-300
          cursor-help
        `,
        title: value
      },
      value
    );
  }
}
, {
  accessorKey: 'map_url',
  header: "Mapa",
  cell: ({ row }) => {
    const mapUlr = row.getValue('map_url') as string | null;
    if (!mapUlr) return "Sin Mapa"
    return h(UButton, {
    class: 'cursor-pointer',
    icon: 'i-lucide-map',
    onClick: (e: Event) => {
      e.stopPropagation()
      openModalMap.value = true;
      currentMap.value = mapUlr;
    },
  }, () => 'Ver')
  }
}, {
  accessorKey: 'Imagen',
  header: "Foto",
  cell: ({ row }) => {
    const image = row.getValue('Imagen');

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

const administratorsColumns = computed<TableColumn<TakenAttendace>[]>(() => [
  
  {
  accessorKey: 'Fecha_Hora_Marcacion',
  header: ({ column }) => sortColumButton(column, 'Fecha y hora de marcación'),
  cell: ({ row }) => {
    const raw = row.getValue('Fecha_Hora_Marcacion');
    if (!raw) return 'Sin fecha';

    const date = new Date(raw);

    const fecha = new Intl.DateTimeFormat('es-PE', {
      dateStyle: 'long',
      timeZone: 'America/Lima'
    }).format(date);

    const hora = new Intl.DateTimeFormat('es-PE', {
      timeStyle: 'short',
      timeZone: 'America/Lima'
    }).format(date);

    return h('div', { class: 'flex flex-col leading-tight' }, [
      h('span', { class: 'text-sm font-medium text-gray-800 dark:text-gray-200' }, fecha),
      h('span', { class: 'text-xs text-gray-500 dark:text-gray-400' }, hora)
    ]);
  }
},
  
]);
</script>
