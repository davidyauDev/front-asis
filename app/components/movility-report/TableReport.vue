<template>
  <div class="flex flex-col h-full">
        <!-- FILTROS -->
    <div class="bg-white/85 dark:bg-gray-950/70 rounded-xl border border-gray-200/80 dark:border-gray-800 p-4 mb-6 shadow-sm backdrop-blur">
      <div class="flex flex-wrap gap-4 items-center justify-between">

        <div class="flex flex-1 gap-3 items-end flex-wrap">
          <!-- BUSCADOR -->
          <div class="relative flex-1 min-w-[250px]">
            <label class="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1 min-h-[16px]">
              Buscar
            </label>
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input 
              v-model="filtroUsuario" 
              type="text" 
              placeholder="Buscar por DNI, código, apellido o nombre..." 
              class="w-full h-10 pl-10 pr-4 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-950 focus:border-primary-300 dark:focus:border-primary-700 focus:ring-2 focus:ring-primary-500/25 transition-colors text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500" 
            />
          </div>

          <!-- DESDE -->
          <div>
            <label class="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1 min-h-[16px]">
              Desde
            </label>
            <input
              v-model="startDate"
              type="date"
              class="h-10 border border-gray-200 dark:border-gray-800 rounded-lg px-3 text-sm bg-white dark:bg-gray-950 focus:border-primary-300 dark:focus:border-primary-700 focus:ring-2 focus:ring-primary-500/25 transition-colors font-medium text-gray-900 dark:text-gray-100"
            />
          </div>

          <!-- HASTA -->
          <div>
            <label class="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1 min-h-[16px]">
              Hasta
            </label>
            <input
              v-model="endDate"
              type="date"
              class="h-10 border border-gray-200 dark:border-gray-800 rounded-lg px-3 text-sm bg-white dark:bg-gray-950 focus:border-primary-300 dark:focus:border-primary-700 focus:ring-2 focus:ring-primary-500/25 transition-colors font-medium text-gray-900 dark:text-gray-100"
            />
          </div>

          <!-- BOTON APLICAR -->
          <div class="flex flex-col">
            <span class="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1 min-h-[16px] opacity-0 select-none">
              Accion
            </span>
            <button 
              @click="aplicarFiltros" 
              class="h-10 bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white px-4 rounded-lg transition-colors flex items-center gap-2 font-semibold text-sm shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-950"
            >
              <span>Aplicar</span>
            </button>
          </div>
        </div>

        <!-- BOTONES ACCIONES -->
        <div class="flex items-center gap-2 pt-[16px]">
          <button 
            @click="descargarExcel" 
            class="h-10 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 hover:bg-gray-50 dark:hover:bg-gray-900/40 text-gray-800 dark:text-gray-200 px-4 rounded-lg transition-colors flex items-center gap-2 font-semibold text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/30 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-950"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span class="hidden sm:inline">Excel</span>
          </button>
          
          <!-- <button 
            @click="agregarMontoMovilidad" 
            class="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 hover:bg-gray-50 dark:hover:bg-gray-900 text-gray-900 dark:text-gray-100 px-4 py-2 rounded-md transition-colors flex items-center gap-2 font-medium text-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span class="hidden sm:inline">Agregar monto</span>
          </button> -->
        </div>
      </div>
    </div>

    <!-- TABLA -->

    <div class="bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
      <!-- ESTADO DE CARGA -->
      <div v-if="isLoading" class="flex flex-col items-center justify-center py-16">
        <svg class="animate-spin h-10 w-10 text-gray-900 dark:text-gray-100 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="text-gray-600 dark:text-gray-400 font-medium text-sm">Cargando reporte...</p>
      </div>

      <!-- TABLA -->
      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="sticky top-0 z-10 bg-gray-50/95 dark:bg-gray-900/80 backdrop-blur border-b border-gray-200 dark:border-gray-800">
              <th class="px-3 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-200">
                <button type="button" class="inline-flex items-center gap-1 w-full" @click="toggleSort('dni')">
                  DNI <UIcon :name="sortIcon('dni')" class="w-3 h-3" />
                </button>
              </th>
              <th class="px-3 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-200">
                <button type="button" class="inline-flex items-center gap-1 w-full" @click="toggleSort('apellidos')">
                  Apellidos <UIcon :name="sortIcon('apellidos')" class="w-3 h-3" />
                </button>
              </th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-200">
                <button type="button" class="inline-flex items-center gap-1 w-full" @click="toggleSort('nombres')">
                  Nombres <UIcon :name="sortIcon('nombres')" class="w-3 h-3" />
                </button>
              </th>
              <th class="px-3 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-200">
                <button type="button" class="inline-flex items-center gap-1 w-full" @click="toggleSort('ingreso')">
                  Ingreso <UIcon :name="sortIcon('ingreso')" class="w-3 h-3" />
                </button>
              </th>
              <th class="px-3 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-200">
                <button type="button" class="inline-flex items-center gap-1 w-full justify-end" @click="toggleSort('movilidad')">
                  Movilidad <UIcon :name="sortIcon('movilidad')" class="w-3 h-3" />
                </button>
              </th>
              <th class="px-3 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-200">
                <button type="button" class="inline-flex items-center gap-1 w-full" @click="toggleSort('provincia')">
                  Provincia <UIcon :name="sortIcon('provincia')" class="w-3 h-3" />
                </button>
              </th>
              <th class="px-3 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-200">
                <button type="button" class="inline-flex items-center gap-1 w-full" @click="toggleSort('ubicacion')">
                  Ubicacion <UIcon :name="sortIcon('ubicacion')" class="w-3 h-3" />
                </button>
              </th>
              <!-- <th class="px-3 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400">Empresa</th> -->
              <th class="px-3 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-200">
                <button type="button" class="inline-flex items-center gap-1 w-full justify-end" @click="toggleSort('total')">
                  Total <UIcon :name="sortIcon('total')" class="w-3 h-3" />
                </button>
              </th>
              <th class="px-3 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-200">
                <button type="button" class="inline-flex items-center gap-1 w-full justify-end" @click="toggleSort('vac')">
                  Vac. <UIcon :name="sortIcon('vac')" class="w-3 h-3" />
                </button>
              </th>
              <th class="px-3 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-200">
                <button type="button" class="inline-flex items-center gap-1 w-full justify-end" @click="toggleSort('no_marcado')">
                  No marcó <UIcon :name="sortIcon('no_marcado')" class="w-3 h-3" />
                </button>
              </th>
              <th class="px-3 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-200">
                <button type="button" class="inline-flex items-center gap-1 w-full justify-end" @click="toggleSort('dm')">
                  DM <UIcon :name="sortIcon('dm')" class="w-3 h-3" />
                </button>
              </th>
              <th class="px-3 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-200">
                <button type="button" class="inline-flex items-center gap-1 w-full justify-end" @click="toggleSort('monto')">
                  Total a pagar <UIcon :name="sortIcon('monto')" class="w-3 h-3" />
                </button>
              </th>
              <!-- <th class="px-3 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400">Comentario</th> -->
              <th class="px-3 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-200">Acciones</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
            <tr 
              v-for="emp in datosOrdenados" 
              :key="emp.employee.id"
              class="transition-colors odd:bg-white even:bg-gray-50/40 hover:bg-primary-50/40 dark:odd:bg-gray-950 dark:even:bg-gray-900/25 dark:hover:bg-primary-900/10"
            >
              <td class="px-3 py-3 text-gray-900 dark:text-gray-100 font-mono text-xs">{{ emp.employee.dni }}</td>
              <td class="px-3 py-3 text-gray-900 dark:text-gray-100 font-semibold">{{ emp.employee.last_name }}</td>
              <td class="px-4 py-3 text-gray-900 dark:text-gray-100">{{ emp.employee.first_name }}</td>
              <td class="px-3 py-3 text-gray-600 dark:text-gray-400 text-xs font-mono">
                {{ formatDateLatam(emp.employee.create_time) }}
              </td>
              <td class="px-3 py-3 text-right">
                <span class="inline-flex items-center justify-end bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-300 px-2.5 py-1 rounded-lg text-xs font-semibold border border-sky-200/70 dark:border-sky-800/60 font-mono tabular-nums">
                  S/ {{ emp.summary.mobility_amount ? Number(emp.summary.mobility_amount).toFixed(2) : '0.00' }}
                </span>
              </td>
              <td class="px-3 py-3 text-gray-700 dark:text-gray-300 max-w-[200px] truncate" :title="emp.employee.department_name">{{ emp.employee.department_name }}</td>
              <td class="px-3 py-3 text-gray-700 dark:text-gray-300 max-w-[160px] truncate" :title="emp.employee.city">{{ emp.employee.city }}</td>

              <!-- <td class="px-3 py-3 text-gray-600 dark:text-gray-400">CECHRIZA</td> -->
              <td class="px-3 py-3 text-right">
                <span class="font-semibold text-gray-900 dark:text-gray-100 font-mono tabular-nums">
                  {{ emp.summary.total_days }}
                </span>
              </td>
              <td class="px-3 py-3 text-right">
                <span class="inline-flex justify-end bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 px-2.5 py-1 rounded-lg text-xs font-medium border border-amber-200/70 dark:border-amber-800/60 font-mono tabular-nums">
                  {{ emp.summary.vacation_days }}
                </span>
              </td>
              <td class="px-3 py-3 text-right">
                <span class="inline-flex justify-end bg-gray-50 dark:bg-gray-900/40 text-gray-700 dark:text-gray-300 px-2.5 py-1 rounded-lg text-xs font-medium border border-gray-200/70 dark:border-gray-800/70 font-mono tabular-nums">
                  {{ emp.summary.no_mark_days }}
                </span>
              </td>
              <td class="px-3 py-3 text-right text-gray-900 dark:text-gray-100 font-mono tabular-nums">{{ emp.summary.medical_leave_days }}</td>
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
                    class="p-2 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                    title="Registrar concepto"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                  </button>

                  <button
                    @click="abrirRecordatorio(emp)"
                    class="relative p-2 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors"
                    title="Recordatorio mensual"
                  >
                    <UIcon name="i-lucide-sticky-note" class="h-4 w-4" />
                    <span
                      v-if="countEmployeeYear(emp.employee.id, yearForReminders)"
                      class="absolute -top-1.5 -right-1.5 min-w-[16px] h-[16px] px-1 bg-amber-500 text-white text-[9px] font-semibold rounded-full flex items-center justify-center shadow-md border border-white dark:border-gray-900"
                    >
                      {{ countEmployeeYear(emp.employee.id, yearForReminders) }}
                    </span>
                  </button>

                  <button 
                    @click="verDetalle(emp)"
                    class="p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    title="Ver detalle"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <DetailModal v-model:isOpen="isOpenModal" :employeeData="(empleadoSeleccionado as any)"></DetailModal>
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
      @update:open="handleReminderOpenUpdate"
    />
  </div>
