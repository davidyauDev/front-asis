<template>
  <div class="flex flex-col h-full">
    <div class="bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
      <!-- TOOLBAR -->
      <div class="p-4 border-b border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-950/70">
        <div class="flex flex-wrap items-center gap-3">
          <!-- BUSCADOR -->
          <div class="relative flex-1 min-w-[260px]">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input 
              v-model="filtroUsuario" 
              type="text" 
              placeholder="Buscar por DNI, código, apellido o nombre..." 
              class="w-full h-10 pl-10 pr-4 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-950 focus:border-[#2d5fc0] dark:focus:border-[#5d7fdb] focus:ring-2 focus:ring-[#2d5fc0]/20 transition-colors text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
            />
          </div>

          <!-- RANGO FECHAS -->
          <div class="flex flex-wrap items-center gap-2">
            <span class="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Periodo</span>

            <UPopover>
              <button
                type="button"
                class="h-10 px-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 hover:bg-[#eef4ff] dark:hover:bg-[#13203a] transition-colors inline-flex items-center gap-2"
                title="Seleccionar mes (máximo 30 días)"
              >
                <UIcon name="i-lucide-calendar-range" class="h-4 w-4 text-[#2d5fc0] dark:text-[#9cb7f5]" />
                <span class="text-sm font-semibold text-gray-900 dark:text-gray-100 font-mono tabular-nums">
                  {{ periodDisplay }}
                </span>
                <UIcon name="i-lucide-chevron-down" class="h-4 w-4 text-gray-400" />
              </button>

              <template #content>
                <div class="p-3">
                  <div class="flex items-center justify-between gap-3 mb-2">
                    <div class="text-xs text-gray-700 dark:text-gray-200">
                      Mes calendario · <span class="font-semibold">máximo 30 días</span>
                    </div>
                    <div class="text-[11px] text-gray-500 dark:text-gray-400 font-mono">
                      {{ periodDisplay }}
                    </div>
                  </div>

                  <UCalendar
                    range
                    locale="es"
                    :number-of-months="1"
                    :year-controls="true"
                    :month-controls="true"
                    :disable-days-outside-current-view="true"
                    :is-date-disabled="isDateDisabled"
                    v-model="calendarRange"
                    v-model:placeholder="calendarPlaceholder"
                    :ui="{
                      cellTrigger:
                        'data-[outside-view]:invisible data-disabled:cursor-not-allowed data-disabled:opacity-35 data-disabled:pointer-events-none'
                    }"
                  />
                </div>
              </template>
            </UPopover>
          </div>

          <div class="flex items-center gap-2 ms-auto">
            <button 
              @click="aplicarFiltros" 
              class="h-10 bg-[#2d5fc0] hover:bg-[#244fa4] active:bg-[#1f448f] text-white px-4 rounded-lg transition-colors flex items-center gap-2 font-semibold text-sm shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2d5fc0]/35 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-950"
            >
              <span>Aplicar</span>
            </button>

            <button 
              @click="descargarExcel" 
              :disabled="isExporting"
              class="h-10 min-w-[176px] px-4 rounded-lg transition-colors inline-flex items-center justify-center gap-2 font-semibold text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2d5fc0]/35 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-950 border border-[#2d5fc0]/20 bg-white text-[#2d5fc0] shadow-sm hover:bg-[#eef4ff] active:bg-[#dfe9ff] disabled:opacity-60 disabled:pointer-events-none dark:bg-gray-950 dark:text-[#9cb7f5] dark:border-[#2d5fc0]/30 dark:hover:bg-[#13203a]"
              :title="isExporting ? 'Descargando reporte...' : 'Descargar reporte'"
              :aria-busy="isExporting"
            >
              <template v-if="isExporting">
                <USkeleton class="h-4 w-16 rounded-md bg-current/15 dark:bg-white/15" />
                <span>Descargando...</span>
              </template>
              <template v-else>
                <UIcon name="i-lucide-download" class="h-4 w-4 shrink-0" />
                <span>Descargar reporte</span>
              </template>
            </button>
          </div>
        </div>
      </div>

      <!-- ESTADO DE CARGA -->
      <div v-if="isLoading" class="h-[750px] overflow-hidden">
        <div class="h-full overflow-hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
          <div class="sticky top-0 z-10 border-b border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-950/90 px-4 py-3 backdrop-blur">
            <div class="flex flex-wrap items-center gap-3">
              <USkeleton class="h-4 w-56 rounded-md" />
              <USkeleton class="h-4 w-28 rounded-full" />
              <USkeleton class="h-4 w-28 rounded-full" />
              <div class="ml-auto flex items-center gap-2">
                <USkeleton class="h-9 w-28 rounded-lg" />
                <USkeleton class="h-9 w-28 rounded-lg" />
              </div>
            </div>
          </div>

          <div class="overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/40">
                    <th v-for="i in 14" :key="i" class="px-3 py-3">
                      <USkeleton class="h-3 w-full rounded-md" />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in 7" :key="row" class="border-b border-gray-100 dark:border-gray-800/80">
                    <td class="px-3 py-3"><USkeleton class="h-4 w-8 rounded-md" /></td>
                    <td class="px-3 py-3"><USkeleton class="h-4 w-28 rounded-md" /></td>
                    <td class="px-3 py-3"><USkeleton class="h-4 w-24 rounded-md" /></td>
                    <td class="px-3 py-3"><USkeleton class="h-4 w-20 rounded-md" /></td>
                    <td class="px-3 py-3"><USkeleton class="h-4 w-24 rounded-md" /></td>
                    <td class="px-3 py-3"><USkeleton class="h-4 w-20 rounded-md" /></td>
                    <td class="px-3 py-3"><USkeleton class="h-4 w-10 rounded-md" /></td>
                    <td class="px-3 py-3"><USkeleton class="h-4 w-10 rounded-md" /></td>
                    <td class="px-3 py-3"><USkeleton class="h-4 w-10 rounded-md" /></td>
                    <td class="px-3 py-3"><USkeleton class="h-4 w-10 rounded-md" /></td>
                    <td class="px-3 py-3"><USkeleton class="h-4 w-10 rounded-md" /></td>
                    <td class="px-3 py-3"><USkeleton class="h-4 w-10 rounded-md" /></td>
                    <td class="px-3 py-3"><USkeleton class="h-4 w-24 rounded-md" /></td>
                    <td class="px-3 py-3"><USkeleton class="h-4 w-20 rounded-md" /></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- TABLA -->
      <div v-else class="overflow-x-auto overflow-y-auto h-[750px]">
        <table class="w-full text-sm">
          <thead>
            <tr class="sticky top-0 z-10 bg-[#2d5fc0] text-white border-b border-[#244fa4]/40">
              <th class="px-3 py-3 text-center text-xs font-semibold w-12">
                <button type="button" class="inline-flex items-center gap-1 w-full justify-center" @click="toggleSort('numero')">
                  N° <UIcon :name="sortIcon('numero')" class="w-3 h-3 opacity-90" />
                </button>
              </th>
              <th class="px-3 py-3 text-left text-xs font-semibold">
                <button type="button" class="inline-flex items-center gap-1 w-full" @click="toggleSort('apellidos')">
                  Empleado <UIcon :name="employeeSortIcon" class="w-3 h-3 opacity-90" />
                </button>
              </th>
              <th class="px-3 py-3 text-left text-xs font-semibold">
                <button type="button" class="inline-flex items-center gap-1 w-full" @click="toggleSort('ingreso')">
                  Ingreso <UIcon :name="sortIcon('ingreso')" class="w-3 h-3 opacity-90" />
                </button>
              </th>
              <th class="px-3 py-3 text-right text-xs font-semibold">
                <button type="button" class="inline-flex items-center gap-1 w-full justify-end" @click="toggleSort('movilidad')">
                  Movilidad <UIcon :name="sortIcon('movilidad')" class="w-3 h-3 opacity-90" />
                </button>
              </th>
              <th class="px-3 py-3 text-left text-xs font-semibold">
                <button type="button" class="inline-flex items-center gap-1 w-full" @click="toggleSort('provincia')">
                  Provincia <UIcon :name="sortIcon('provincia')" class="w-3 h-3 opacity-90" />
                </button>
              </th>
              <th class="px-3 py-3 text-left text-xs font-semibold">
                <button type="button" class="inline-flex items-center gap-1 w-full" @click="toggleSort('ubicacion')">
                  Ubicacion <UIcon :name="sortIcon('ubicacion')" class="w-3 h-3 opacity-90" />
                </button>
              </th>
              <!-- <th class="px-3 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400">Empresa</th> -->
              <th class="px-3 py-3 text-center text-xs font-semibold">
                <button type="button" class="inline-flex items-center gap-1 w-full justify-center" @click="toggleSort('total')">
                  Total <UIcon :name="sortIcon('total')" class="w-3 h-3 opacity-90" />
                </button>
              </th>
              <th class="px-3 py-3 text-center text-xs font-semibold">
                <button type="button" class="inline-flex items-center gap-1 w-full justify-center" @click="toggleSort('vac')">
                  Vac. <UIcon :name="sortIcon('vac')" class="w-3 h-3 opacity-90" />
                </button>
              </th>
              <th class="px-3 py-3 text-center text-xs font-semibold">
                <button type="button" class="inline-flex items-center gap-1 w-full justify-center" @click="toggleSort('no_marcado')">
                  No marcó <UIcon :name="sortIcon('no_marcado')" class="w-3 h-3 opacity-90" />
                </button>
              </th>
              <th class="px-3 py-3 text-center text-xs font-semibold">
                <button type="button" class="inline-flex items-center gap-1 w-full justify-center" @click="toggleSort('dm')">
                  DM <UIcon :name="sortIcon('dm')" class="w-3 h-3 opacity-90" />
                </button>
              </th>
              <th class="px-3 py-3 text-center text-xs font-semibold">
                LCGH
              </th>
              <th class="px-3 py-3 text-center text-xs font-semibold">
                LSGH
              </th>
              <th class="px-3 py-3 text-right text-xs font-semibold">
                <button type="button" class="inline-flex items-center gap-1 w-full justify-end" @click="toggleSort('monto')">
                  Total a pagar <UIcon :name="sortIcon('monto')" class="w-3 h-3 opacity-90" />
                </button>
              </th>
              <!-- <th class="px-3 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400">Comentario</th> -->
              <th class="px-3 py-3 text-center text-xs font-semibold">Acciones</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
            <tr 
              v-for="(emp, idx) in datosOrdenados" 
              :key="emp.employee.id"
              class="transition-colors odd:bg-white even:bg-gray-50/40 hover:bg-[#eef4ff]/70 dark:odd:bg-gray-950 dark:even:bg-gray-900/25 dark:hover:bg-[#13203a]"
            >
              <td class="px-3 py-3 text-center text-gray-900 dark:text-gray-100 text-xs font-semibold font-mono tabular-nums w-12">
                {{ sortKey && sortDir === 'desc' ? (datosOrdenados.length - idx) : (idx + 1) }}
              </td>
              <td class="px-3 py-3 min-w-[220px]">
                <div class="min-w-0 flex flex-col gap-0.5">
                  <div class="min-w-0 truncate font-semibold text-[#2d5fc0] dark:text-[#9cb7f5] leading-tight">
                    {{ emp.employee.last_name }}
                  </div>
                  <div class="min-w-0 truncate text-gray-900 dark:text-gray-100 leading-tight">
                    {{ emp.employee.first_name }}
                  </div>
                  <div class="min-w-0 truncate font-mono text-xs text-gray-800 dark:text-gray-200">
                    {{ emp.employee.dni }}
                  </div>
                </div>
              </td>
              <td class="px-3 py-3 text-gray-600 dark:text-gray-400 text-xs font-mono">
                {{ formatDateLatam(emp.employee.create_time) }}
              </td>
              <td class="px-3 py-3 text-right">
                <span class="inline-flex items-center justify-end bg-[#eef4ff] dark:bg-[#13203a] text-[#2d5fc0] dark:text-[#9cb7f5] px-2.5 py-1 rounded-lg text-xs font-semibold border border-[#c9d9ff] dark:border-[#29406f] font-mono tabular-nums">
                  S/ {{ emp.summary.mobility_amount ? Number(emp.summary.mobility_amount).toFixed(2) : '0.00' }}
                </span>
              </td>
              <td class="px-3 py-3 text-gray-700 dark:text-gray-300 max-w-[200px] truncate" :title="emp.employee.department_name">{{ emp.employee.department_name }}</td>
              <td class="px-3 py-3 text-gray-700 dark:text-gray-300 max-w-[160px] truncate" :title="emp.employee.city">{{ emp.employee.city }}</td>

              <!-- <td class="px-3 py-3 text-gray-600 dark:text-gray-400">CECHRIZA</td> -->
              <td class="px-3 py-3 text-center">
                <span class="inline-flex items-center justify-center min-w-[38px] h-7 rounded-lg border border-gray-200/70 dark:border-gray-800/70 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 text-xs font-semibold font-mono tabular-nums">
                  {{ emp.summary.total_days ?? 0 }}
                </span>
              </td>
              <td class="px-3 py-3 text-center">
                <span class="inline-flex items-center justify-center min-w-[38px] h-7 rounded-lg border border-amber-200/70 dark:border-amber-800/60 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 text-xs font-semibold font-mono tabular-nums">
                  {{ emp.summary.vacation_days ?? 0 }}
                </span>
              </td>
              <td class="px-3 py-3 text-center">
                <span class="inline-flex items-center justify-center min-w-[38px] h-7 rounded-lg border border-gray-200/70 dark:border-gray-800/70 bg-gray-50 dark:bg-gray-900/40 text-gray-700 dark:text-gray-300 text-xs font-semibold font-mono tabular-nums">
                  {{ emp.summary.no_mark_days ?? 0 }}
                </span>
              </td>
              <td class="px-3 py-3 text-center">
                <span class="inline-flex items-center justify-center min-w-[38px] h-7 rounded-lg border border-[#c9d9ff] dark:border-[#29406f] bg-[#eef4ff] dark:bg-[#13203a] text-[#2d5fc0] dark:text-[#9cb7f5] text-xs font-semibold font-mono tabular-nums">
                  {{ emp.summary.medical_leave_days ?? 0 }}
                </span>
              </td>
              <td class="px-3 py-3 text-center">
                <span class="inline-flex items-center justify-center min-w-[38px] h-7 rounded-lg border border-slate-200/70 dark:border-slate-800/70 bg-slate-50 dark:bg-slate-900/30 text-slate-700 dark:text-slate-200 text-xs font-semibold font-mono tabular-nums">
                  {{ countCode(emp, MovilityReportCode.LCGH) || 0 }}
                </span>
              </td>
              <td class="px-3 py-3 text-center">
                <span class="inline-flex items-center justify-center min-w-[38px] h-7 rounded-lg border border-gray-200/70 dark:border-gray-800/70 bg-gray-50 dark:bg-gray-900/40 text-gray-700 dark:text-gray-300 text-xs font-semibold font-mono tabular-nums">
                  {{ countCode(emp, MovilityReportCode.LSGH) || 0 }}
                </span>
              </td>
              <td class="px-3 py-3 text-right">
                <span 
                  :class="[
                    'inline-flex justify-end px-2.5 py-1 rounded-lg text-xs font-semibold border font-mono tabular-nums',
                    emp.summary.total_mobility_to_pay < 0 
                      ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300 border-rose-200/70 dark:border-rose-800/60'
                      : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-200/70 dark:border-emerald-800/60'
                  ]"
                >
                  S/ {{ emp.summary.total_mobility_to_pay ? Number(emp.summary.total_mobility_to_pay).toFixed(2) : '0.00' }}
                </span>
              </td>
              <!-- <td class="px-4 py-3 text-gray-600 dark:text-gray-400">{{ emp.comments ?? "GAAAA" }}</td> -->
              <td class="px-3 py-3 text-center">
                <div class="flex items-center justify-center gap-1.5">
                  <button
                    @click="abrirRegistroConcepto(emp)"
                    class="p-2 text-[#2d5fc0] dark:text-[#9cb7f5] hover:bg-[#eef4ff] dark:hover:bg-[#13203a] rounded-lg transition-colors"
                    title="Registrar concepto"
                  >
                    <UIcon name="i-lucide-clipboard-plus" class="h-4 w-4" />
                  </button>

                  <button
                    @click="abrirRecordatorio(emp)"
                    class="relative p-2 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors"
                    title="Recordatorio mensual"
                  >
                    <UIcon name="i-lucide-sticky-note" class="h-4 w-4" />
                    <span
                      v-if="hasMonthlyComment(emp)"
                      class="absolute -top-1.5 -right-1.5 min-w-[16px] h-[16px] px-1 bg-amber-500 text-white text-[9px] font-semibold rounded-full flex items-center justify-center shadow-md border border-white dark:border-gray-900"
                    >
                      1
                    </span>
                  </button>

                  <button 
                    @click="verDetalle(emp)"
                    class="p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    title="Ver detalle"
                  >
                    <UIcon name="i-lucide-eye" class="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <DetailModal
      v-model:isOpen="isOpenModal"
      :employeeData="(empleadoSeleccionado as any)"
      :period-range="periodRange"
    />
    <EmployeeConceptModal
      v-model:isOpen="isOpenConceptModal"
      :employee="conceptoSeleccionado"
      :default-start="startDate"
      :default-end="endDate"
      :loading="isConceptSubmitting"
      @submit="registrarConcepto"
    />
    <EmployeeMonthlyReminderModal
      v-if="recordatorioSeleccionado"
      :open="isOpenReminder"
      :employee="{
        employee_id: recordatorioSeleccionado.employee.id,
        emp_code: recordatorioSeleccionado.employee.emp_code ?? recordatorioSeleccionado.employee.dni ?? String(recordatorioSeleccionado.employee.id),
        first_name: recordatorioSeleccionado.employee.first_name,
        last_name: recordatorioSeleccionado.employee.last_name,
      }"
      :year="yearForReminders"
      :initial-month="monthForReminders"
      :initial-comment="recordatorioSeleccionado.summary.monthly_comment ?? null"
      @saved="handleReminderSaved"
      @update:open="handleReminderOpenUpdate"
    />
  </div>
