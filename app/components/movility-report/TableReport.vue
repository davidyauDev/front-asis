<template>
  <div class="flex flex-col h-full">
        <!-- FILTROS -->
    <div class="bg-white/80 dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 p-4 mb-6 shadow-sm backdrop-blur">
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
              placeholder="Buscar por DNI, apellido o nombre..." 
              class="w-full h-10 pl-10 pr-4 border border-gray-200 dark:border-gray-800 rounded-md bg-white dark:bg-gray-950 focus:border-gray-300 dark:focus:border-gray-700 focus:ring-2 focus:ring-primary-500/30 transition-colors text-sm" 
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
              class="h-10 border border-gray-200 dark:border-gray-800 rounded-md px-3 text-sm bg-white dark:bg-gray-950 focus:border-gray-300 dark:focus:border-gray-700 focus:ring-2 focus:ring-primary-500/30 transition-colors font-medium text-gray-900 dark:text-gray-100"
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
              class="h-10 border border-gray-200 dark:border-gray-800 rounded-md px-3 text-sm bg-white dark:bg-gray-950 focus:border-gray-300 dark:focus:border-gray-700 focus:ring-2 focus:ring-primary-500/30 transition-colors font-medium text-gray-900 dark:text-gray-100"
            />
          </div>

          <!-- BOTON APLICAR -->
          <div class="flex flex-col">
            <span class="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1 min-h-[16px] opacity-0 select-none">
              Accion
            </span>
            <button 
              @click="aplicarFiltros" 
              class="h-10 bg-primary-600 hover:bg-primary-700 text-white px-4 rounded-md transition-colors flex items-center gap-2 font-semibold text-sm shadow-sm"
            >
              <span>Aplicar</span>
            </button>
          </div>
        </div>

        <!-- BOTONES ACCIONES -->
        <div class="flex items-center gap-2 pt-[16px]">
          <button 
            @click="descargarExcel" 
            class="h-10 border border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-900/30 text-primary-700 dark:text-primary-200 px-4 rounded-md transition-colors flex items-center gap-2 font-semibold text-sm"
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

    <div class="bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
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
        <table class="w-full text-sm border-separate border-spacing-0">
          <thead>
            <tr class="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
              <th class="px-3 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800">
                <button type="button" class="inline-flex items-center gap-1 w-full" @click="toggleSort('dni')">
                  DNI <UIcon :name="sortIcon('dni')" class="w-3 h-3" />
                </button>
              </th>
              <th class="px-3 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800">
                <button type="button" class="inline-flex items-center gap-1 w-full" @click="toggleSort('apellidos')">
                  Apellidos <UIcon :name="sortIcon('apellidos')" class="w-3 h-3" />
                </button>
              </th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800">
                <button type="button" class="inline-flex items-center gap-1 w-full" @click="toggleSort('nombres')">
                  Nombres <UIcon :name="sortIcon('nombres')" class="w-3 h-3" />
                </button>
              </th>
              <th class="px-3 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800">
                <button type="button" class="inline-flex items-center gap-1 w-full" @click="toggleSort('ingreso')">
                  Ingreso <UIcon :name="sortIcon('ingreso')" class="w-3 h-3" />
                </button>
              </th>
              <th class="px-3 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800">
                <button type="button" class="inline-flex items-center gap-1 w-full" @click="toggleSort('movilidad')">
                  Movilidad <UIcon :name="sortIcon('movilidad')" class="w-3 h-3" />
                </button>
              </th>
              <th class="px-3 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800">
                <button type="button" class="inline-flex items-center gap-1 w-full" @click="toggleSort('provincia')">
                  Provincia <UIcon :name="sortIcon('provincia')" class="w-3 h-3" />
                </button>
              </th>
              <th class="px-3 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800">
                <button type="button" class="inline-flex items-center gap-1 w-full" @click="toggleSort('ubicacion')">
                  Ubicacion <UIcon :name="sortIcon('ubicacion')" class="w-3 h-3" />
                </button>
              </th>
              <!-- <th class="px-3 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400">Empresa</th> -->
              <th class="px-3 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800">
                <button type="button" class="inline-flex items-center gap-1 w-full" @click="toggleSort('total')">
                  Total <UIcon :name="sortIcon('total')" class="w-3 h-3" />
                </button>
              </th>
              <th class="px-3 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800">
                <button type="button" class="inline-flex items-center gap-1 w-full" @click="toggleSort('vac')">
                  Vac. <UIcon :name="sortIcon('vac')" class="w-3 h-3" />
                </button>
              </th>
              <th class="px-3 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800">
                <button type="button" class="inline-flex items-center gap-1 w-full" @click="toggleSort('no_marcado')">
                  No marcó <UIcon :name="sortIcon('no_marcado')" class="w-3 h-3" />
                </button>
              </th>
              <th class="px-3 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800">
                <button type="button" class="inline-flex items-center gap-1 w-full" @click="toggleSort('dm')">
                  DM <UIcon :name="sortIcon('dm')" class="w-3 h-3" />
                </button>
              </th>
              <th class="px-3 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800">
                <button type="button" class="inline-flex items-center gap-1 w-full" @click="toggleSort('monto')">
                  Monto <UIcon :name="sortIcon('monto')" class="w-3 h-3" />
                </button>
              </th>
              <!-- <th class="px-3 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400">Comentario</th> -->
              <th class="px-3 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800">Acciones</th>
            </tr>
          </thead>

          <tbody>
            <tr 
              v-for="emp in datosOrdenados" 
              :key="emp.employee.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
            >
              <td class="px-3 py-3 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-800">{{ emp.employee.dni }}</td>
              <td class="px-3 py-3 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-800">{{ emp.employee.last_name }}</td>
              <td class="px-4 py-3 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-800">{{ emp.employee.first_name }}</td>
              <td class="px-3 py-3 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800">
                {{ formatDateLatam(emp.employee.create_time) }}
              </td>
              <td class="px-3 py-3 border border-gray-200 dark:border-gray-800">
                <span class="inline-block bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-3 py-1 rounded text-xs font-semibold">
                  S/ {{ emp.summary.mobility_amount ? Number(emp.summary.mobility_amount).toFixed(2) : '0.00' }}
                </span>
              </td>
              <td class="px-3 py-3 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800">{{ emp.employee.department_name }}</td>
              <td class="px-3 py-3 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800">{{ emp.employee.city }}</td>

              <!-- <td class="px-3 py-3 text-gray-600 dark:text-gray-400">CECHRIZA</td> -->
              <td class="px-3 py-3 border border-gray-200 dark:border-gray-800">
                <span class="font-semibold text-gray-900 dark:text-gray-100">
                  {{ emp.summary.total_days }}
                </span>
              </td>
              <td class="px-3 py-3 border border-gray-200 dark:border-gray-800">
                <span class="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2.5 py-1 rounded text-xs font-medium">
                  {{ emp.summary.vacation_days }}
                </span>
              </td>
              <td class="px-3 py-3 border border-gray-200 dark:border-gray-800">
                <span class="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2.5 py-1 rounded text-xs font-medium">
                  {{ emp.summary.no_mark_days }}
                </span>
              </td>
              <td class="px-3 py-3 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-800">{{ emp.summary.medical_leave_days }}</td>
              <td class="px-3 py-3 border border-gray-200 dark:border-gray-800">
                <span 
                  :class="[
                    'px-3 py-1 rounded text-xs font-semibold',
                    emp.summary.total_mobility_to_pay < 0 
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                      : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                  ]"
                >
                  S/ {{ emp.summary.total_mobility_to_pay ? Number(emp.summary.total_mobility_to_pay).toFixed(2) : '0.00' }}
                </span>
              </td>
              <!-- <td class="px-4 py-3 text-gray-600 dark:text-gray-400">{{ emp.comments ?? "GAAAA" }}</td> -->
              <td class="px-3 py-3 text-center border border-gray-200 dark:border-gray-800">
                <div class="flex items-center justify-center gap-2">
                  <button
                    @click="abrirRegistroConcepto(emp)"
                    class="p-2 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-md transition-colors"
                    title="Registrar concepto"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                  </button>
                  <button 
                    @click="verDetalle(emp)"
                    class="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
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

    <DetailModal v-model:isOpen="isOpenModal" :employeeData="empleadoSeleccionado"></DetailModal>
    <EmployeeConceptModal
      v-model:isOpen="isOpenConceptModal"
      :employee="conceptoSeleccionado"
      :default-start="startDate"
      :default-end="endDate"
      :loading="isConceptSubmitting"
      @submit="registrarConcepto"
    />
  </div>
</template>

<script setup lang="ts">
import { apiFetch } from '~/services/api';
import DetailModal from './DetailModal.vue';
import EmployeeConceptModal from './EmployeeConceptModal.vue';
import type { EmployeeConceptPayload, MovilityReport } from '~/interfaces/movility-report';

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

const props = defineProps<{
  rangeDate?: {
    start: Date;
    end: Date;
  };
}>()

const startDate = ref('')
const endDate = ref('')
const filtroUsuario = ref('')

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

const datosFiltrados = computed(() => {
  if (!filtroUsuario.value) return datosMoilityReports.value

  const q = filtroUsuario.value.toLowerCase()

  return datosMoilityReports.value.filter((emp) =>
    emp.employee.first_name.toLowerCase().includes(q) ||
    emp.employee.last_name.toLowerCase().includes(q) ||
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
      timeout: 0
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
      color: 'green',
      timeout: 3000
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
      timeout: 8000
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
      color: 'green',
      timeout: 3000
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
      timeout: 5000
    })
  } finally {
    isConceptSubmitting.value = false
  }
}
</script>


<style scoped></style>

