<template>
  <div>
    <DataState
      :loading="dataLoading"
      :error="dataError"
      error-message="No se pudo cargar los reportes"
      @retry="retryFetch"
    >
      <div
        class="flex flex-wrap items-center justify-between gap-3 px-6 py-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800"
      >
        <div class="flex-1 max-w-md">
          <UInput
            icon="i-heroicons-magnifying-glass"
            v-model="searchModel"
            placeholder="Buscar empleado, DNI..."
            size="md"
          />
        </div>

        <UTooltip :text="canExport ? 'Descargar reporte en Excel' : 'No hay datos para exportar'">
          <UButton
            color="success"
            variant="solid"
            size="md"
            @click="exportarExcel"
            :loading="exportando"
            :disabled="exportando || !canExport"
            class="min-w-[160px] justify-center shadow-sm hover:shadow-md disabled:shadow-none"
          >
            <template #leading>
              <UIcon name="i-lucide-file-spreadsheet" class="w-4 h-4" />
            </template>
            <span class="hidden sm:inline">
              {{ exportando ? 'Exportando...' : 'Exportar Excel' }}
            </span>
            <span class="sm:hidden">
              {{ exportando ? 'Exportando...' : 'Excel' }}
            </span>
          </UButton>
        </UTooltip>
      </div>

      <div class="overflow-x-auto">
        <UTable
          :data="tableData"
          :columns="dinamicColumns"
          :ui="{
            root: 'relative overflow-auto',
            base: 'min-w-full table-fixed',
            thead: 'bg-gray-50 dark:bg-gray-900/50',
            tbody: 'divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-900',
            tr: 'hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors',
            th: 'px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider',
            td: 'px-4 py-3 text-sm text-gray-900 dark:text-gray-100'
          }"
        />
      </div>

      <UModal
        :open="zoomImage"
        @update:open="(isOpen) => {
          if (!isOpen) {
            zoomImage = false
          }
        }"
        title="Vista previa de la imagen"
      >
        <template #content>
          <div class="flex justify-center items-center">
            <img
              :src="showCurrentImage"
              alt="Imagen ampliada"
              class="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg border border-gray-300 dark:border-gray-700"
            />
          </div>
        </template>
      </UModal>
    </DataState>
  </div>
</template>

<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import { h, ref, resolveComponent, computed } from 'vue'
import DataState from '~/components/common/DataState.vue'
import type { TakenAttendace } from '~/composables/useAttendanceReport'
import { EmployeeType, useAttendanceReportStore } from '~/store/useAttendanceReportStore'

type MonthlyTakenAttendaceRow = TakenAttendace & {
  Tipo_Marcacion?: string | number | null
  Fecha_Hora_Marcacion?: string | null
}

const props = defineProps<{
  employeeType: EmployeeType
}>()

const store = useAttendanceReportStore()
const { getAllTakenAttendances, getTechTakenAttendances } = store
const { attendance } = storeToRefs(store)

const config = useRuntimeConfig()
const toast = useToast()
const token = useCookie<string | null>('auth_token')

const exportando = ref(false)
const zoomImage = ref(false)
const showCurrentImage = ref<string | undefined>(undefined)

const takenAttendances = computed(() =>
  props.employeeType === EmployeeType.TECHNICIANS ? attendance.value.taken.tech : attendance.value.taken.all
)

const dataLoading = computed(() => takenAttendances.value.loading)
const dataError = computed(() => takenAttendances.value.isError)

const retryFetch = () => {
  if (props.employeeType === EmployeeType.TECHNICIANS) return getTechTakenAttendances()
  return getAllTakenAttendances()
}

const searchModel = computed<string>({
  get: () => takenAttendances.value.globalFilter,
  set: (v) => {
    takenAttendances.value.globalFilter = v
  }
})

const tableData = computed(() => {
  let list = (takenAttendances.value.listFiltered.length
    ? takenAttendances.value.listFiltered
    : takenAttendances.value.list) as MonthlyTakenAttendaceRow[]

  const term = (takenAttendances.value.globalFilter || '').toLowerCase().trim()
  if (term) {
    list = list.filter(r =>
      String(r.DNI || '').toLowerCase().includes(term) ||
      String(r.Apellidos || '').toLowerCase().includes(term) ||
      String(r.Nombres || '').toLowerCase().includes(term)
    )
  }

  return list
})

const canExport = computed(() => (tableData.value?.length ?? 0) > 0)

const pad2 = (n: number) => String(n).padStart(2, '0')
const formatYmdLocal = (date: Date) =>
  `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`

const normalizeFechasToYmd = (fechas?: Array<string | Date>) => {
  if (!fechas?.length) return undefined
  return fechas.map((f) => (typeof f === 'string' ? f.slice(0, 10) : formatYmdLocal(f)))
}