</template>

<script setup lang="ts">
import { CalendarDate, getLocalTimeZone, type DateValue } from '@internationalized/date'
import { apiFetch } from '~/services/api';
import DetailModal from './DetailModal.vue';
import EmployeeConceptModal from './EmployeeConceptModal.vue';
import EmployeeMonthlyReminderModal from '~/components/movility-report/EmployeeMonthlyReminderModal.vue'
import { MovilityReportCode, type EmployeeConceptPayload, type MovilityReport } from '~/interfaces/movility-report';

const toast = useToast();
const datosMoilityReports = ref<MovilityReport[]>([])
const isLoading = ref(true)
const isExporting = ref(false)

const fechaActual = new Date()

const payload = {
  start_date: '',
  end_date: '',
}

const isOpenModal = ref(false)
const empleadoSeleccionado = ref<MovilityReport | null>(null)
const isOpenConceptModal = shallowRef(false)
const conceptoSeleccionado = shallowRef<MovilityReport | null>(null)
const isConceptSubmitting = shallowRef(false)
const isOpenReminder = ref(false)
const recordatorioSeleccionado = shallowRef<MovilityReport | null>(null)

const hasMonthlyComment = (emp: MovilityReport) => Boolean(String(emp.summary?.monthly_comment ?? '').trim())