</template>

<script setup lang="ts">
import { apiFetch } from '~/services/api';
import DetailModal from './DetailModal.vue';
import EmployeeConceptModal from './EmployeeConceptModal.vue';
import EmployeeMonthlyReminderModal from '~/components/movility-report/EmployeeMonthlyReminderModal.vue'
import type { EmployeeConceptPayload, MovilityReport } from '~/interfaces/movility-report';
import { useEmployeeMobilityReminders } from '~/composables/useEmployeeMobilityReminders'

const toast = useToast();
const datosMoilityReports = ref<MovilityReport[]>([])
const isLoading = ref(true)

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

const { countEmployeeYear } = useEmployeeMobilityReminders()

const props = defineProps<{
  rangeDate?: {
    start: Date;
    end: Date;
  };
}>()

const startDate = ref('')
const endDate = ref('')
const filtroUsuario = ref('')

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

type SortKey =
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

const toDateInputValue = (value: Date) => {
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, '0')
  const day = String(value.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const initStart = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 1)
const initEnd = new Date(fechaActual.getFullYear(), fechaActual.getMonth() + 1, 0)
startDate.value = toDateInputValue(initStart)
endDate.value = toDateInputValue(initEnd)
payload.start_date = startDate.value
payload.end_date = endDate.value

watch(
  () => props.rangeDate,
  (range) => {
    if (!range) return
    if (range.start) startDate.value = toDateInputValue(range.start)
    if (range.end) endDate.value = toDateInputValue(range.end)
    payload.start_date = startDate.value
    payload.end_date = endDate.value
  },
  { immediate: true }
)

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

