<template>
  <div>
    <DataState
      :error="attendance.details.isError"
      :loading="attendance.details.loading"
      error-message="No se pudo cargar el detalle de asistencia"
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

        <div class="flex flex-wrap items-center gap-2">
          <UButton
            color="neutral"
            variant="outline"
            size="md"
            :icon="filtersVisible ? 'i-lucide-panel-top-close' : 'i-lucide-panel-top-open'"
            class="min-w-[170px] justify-center whitespace-nowrap border-[#cfdcf7] bg-white text-[#30508f] font-semibold shadow-sm transition-all hover:bg-[#eef4ff] dark:border-gray-700 dark:bg-gray-950 dark:text-gray-200 dark:hover:bg-gray-900"
            @click="emit('toggle-filters')"
          >
            {{ filtersVisible ? 'Ocultar filtros' : 'Mostrar filtros' }}
          </UButton>

          <UTooltip :text="canExport ? 'Descargar reporte en Excel' : 'No hay datos para exportar'">
            <UButton
              color="success"
              variant="solid"
              size="md"
              @click="exportarExcel"
              :loading="exportando"
              :disabled="exportando || !canExport"
              class="min-w-[170px] justify-center shadow-sm hover:shadow-md disabled:shadow-none"
            >
              <template #leading>
                <UIcon name="i-lucide-file-spreadsheet" class="w-4 h-4" />
              </template>
              <span class="hidden sm:inline">
                {{ exportando ? 'Exportando...' : 'Descargar reporte' }}
              </span>
              <span class="sm:hidden">
                {{ exportando ? 'Exportando...' : 'Excel' }}
              </span>
            </UButton>
          </UTooltip>
        </div>
      </div>

      <div class="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800">
        <UTable
          :data="filteredList"
          :columns="columns"
          :loading="attendance.details.loading"
          empty="Sin registros"
          :ui="{
            root: 'relative max-h-[calc(100vh-300px)] overflow-y-auto overflow-x-hidden',
            base: 'min-w-full table-fixed border-separate border-spacing-0',
            thead: 'sticky top-0 z-10 bg-[#2d5fc0] text-white border-b border-[#244ea4]',
            th: `
              px-4 py-3 text-left text-[11px] font-semibold
              uppercase tracking-wider text-white
            `,
            td: `
              px-4 py-3 text-sm
              text-gray-900 dark:text-gray-100
            `,
            tbody: `
              [&>tr]:transition-colors
              [&>tr:hover]:bg-[#f7f9ff]
              dark:[&>tr:hover]:bg-gray-900/60
            `
          }"
        />
      </div>
    </DataState>

    <div
      class="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950"
    >
      <p class="text-sm text-gray-500 dark:text-gray-400">
        <span class="font-medium text-gray-900 dark:text-gray-100">{{ filteredList.length }}</span>
        {{ filteredList.length === 1 ? 'registro' : 'registros' }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import { h, resolveComponent, computed, ref } from 'vue'
import DataState from '~/components/common/DataState.vue'
import type { AttendanceDetails, AttendanceParams } from '~/composables/useAttendanceReport'
import { useAttendanceReportStore } from '~/store/useAttendanceReportStore'

const props = defineProps<{
  params?: AttendanceParams | null
  filtersVisible?: boolean
}>()

const emit = defineEmits<{
  (event: 'toggle-filters'): void
}>()

const store = useAttendanceReportStore()
const { getAttendanceDetails } = store
const { attendance } = storeToRefs(store)

const config = useRuntimeConfig()
const toast = useToast()
const token = useCookie<string | null>('auth_token')

const exportando = ref(false)

const retryFetch = () => getAttendanceDetails(props.params ?? undefined)

const searchModel = computed<string>({
  get: () => attendance.value.globalFilter,
  set: (v) => {
    attendance.value.globalFilter = v
  }
})

const filteredList = computed(() => {
  let list: AttendanceDetails[] = attendance.value.details.list

  const term = (attendance.value.globalFilter || '').toLowerCase().trim()
  if (term) {
    list = list.filter(r =>
      (r.nombres || '').toLowerCase().includes(term) ||
      (r.apellidos || '').toLowerCase().includes(term) ||
      String(r.dni || '').toLowerCase().includes(term)
    )
  }

  return list
})

const canExport = computed(() => filteredList.value.length > 0)

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
    class: '-mx-2.5 rounded-md px-2 py-1 text-[11px] font-semibold uppercase tracking-wider !text-white !bg-transparent hover:!text-white hover:!bg-white/10 focus-visible:!ring-2 focus-visible:!ring-white/35',
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

const formatFecha = (raw: any) => {
  if (!raw) return 'Sin fecha'
  const [y, m, d] = String(raw).slice(0, 10).split('-').map(Number)
  const date = new Date(y, (m || 1) - 1, d || 1)
  return new Intl.DateTimeFormat('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date)
}

const columns: TableColumn<AttendanceDetails>[] = [
  {
    accessorKey: 'apellidos',
    header: ({ column }) => sortColumButton(column, 'Empleado'),
    cell: ({ row }) => {
      const apellidos = String(row.original.apellidos ?? '').trim()
      const nombres = String(row.original.nombres ?? '').trim()
      const dni = String(row.original.dni ?? '').trim()

      return h('div', { class: 'flex flex-col leading-snug whitespace-normal min-w-[200px]' }, [
        h('span', { class: 'text-sm font-semibold text-emerald-700 dark:text-emerald-300' }, apellidos || '—'),
        h('span', { class: 'text-sm text-gray-900 dark:text-gray-100' }, nombres || '—'),
        h('span', { class: 'text-xs font-mono text-gray-500 dark:text-gray-400' }, dni || '—'),
      ])
    }
  },
  { accessorKey: 'departamento', header: ({ column }) => sortColumButton(column, 'Departamento') },
  { accessorKey: 'empresa', header: ({ column }) => sortColumButton(column, 'Empresa') },
  {
    accessorKey: 'fecha',
    header: ({ column }) => sortColumButton(column, 'Fecha'),
    cell: ({ row }) =>
      h('span', { class: 'text-sm font-semibold text-gray-900 dark:text-gray-100' }, formatFecha(row.getValue('fecha')))
  },
  { accessorKey: 'h_ingreso', header: ({ column }) => sortColumButton(column, 'H. Ingreso') },
  { accessorKey: 'h_salida', header: ({ column }) => sortColumButton(column, 'H. Salida') },
  {
    accessorKey: 'm_ingreso',
    header: ({ column }) => sortColumButton(column, 'M. Ingreso'),
    cell: ({ row }) =>
      row.getValue('m_ingreso')
        ? badge(String(row.getValue('m_ingreso')), 'success', 'i-lucide-log-in')
        : badge('No marcó entrada', 'error', 'i-lucide-alert-circle')
  },
  {
    accessorKey: 'm_salida',
    header: ({ column }) => sortColumButton(column, 'M. Salida'),
    cell: ({ row }) =>
      row.getValue('m_salida')
        ? badge(String(row.getValue('m_salida')), 'neutral', 'i-lucide-log-out')
        : badge('No marcó salida', 'error', 'i-lucide-alert-circle')
  },
  {
    accessorKey: 'tardanza',
    header: ({ column }) => sortColumButton(column, 'Tardanza'),
    cell: ({ row }) =>
      row.getValue('tardanza')
        ? badge(String(row.getValue('tardanza')), 'warning', 'i-lucide-clock')
        : badge('Sin tardanza', 'success', 'i-lucide-check-circle')
  },
  {
    accessorKey: 'total_trabajado',
    header: ({ column }) => sortColumButton(column, 'T. Trabajado'),
    cell: ({ row }) => badge(String(row.getValue('total_trabajado') ?? '-'), 'info', 'i-lucide-timer')
  }
]

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
    id: 'exportando-detalle',
    title: 'Preparando exportación',
    description: 'Generando archivo Excel...',
    icon: 'i-lucide-loader-2',
  })

  try {
    if (!token.value) throw new Error('Token no disponible')

    const baseParams = props.params ?? {}
    const fechas = normalizeFechasToYmd(baseParams.fechas)

    const body: Record<string, unknown> = {
      ...baseParams,
      fechas: fechas?.length ? fechas : undefined,
      export: 'excel',
    }

    if (fechas?.length) {
      delete body['fecha_inicio']
      delete body['fecha_fin']
    }

    const response = await fetch(`${config.public.apiBaseUrl}/api/reporte-asistencia/detalle-general`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token.value}`,
        Accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      throw new Error(`Error HTTP ${response.status}`)
    }

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url

    const fileName = `detalle_asistencia_${formatYmdLocal(new Date())}.xlsx`
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => window.URL.revokeObjectURL(url), 500)

    toast.remove('exportando-detalle')
    toast.add({
      title: 'Descarga completa',
      description: `Descargado: ${fileName}`,
      icon: 'i-lucide-check-circle',
      color: 'success',
    })
  } catch (error) {
    console.error('Error exportando Excel (detalle):', error)
    toast.remove('exportando-detalle')
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
</script>
