<template>
  <div class="flex flex-col h-full">
    <!-- FILTROS -->
    <div class="bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800 p-4 mb-6">
      <div class="flex flex-wrap gap-3 items-center justify-between">

        <div class="flex flex-1 gap-3 items-center flex-wrap">
          <!-- BUSCADOR -->
          <div class="relative flex-1 min-w-[250px]">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input 
              v-model="filtroUsuario" 
              type="text" 
              placeholder="Buscar por DNI, apellido o nombre..." 
              class="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-800 rounded-md bg-white dark:bg-gray-950 focus:border-gray-300 dark:focus:border-gray-700 focus:ring-0 transition-colors text-sm" 
            />
          </div>

          <!-- MES -->
          <div class="relative">
            <select 
              v-model="mesSeleccionado" 
              class="appearance-none border border-gray-200 dark:border-gray-800 rounded-md pl-3 pr-8 py-2 bg-white dark:bg-gray-950 focus:border-gray-300 dark:focus:border-gray-700 focus:ring-0 transition-colors text-sm text-gray-900 dark:text-gray-100 cursor-pointer"
            >
              <option v-for="mes in meses" :key="mes.valor" :value="mes.valor">
                {{ mes.nombre }}
              </option>
            </select>
            <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <svg class="h-4 w-4 text-gray-400 dark:text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </div>
          </div>

          <!-- AÑO -->
          <input 
            type="number" 
            v-model.number="añoSeleccionado" 
            min="2020" 
            max="2030" 
            class="border border-gray-200 dark:border-gray-800 rounded-md px-4 py-2 text-sm w-28 text-center bg-white dark:bg-gray-950 focus:border-gray-300 dark:focus:border-gray-700 focus:ring-0 transition-colors font-medium text-gray-900 dark:text-gray-100"
          />

          <!-- BOTÓN APLICAR -->
          <button 
            @click="aplicarFiltros" 
            class="bg-gray-900 dark:bg-gray-100 hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-gray-900 px-4 py-2 rounded-md transition-colors flex items-center gap-2 font-medium text-sm"
          >
            <span>Aplicar</span>
          </button>
        </div>

        <!-- BOTONES ACCIONES -->
        <div class="flex items-center gap-2">
          <button 
            @click="descargarExcel" 
            class="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 hover:bg-gray-50 dark:hover:bg-gray-900 text-gray-900 dark:text-gray-100 px-4 py-2 rounded-md transition-colors flex items-center gap-2 font-medium text-sm"
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
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
              <th class="px-3 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400">ID</th>
              <th class="px-3 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400">DNI</th>
              <th class="px-3 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400">Apellidos</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400">Nombres</th>
              <th class="px-3 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400">Cargo</th>
              <th class="px-3 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400">Ingreso</th>
              <th class="px-3 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400">Movilidad</th>
              <th class="px-3 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400">Provincia</th>
              <th class="px-3 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400">Ubicacion</th>
              <!-- <th class="px-3 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400">Empresa</th> -->
              <th class="px-3 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400">Total</th>
              <th class="px-3 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400">Vac.</th>
              <th class="px-3 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400">No marcó</th>
              <th class="px-3 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400">DM</th>
              <th class="px-3 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400">Monto</th>
              <!-- <th class="px-3 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400">Comentario</th> -->
              <th class="px-3 py-3 text-center text-xs font-medium text-gray-600 dark:text-gray-400">Acciones</th>
            </tr>
          </thead>

          <tbody>
            <tr 
              v-for="emp in datosFiltrados" 
              :key="emp.employee.id"
              class="border-b border-gray-100 dark:border-gray-900 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
            >
              <td class="px-3 py-3 text-gray-900 dark:text-gray-100">{{ emp.employee.id }}</td>
              <td class="px-3 py-3 text-gray-900 dark:text-gray-100">{{ emp.employee.dni }}</td>
              <td class="px-3 py-3 text-gray-900 dark:text-gray-100">{{ emp.employee.last_name }}</td>
              <td class="px-4 py-3 text-gray-900 dark:text-gray-100">{{ emp.employee.first_name }}</td>
              <td class="px-3 py-3 text-gray-600 dark:text-gray-400">{{ emp.employee.position_name }}</td>
              <td class="px-3 py-3 text-gray-600 dark:text-gray-400">{{ emp.employee.create_time }}</td>
              <td class="px-3 py-3">
                <span class="inline-block bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-3 py-1 rounded text-xs font-semibold">
                  S/ {{ emp.summary.mobility_amount ? Number(emp.summary.mobility_amount).toFixed(2) : '0.00' }}
                </span>
              </td>
              <td class="px-3 py-3 text-gray-600 dark:text-gray-400">{{ emp.employee.department_name }}</td>
              <td class="px-3 py-3 text-gray-600 dark:text-gray-400">{{ emp.employee.city }}</td>

              <!-- <td class="px-3 py-3 text-gray-600 dark:text-gray-400">CECHRIZA</td> -->
              <td class="px-3 py-3">
                <span class="font-semibold text-gray-900 dark:text-gray-100">
                  {{ emp.summary.total_days }}
                </span>
              </td>
              <td class="px-3 py-3">
                <span class="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2.5 py-1 rounded text-xs font-medium">
                  {{ emp.summary.vacation_days }}
                </span>
              </td>
              <td class="px-3 py-3">
                <span class="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2.5 py-1 rounded text-xs font-medium">
                  {{ emp.summary.no_mark_days }}
                </span>
              </td>
              <td class="px-3 py-3 text-gray-900 dark:text-gray-100">{{ emp.summary.medical_leave_days }}</td>
              <td class="px-3 py-3">
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
              <td class="px-3 py-3 text-center">
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
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <DetailModal v-model:isOpen="isOpenModal" :employeeData="empleadoSeleccionado"></DetailModal>
  </div>