const countCode = (emp: MovilityReport, code: MovilityReportCode) => {
  let count = 0
  for (const v of Object.values(emp as any)) {
    if (!v || typeof v !== 'object') continue
    if (!('code' in v)) continue
    if ((v as any).code === code) count++
  }
  return count
}

const props = defineProps<{
  rangeDate?: {
    start: Date;
    end: Date;
  };
}>()

const filtroUsuario = ref('')

const toDateInputValue = (value: Date) => {
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, '0')
  const day = String(value.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const formatLatam = (value: Date) =>
  new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'America/Lima'
  }).format(value)

const getMonthDateLimit = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()

const getMonthlyRangeMax30 = (anchor: Date) => {
  const year = anchor.getFullYear()
  const month = anchor.getMonth()
  const start = new Date(year, month, 1)
  const end = new Date(year, month, Math.min(30, getMonthDateLimit(anchor)))

  return { start, end }
}

const selectedMonth = ref<Date>(new Date(
  (props.rangeDate?.start ?? fechaActual).getFullYear(),
  (props.rangeDate?.start ?? fechaActual).getMonth(),
  1
))

const periodRange = computed(() => getMonthlyRangeMax30(selectedMonth.value))

const startDate = computed(() => toDateInputValue(periodRange.value.start))
const endDate = computed(() => toDateInputValue(periodRange.value.end))

