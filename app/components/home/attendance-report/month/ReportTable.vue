<template>
  <div>
    <DataState :loading="attendances.loading" :error="attendances.isError" error-message="No se pudo cargar los reportes"
      @retry="employeeType === EmployeeType.TECHNICIANS ? getTechTakenAttendances() : getAllTakenAttendances()">
     
     <!-- Header con búsqueda y exportar -->
     <div class="flex flex-wrap items-center justify-between gap-3 px-6 py-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div class="flex-1 max-w-md">
          <UInput 
            icon="i-heroicons-magnifying-glass" 
            v-model="attendances.globalFilter" 
            placeholder="Buscar empleado, DNI..."
            size="md"
          />
        </div>

        <UButton
          color="primary"
          variant="outline"
          size="md"
          @click="exportarExcel"
          :loading="exportando"
          :disabled="exportando"
        >
          <template #leading>
            <UIcon name="i-heroicons-arrow-down-tray" class="w-4 h-4" />
          </template>
          {{ exportando ? 'Exportando...' : 'Exportar Excel' }}
        </UButton>
      </div>

      <!-- Tabla -->
      <div class="overflow-x-auto">
        <UTable 
          ref="table" 
          :data="attendances.listFiltered" 
          :columns="dinamicColumns" 
          :ui="{
            wrapper: 'relative',
            base: 'min-w-full table-fixed',
            divide: 'divide-y divide-gray-200 dark:divide-gray-800',
            thead: 'bg-gray-50 dark:bg-gray-900/50',
            tbody: 'divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-900',
            tr: {
              base: 'hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors',
            },
            th: {
              base: 'px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider',
              padding: 'px-4 py-3',
              color: 'text-gray-700 dark:text-gray-300',
              font: 'font-semibold',
              size: 'text-xs'
            },
            td: {
              base: 'px-4 py-3 text-sm text-gray-900 dark:text-gray-100',
              padding: 'px-4 py-3',
              color: 'text-gray-900 dark:text-gray-100',
              font: 'font-normal',
              size: 'text-sm'
            }
          }" 
          v-model:pagination="attendances.pagination" 
          :pagination-options="{
            getPaginationRowModel: getPaginationRowModel()
          }" 
        />
      </div>

      <!-- Footer con paginación -->
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-800">
        <div class="text-sm text-gray-600 dark:text-gray-400">
          Mostrando <span class="font-semibold text-gray-900 dark:text-gray-100">{{ getStats().start }}</span> - 
          <span class="font-semibold text-gray-900 dark:text-gray-100">{{ getStats().end }}</span>
          de <span class="font-semibold text-gray-900 dark:text-gray-100">{{ getStats().total }}</span> registros
        </div>
        
        <UPagination 
          :page="(table?.tableApi?.getState().pagination.pageIndex || 0) + 1"
          :items-per-page="table?.tableApi?.getState().pagination.pageSize"
          :total="table?.tableApi?.getFilteredRowModel().rows.length"
          @update:page="(p) => table?.tableApi?.setPageIndex(p - 1)" 
        />
      </div>
    </DataState>
  </div>
</template>


<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui';
import { getPaginationRowModel } from '@tanstack/vue-table';
import { h, ref, resolveComponent } from 'vue';
import DataState from '~/components/common/DataState.vue';
import { EmployeeType, useAttendanceReportStore } from '~/store/useAttendanceReportStore';

const store = useAttendanceReportStore();
const { getAllTakenAttendances, getTechTakenAttendances } = store;
const { attendance } = storeToRefs(store);

const config = useRuntimeConfig()
const toast = useToast()
const token = useCookie<string | null>('auth_token')

const exportando = ref(false)