const exportarExcel = async () => {
  if (exportando.value) return

  exportando.value = true
  toast.add({
    id: 'exportando-monthly',
    title: 'Preparando exportación',
    description: 'Generando archivo Excel...',
    icon: 'i-lucide-loader-2',
  })

  try {
    if (!token.value) throw new Error('Token no disponible')

    const params =
      props.employeeType === EmployeeType.TECHNICIANS
        ? attendance.value.taken.tech.params
        : attendance.value.taken.all.params

    const fechas = normalizeFechasToYmd(params.fechas)

    const response = await fetch(`${config.public.apiBaseUrl}/api/reporte-asistencia/technicians`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token.value}`,
        Accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
      body: JSON.stringify({
        ...params,
        fechas,
        export: 'excel',
      }),
    })

    if (!response.ok) throw new Error(`Error HTTP ${response.status}`)

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const fileName = `reporte_mensual_asistencias_${formatYmdLocal(new Date())}.xlsx`
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => window.URL.revokeObjectURL(url), 500)

    toast.remove('exportando-monthly')
    toast.add({
      title: 'Descarga completa',
      description: `Descargado: ${fileName}`,
      icon: 'i-lucide-check-circle',
      color: 'success',
    })
  } catch (error) {
    console.error('Error exportando Excel:', error)
    toast.remove('exportando-monthly')
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

const UButton = resolveComponent('UButton')

const formatDateTimeParts = (raw: string) => {
  const date = new Date(raw)

  const fecha = new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'America/Lima'
  }).format(date)

  const hora = new Intl.DateTimeFormat('es-PE', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
    timeZone: 'America/Lima'
  }).format(date)

  return { fecha, hora }
}

const sortColumButton = (column: any, label: string) => {
  const isSorted = column.getIsSorted()
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
    onClick: () => column.toggleSorting(isSorted === 'asc')
  })
}

const columns: TableColumn<MonthlyTakenAttendaceRow>[] = [
  { accessorKey: 'DNI', header: ({ column }) => sortColumButton(column, 'DNI') },
  { accessorKey: 'Apellidos', header: ({ column }) => sortColumButton(column, 'Apellidos') },
  { accessorKey: 'Nombres', header: ({ column }) => sortColumButton(column, 'Nombres') },
  { accessorKey: 'Departamento', header: ({ column }) => sortColumButton(column, 'Departamento') },
  { accessorKey: 'Empresa', header: ({ column }) => sortColumButton(column, 'Empresa') },
]

const technicianColumns = computed<TableColumn<MonthlyTakenAttendaceRow>[]>(() => [
  {
    accessorKey: 'Tipo_Marcacion',
    header: ({ column }) => sortColumButton(column, 'Tipo'),
    cell: ({ row }) => {
      const value = row.getValue('Tipo_Marcacion')
      const isEntry = Number(value) === 0

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
          h('span', { class: `w-1.5 h-1.5 rounded-full ${isEntry ? 'bg-green-500' : 'bg-blue-500'}` }),
          isEntry ? 'Entrada' : 'Salida'
        ]
      )
    }
  },
  {
    accessorKey: 'Fecha_Hora_Marcacion',
    header: ({ column }) => sortColumButton(column, 'Fecha/Hora'),
    cell: ({ row }) => {
      const raw = row.getValue('Fecha_Hora_Marcacion') as string | null
      if (!raw) return h('span', { class: 'text-xs text-gray-400 italic' }, 'Sin fecha')

      const { fecha, hora } = formatDateTimeParts(raw)
      return h('div', { class: 'flex flex-col gap-0.5' }, [
        h('span', { class: 'text-base font-semibold text-gray-900 dark:text-gray-100' }, hora),
        h('span', { class: 'text-sm font-semibold text-gray-700 dark:text-gray-300' }, fecha)
      ])
    }
  },
  {
    accessorKey: 'Ubicacion',
    header: ({ column }) => sortColumButton(column, 'Dirección'),
    cell: ({ row }) => {
      const value = row.getValue('Ubicacion') as string | null
      if (!value) return h('span', { class: 'text-xs text-gray-400 italic' }, 'Sin dirección')

      return h(
        'div',
        { class: 'max-w-[220px] truncate text-sm text-gray-700 dark:text-gray-300', title: value },
        value
      )
    }
  },
  {
    accessorKey: 'map_url',
    header: 'Mapa',
    cell: ({ row }) => {
      const mapUrl = row.getValue('map_url') as string | null
      if (!mapUrl) return h('span', { class: 'text-xs text-gray-400 italic' }, 'Sin mapa')

      const lat = row.original?.Latitud || row.original?.latitud || row.original?.latitude
      const lng = row.original?.Longitud || row.original?.longitud || row.original?.longitude
      const url = lat && lng ? `https://www.google.com/maps?q=${lat},${lng}` : mapUrl

      return h(
        UButton,
        {
          color: 'primary',
          variant: 'soft',
          size: 'xs',
          icon: 'i-heroicons-map-pin',
          onClick: (e: Event) => {
            e.stopPropagation()
            window.open(url, '_blank')
          }
        },
        () => 'Ver mapa'
      )
    }
  },
  {
    accessorKey: 'Imagen',
    header: 'Foto',
    cell: ({ row }) => {
      const image = row.getValue('Imagen') as string | null
      if (!image) return h('span', { class: 'text-xs text-gray-400 italic' }, 'Sin foto')

      return h('img', {
        src: image,
        alt: 'Foto de asistencia',
        class:
          'w-14 h-14 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-700 cursor-pointer hover:border-primary-500 transition-colors shadow-sm',
        onClick: (e: Event) => {
          e.stopPropagation()
          zoomImage.value = true
          showCurrentImage.value = image
        }
      })
    }
  }
])

const dinamicColumns = computed(() => [...columns, ...technicianColumns.value])
</script>