const periodDisplay = computed(() => `${formatLatam(periodRange.value.start)} - ${formatLatam(periodRange.value.end)}`)

const toCalendarMonth = (date: Date) => new CalendarDate(date.getFullYear(), date.getMonth() + 1, 1)
const toCalendarDate = (date: Date) => new CalendarDate(date.getFullYear(), date.getMonth() + 1, date.getDate())

const isDateDisabled = (value: DateValue) => {
  const d = value.toDate(getLocalTimeZone())
  const ts = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()

  const start = periodRange.value.start
  const end = periodRange.value.end
  const startTs = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime()
  const endTs = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime()

  return ts < startTs || ts > endTs
}

const calendarPlaceholder = ref<any>(toCalendarMonth(selectedMonth.value))

watch(selectedMonth, (value) => {
  const next = toCalendarMonth(value)
  if (calendarPlaceholder.value.year === next.year && calendarPlaceholder.value.month === next.month) return
  calendarPlaceholder.value = next
})

watch(calendarPlaceholder, (value) => {
  const next = new Date(value.year, value.month - 1, 1)
  if (
    next.getFullYear() === selectedMonth.value.getFullYear() &&
    next.getMonth() === selectedMonth.value.getMonth()
  ) return
  selectedMonth.value = next
})

const calendarRange = computed({
  get: () => ({
    start: toCalendarDate(periodRange.value.start),
    end: toCalendarDate(periodRange.value.end),
  }),
  set: (value: any) => {
    const anchor = value?.start ?? value?.end
    if (!anchor) return

    const anchorDate = anchor.toDate(getLocalTimeZone())
    selectedMonth.value = new Date(anchorDate.getFullYear(), anchorDate.getMonth(), 1)
  }
})