const exportarExcel = async () => {
  if (exportando.value) return;
  
  exportando.value = true;
  
  toast.add({
    id: 'exportando',
    title: 'Preparando exportación',
    description: 'Generando archivo Excel...',
    icon: 'i-lucide-loader-2',
  })

  try {
    if (!token.value) {
      throw new Error('Token no disponible')
    }

    const params = employeeType === EmployeeType.TECHNICIANS 
      ? attendance.value.taken.tech.params 
      : attendance.value.taken.all.params;

    const response = await fetch(
      `${config.public.apiBaseUrl}/api/reporte-asistencia/marcacion`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token.value}`,
          'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        },
        body: JSON.stringify({ 
          ...params,
          export: 'excel' 
        })
      }
    )

    if (!response.ok) {
      throw new Error(`Error HTTP ${response.status}`)
    }

    const blob = await response.blob()

    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'reporte_mensual_asistencias.xlsx'
    document.body.appendChild(a)
    a.click()
    a.remove()
    window.URL.revokeObjectURL(url)

    toast.remove('exportando')
    toast.add({
      title: 'Descarga completa',
      description: 'El archivo se descargó correctamente',
      icon: 'i-lucide-check-circle',
      color: 'success',
    })

  } catch (error) {
    console.error('Error exportando Excel:', error)
    toast.remove('exportando')
    toast.add({
      title: 'Error al exportar',
      description: 'No se pudo generar el archivo Excel',
      icon: 'i-lucide-alert-circle',
      color: 'error',
    })
  } finally {
    exportando.value = false
  }
}




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
    color: 'gray',
    variant: 'ghost',
    label,
    icon: isSorted
      ? isSorted === 'asc'
        ? 'i-heroicons-arrow-up'
        : 'i-heroicons-arrow-down'
      : 'i-heroicons-arrows-up-down',
    size: 'xs',
    class: 'font-semibold',
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
  header: ({ column }) => sortColumButton(column, 'Tipo'),
  cell: ({ row }) => {
    const value = row.getValue('Tipo_Marcacion');
    const isEntry = parseInt(value as string) === 0;

    return h(
      'span',
      {
        class: `inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
          isEntry 
            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
            : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
        }`
      },
      [
        h('span', { 
          class: `w-1.5 h-1.5 rounded-full ${isEntry ? 'bg-green-500' : 'bg-blue-500'}` 
        }),
        isEntry ? 'Entrada' : 'Salida'
      ]
    );
  }
}
, {
  accessorKey: 'Fecha_Hora_Marcacion',
  header: ({ column }) => sortColumButton(column, 'Fecha/Hora'),
  cell: ({ row }) => {
    const raw = row.getValue('Fecha_Hora_Marcacion');
    if (!raw) return h('span', { class: 'text-xs text-gray-400 italic' }, 'Sin fecha');

    const date = new Date(raw as string);

    const fecha = new Intl.DateTimeFormat('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'America/Lima'
    }).format(date);

    const hora = new Intl.DateTimeFormat('es-PE', {
      timeStyle: 'short',
      timeZone: 'America/Lima'
    }).format(date);

    return h('div', { class: 'flex flex-col gap-0.5' }, [
      h('span', { class: 'text-sm font-semibold text-gray-900 dark:text-gray-100' }, hora),
      h('span', { class: 'text-xs text-gray-500 dark:text-gray-400' }, fecha)
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
        class: 'max-w-[220px] truncate text-sm text-gray-700 dark:text-gray-300',
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
    if (!mapUlr) {
      return h('span', { class: 'text-xs text-gray-400 italic' }, 'Sin mapa');
    }
    // Extraer latitud y longitud si existen en la fila
    const lat = row.original?.Latitud || row.original?.latitud || row.original?.latitude;
    const lng = row.original?.Longitud || row.original?.longitud || row.original?.longitude;
    const hasCoords = lat && lng;
    return h(UButton, {
      color: 'primary',
      variant: 'soft',
      size: 'xs',
      icon: 'i-heroicons-map-pin',
      onClick: (e: Event) => {
        e.stopPropagation();
        if (hasCoords) {
          const url = `https://www.google.com/maps?q=${lat},${lng}`;
          window.open(url, '_blank');
        } else if (mapUlr) {
          window.open(mapUlr, '_blank');
        } else {
          openModalMap.value = true;
          currentMap.value = mapUlr;
        }
      },
    }, () => 'Ver mapa')
  }
}, {
  accessorKey: 'Imagen',
  header: "Foto",
  cell: ({ row }) => {
    const image = row.getValue('Imagen');

    if (image) {
      return h('img', {
        src: image,
        alt: 'Foto de asistencia',
        class: 'w-14 h-14 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-700 cursor-pointer hover:border-primary-500 transition-colors shadow-sm',
        onClick: (e: Event) => {
          e.stopPropagation()
          zoomImage.value = true;
          showCurrentImage.value = image as any;
        }
      })
    }

    return h('span', {
      class: 'text-xs text-gray-400 italic'
    }, 'Sin foto')
  }
}]))

const administratorsColumns = computed<TableColumn<TakenAttendace>[]>(() => [
  {
    accessorKey: 'Fecha_Hora_Marcacion',
    header: ({ column }) => sortColumButton(column, 'Fecha/Hora'),
    cell: ({ row }) => {
      const raw = row.getValue('Fecha_Hora_Marcacion');
      if (!raw) return h('span', { class: 'text-xs text-gray-400 italic' }, 'Sin fecha');

      const date = new Date(raw as string);

      const fecha = new Intl.DateTimeFormat('es-PE', {
        dateStyle: 'medium',
        timeZone: 'America/Lima'
      }).format(date);

      const hora = new Intl.DateTimeFormat('es-PE', {
        timeStyle: 'short',
        timeZone: 'America/Lima'
      }).format(date);

      return h('div', { class: 'flex flex-col gap-0.5' }, [
        h('span', { class: 'text-sm font-semibold text-gray-900 dark:text-gray-100' }, fecha),
        h('span', { class: 'text-xs text-gray-500 dark:text-gray-400' }, hora)
      ]);
    }
  },
]);
</script>