</template>

<script setup lang="ts">
import { apiFetch } from '~/services/api';
import DetailModal from './DetailModal.vue';

const toast = useToast();
const datosMoilityReports = ref([])
const isLoading = ref(true)

const fechaActual = new Date()
const mesActual = fechaActual.getMonth() + 1 
const añoActual = fechaActual.getFullYear()

const payload = {
  year: añoActual,
  month: mesActual,
}

const isOpenModal = ref(false)
const empleadoSeleccionado = ref<any>(null)

const mesSeleccionado = ref(payload.month)
const añoSeleccionado = ref(payload.year)
const filtroUsuario = ref('')

const meses = [
  { valor: 1, nombre: 'Enero' },
  { valor: 2, nombre: 'Febrero' },
  { valor: 3, nombre: 'Marzo' },
  { valor: 4, nombre: 'Abril' },
  { valor: 5, nombre: 'Mayo' },
  { valor: 6, nombre: 'Junio' },
  { valor: 7, nombre: 'Julio' },
  { valor: 8, nombre: 'Agosto' },
  { valor: 9, nombre: 'Septiembre' },
  { valor: 10, nombre: 'Octubre' },
  { valor: 11, nombre: 'Noviembre' },
  { valor: 12, nombre: 'Diciembre' },
]

const aplicarFiltros = () => {
  payload.month = mesSeleccionado.value
  payload.year = añoSeleccionado.value
  cargarMovilityReports()
}

function verDetalle(emp: any) {
  empleadoSeleccionado.value = emp
  isOpenModal.value = true
}

const datosFiltrados = computed(() => {
  if (!filtroUsuario.value) return datosMoilityReports.value

  const q = filtroUsuario.value.toLowerCase()

  return datosMoilityReports.value.filter((emp: any) =>
    emp.employee.first_name.toLowerCase().includes(q) ||
    emp.employee.last_name.toLowerCase().includes(q) ||
    emp.employee.id.toString().includes(q)
  )
})


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
      year: añoSeleccionado.value,
      month: mesSeleccionado.value,
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
    a.download = `reporte-movilidad-${mesSeleccionado.value}-${añoSeleccionado.value}.xlsx`;
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
</script>


<style scoped></style>