watch(
  () => props.rangeDate,
  (range) => {
    if (!range) return
    selectedMonth.value = new Date(range.start.getFullYear(), range.start.getMonth(), 1)
  },
  { immediate: true }
)

watch(
  periodRange,
  () => {
    payload.start_date = startDate.value
    payload.end_date = endDate.value
  },
  { immediate: true }
)

const yearForReminders = computed(() => {
  const raw = String(startDate.value || '').trim()
  const year = Number(raw.split('-')[0])
  return Number.isFinite(year) ? year : new Date().getFullYear()
})

const monthForReminders = computed(() => {
  const raw = String(startDate.value || '').trim()
  const month = Number(raw.split('-')[1])
  if (Number.isFinite(month) && month >= 1 && month <= 12) return month
  return new Date().getMonth() + 1
})

const periodMonthForReminders = computed(
  () => `${yearForReminders.value}-${String(monthForReminders.value).padStart(2, '0')}-01`
)

const handleReminderSaved = (payload: { employee_id: number; period_month: string; monthly_comment: string | null }) => {
  // La insignia en tabla refleja el mes del reporte actual (startDate).
  if (payload.period_month !== periodMonthForReminders.value) return

  datosMoilityReports.value = datosMoilityReports.value.map((r) => {
    if (r.employee.id !== payload.employee_id) return r
    return {
      ...r,
      summary: {
        ...(r.summary as any),
        monthly_comment: payload.monthly_comment,
      },
    } as any
  })

  if (recordatorioSeleccionado.value?.employee?.id === payload.employee_id) {
    recordatorioSeleccionado.value = {
      ...(recordatorioSeleccionado.value as any),
      summary: {
        ...((recordatorioSeleccionado.value as any).summary ?? {}),
        monthly_comment: payload.monthly_comment,
      },
    } as any
  }
}

type SortKey =
  | 'numero'
  | 'dni'
  | 'apellidos'
  | 'nombres'
  | 'cargo'
  | 'ingreso'
  | 'movilidad'
  | 'provincia'
  | 'ubicacion'
  | 'total'
  | 'vac'
  | 'no_marcado'
  | 'dm'
  | 'monto';

const sortKey = ref<SortKey | ''>('');
const sortDir = ref<'asc' | 'desc'>('asc');
const sortCollator = new Intl.Collator('es', { numeric: true, sensitivity: 'base' });

const toggleSort = (key: SortKey) => {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey.value = key;
    sortDir.value = 'asc';
  }
};

const sortIcon = (key: SortKey) => {
  if (sortKey.value !== key) return 'i-heroicons-arrows-up-down';
  return sortDir.value === 'asc' ? 'i-heroicons-arrow-up' : 'i-heroicons-arrow-down';
};

const employeeSortIcon = computed(() => {
  const key = (['dni', 'apellidos', 'nombres'] as const).includes(sortKey.value as any)
    ? (sortKey.value as SortKey)
    : 'apellidos'

  return sortIcon(key)
})

const getSortValue = (emp: MovilityReport, key: SortKey) => {
  switch (key) {
    case 'dni':
      return emp.employee.dni ?? '';
    case 'apellidos':
      return emp.employee.last_name ?? '';
    case 'nombres':
      return emp.employee.first_name ?? '';
    case 'cargo':
      return emp.employee.position_name ?? '';
    case 'ingreso':
      return emp.employee.create_time ?? '';
    case 'movilidad':
      return Number(emp.summary.mobility_amount) || 0;
    case 'provincia':
      return emp.employee.department_name ?? '';
    case 'ubicacion':
      return emp.employee.city ?? '';
    case 'total':
      return Number(emp.summary.total_days) || 0;
    case 'vac':
      return Number(emp.summary.vacation_days) || 0;
    case 'no_marcado':
      return Number(emp.summary.no_mark_days) || 0;
    case 'dm':
      return Number(emp.summary.medical_leave_days) || 0;
    case 'monto':
      return Number(emp.summary.total_mobility_to_pay) || 0;
    default:
      return '';
  }
};

const formatDateLatam = (raw: any) => {
  if (!raw) return '';
  const value = typeof raw === 'string' ? raw.replace(' ', 'T') : raw;
  const date = new Date(value);
  if (isNaN(date.getTime())) return String(raw);

  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'America/Lima'
  }).format(date);
};

const aplicarFiltros = () => {
  payload.start_date = startDate.value
  payload.end_date = endDate.value
  cargarMovilityReports()
}

function verDetalle(emp: MovilityReport) {
  empleadoSeleccionado.value = emp
  isOpenModal.value = true
}

function abrirRegistroConcepto(emp: MovilityReport) {
  conceptoSeleccionado.value = emp
  isOpenConceptModal.value = true
}

function abrirRecordatorio(emp: MovilityReport) {
  recordatorioSeleccionado.value = emp
  isOpenReminder.value = true
}

const handleReminderOpenUpdate = (v: boolean) => {
  isOpenReminder.value = v
  if (!v) recordatorioSeleccionado.value = null
}

const datosFiltrados = computed(() => {
  if (!filtroUsuario.value) return datosMoilityReports.value

  const q = filtroUsuario.value.toLowerCase()

  return datosMoilityReports.value.filter((emp) =>
    emp.employee.first_name.toLowerCase().includes(q) ||
    emp.employee.last_name.toLowerCase().includes(q) ||
    (emp.employee.emp_code ?? '').toLowerCase().includes(q) ||
    emp.employee.id.toString().includes(q) ||
    emp.employee.dni.toString().includes(q)
  )
})

const datosOrdenados = computed(() => {
  const list = datosFiltrados.value.slice();
  if (!sortKey.value) return list;

  const key = sortKey.value as SortKey;
  if (key === 'numero') {
    return sortDir.value === 'asc' ? list : list.reverse();
  }

  list.sort((a, b) => {
    const av = getSortValue(a, key);
    const bv = getSortValue(b, key);
    const cmp =
      typeof av === 'number' && typeof bv === 'number'
        ? av - bv
        : sortCollator.compare(String(av), String(bv));
    return sortDir.value === 'asc' ? cmp : -cmp;
  });
  return list;
});


const cargarMovilityReports = async () => {
  try {
    isLoading.value = true;
    const response = await apiFetch('/api/mobility/monthly-report', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    datosMoilityReports.value = response;

  } catch (error) {
    console.error('Error loading mobility reports:', error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  cargarMovilityReports();
});


async function descargarExcel() {
  if (isExporting.value) return

  isExporting.value = true
  try {
    const config = useRuntimeConfig();
    const token = useCookie<string | null>('auth_token');
    
    if (!token.value) {
      toast.add({
        title: 'Error',
        description: 'No hay token de autenticación',
        color: 'error'
      });
      return;
    }

    toast.add({
      id: 'exportando-movilidad',
      title: 'Preparando exportación',
      description: 'Generando archivo Excel...',
      icon: 'i-lucide-loader-2',
      duration: 0
    });

    const payloadExcel = {
      start_date: startDate.value,
      end_date: endDate.value,
      descargar: true
    };

    const response = await fetch(`${config.public.apiBaseUrl}/api/mobility/monthly-report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.value}`,
        'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
      body: JSON.stringify(payloadExcel),
    });

    if (!response.ok) {
      throw new Error(`Error HTTP ${response.status}`);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-movilidad-${startDate.value}-${endDate.value}.xlsx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);

    toast.remove('exportando-movilidad');
    toast.add({
      title: 'Descarga completa',
      description: 'El archivo se descargó correctamente',
      icon: 'i-lucide-check-circle',
      color: 'success',
      duration: 3000
    });

  } catch (error: any) {
    console.error('Error al descargar Excel:', error);
    toast.remove('exportando-movilidad');
    
    let errorTitle = 'Error al exportar';
    let errorDescription = 'No se pudo generar el archivo Excel';

    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      errorTitle = '🔌 Servidor no disponible';
      errorDescription = 'No se puede conectar con el backend. Verifica que esté corriendo.';
    } else if (error.message.includes('HTTP')) {
      errorTitle = 'Error del servidor';
      errorDescription = error.message;
    }

    toast.add({
      title: errorTitle,
      description: errorDescription,
      icon: 'i-lucide-alert-circle',
      color: 'error',
      duration: 8000
    });
  } finally {
    isExporting.value = false
  }
}

function agregarMontoMovilidad() {
  alert('Agregar monto movilidad de usuario (pendiente de implementar)');
}

const registrarConcepto = async (payload: EmployeeConceptPayload) => {
  if (isConceptSubmitting.value) return

  try {
    isConceptSubmitting.value = true
    await apiFetch('/api/employee-concepts', {
      method: 'POST',
      body: JSON.stringify(payload),
    })

    toast.add({
      title: 'Registro creado',
      description: 'El concepto fue registrado correctamente.',
      icon: 'i-lucide-check-circle',
      color: 'success',
      duration: 3000
    })

    isOpenConceptModal.value = false
    await cargarMovilityReports()
  } catch (error: any) {
    console.error('Error al registrar concepto:', error)
    toast.add({
      title: 'Error al registrar concepto',
      description: error?.message || 'No se pudo registrar el concepto.',
      icon: 'i-lucide-alert-circle',
      color: 'error',
      duration: 5000
    })
  } finally {
    isConceptSubmitting.value = false
  }
}
</script>


<style scoped></style>

