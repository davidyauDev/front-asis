<template>
  <div class="flex flex-col h-full">
    <!-- FILTROS -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
      <div class="flex flex-wrap gap-3 items-center justify-between">

        <div class="flex flex-1 gap-3 items-center flex-wrap">
          <!-- BUSCADOR -->
          <div class="relative flex-1 min-w-[250px]">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input 
              v-model="filtroUsuario" 
              type="text" 
              placeholder="Buscar por DNI, apellido o nombre..." 
              class="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm" 
            />
          </div>

          <!-- MES -->
          <div class="relative">
            <select 
              v-model="mesSeleccionado" 
              class="appearance-none border border-gray-300 rounded-lg pl-10 pr-10 py-2.5 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm font-medium text-gray-700 cursor-pointer hover:border-gray-400"
            >
              <option v-for="mes in meses" :key="mes.valor" :value="mes.valor">
                {{ mes.nombre }}
              </option>
            </select>
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <svg class="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
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
            class="border border-gray-300 rounded-lg px-4 py-2.5 text-sm w-28 text-center bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium text-gray-700"
          />

          <!-- BOTÓN APLICAR -->
          <button 
            @click="aplicarFiltros" 
            class="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg transition-all shadow-md hover:shadow-lg flex items-center gap-2 font-medium text-sm"
          >
            <span>Aplicar</span>
          </button>
        </div>

        <!-- BOTONES ACCIONES -->
        <div class="flex items-center gap-2">
          <button 
            @click="descargarExcel" 
            class="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg transition-all shadow-md hover:shadow-lg flex items-center gap-2 font-medium text-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span class="hidden sm:inline">Excel</span>
          </button>
          
          <button 
            @click="agregarMontoMovilidad" 
            class="bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-lg transition-all shadow-md hover:shadow-lg flex items-center gap-2 font-medium text-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span class="hidden sm:inline">Agregar monto</span>
          </button>
        </div>
      </div>
    </div>

    <!-- TABLA -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <!-- ESTADO DE CARGA -->
      <div v-if="isLoading" class="flex flex-col items-center justify-center py-16">
        <svg class="animate-spin h-12 w-12 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="text-gray-600 font-medium">Cargando reporte de movilidad...</p>
      </div>

      <!-- TABLA -->
      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gray-800 text-white text-xs uppercase">
              <th class="px-3 py-3 text-left font-semibold">ID</th>
              <th class="px-3 py-3 text-left font-semibold">DNI</th>
              <th class="px-3 py-3 text-left font-semibold">Apellidos</th>
              <th class="px-4 py-3 text-left font-semibold">Nombres</th>
              <th class="px-3 py-3 text-left font-semibold bg-gray-700">Cargo</th>
              <th class="px-3 py-3 text-left font-semibold bg-gray-700">Ingreso</th>
              <th class="px-3 py-3 text-left font-semibold bg-gray-700">Movilidad</th>
              <th class="px-3 py-3 text-left font-semibold bg-emerald-700">Provincia</th>
              <th class="px-3 py-3 text-left font-semibold bg-emerald-700">Empresa</th>
              <th class="px-3 py-3 text-left font-semibold bg-emerald-800">Total</th>
              <th class="px-3 py-3 text-left font-semibold bg-emerald-600">Vac.</th>
              <th class="px-3 py-3 text-left font-semibold bg-gray-600">No marcó</th>
              <th class="px-3 py-3 text-left font-semibold bg-red-600">DM</th>
              <th class="px-3 py-3 text-left font-semibold bg-green-700">Monto</th>
              <th class="px-3 py-3 text-left font-semibold bg-amber-300 text-gray-900">Comentario</th>
              <th class="px-3 py-3 text-center font-semibold bg-gray-700">Acciones</th>
            </tr>
          </thead>

          <tbody>
            <tr 
              v-for="emp in datosFiltrados" 
              :key="emp.employee.id"
              class="border-b border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <td class="px-3 py-3 text-gray-900">{{ emp.employee.id }}</td>
              <td class="px-3 py-3 text-gray-900">{{ emp.employee.dni }}</td>
              <td class="px-3 py-3 text-gray-900">{{ emp.employee.last_name }}</td>
              <td class="px-4 py-3 text-gray-900">{{ emp.employee.first_name }}</td>
              <td class="px-3 py-3 text-gray-700">{{ emp.employee.position_name }}</td>
              <td class="px-3 py-3 text-gray-700">28/03/2022</td>
              <td class="px-3 py-3">
                <span class="inline-block bg-gray-100 text-gray-700 px-2.5 py-1 rounded-lg text-xs font-medium">
                  S/ 150.00
                </span>
              </td>
              <td class="px-3 py-3 text-gray-700">{{ emp.employee.department_name }}</td>
              <td class="px-3 py-3 text-gray-700">CECHRIZA</td>
              <td class="px-3 py-3">
                <span class="font-semibold text-emerald-700">
                  {{ emp.summary.total_days }}
                </span>
              </td>
              <td class="px-3 py-3">
                <span class="bg-amber-100 text-amber-700 px-2.5 py-1 rounded-lg text-xs font-medium">
                  {{ emp.summary.vacation_days }}
                </span>
              </td>
              <td class="px-3 py-3">
                <span class="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-lg text-xs font-medium">
                  {{ emp.summary.no_mark_days }}
                </span>
              </td>
              <td class="px-3 py-3 text-gray-900">{{ emp.summary.medical_leave_days }}</td>
              <td class="px-3 py-3">
                <span class="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-xs font-semibold">
                  S/ {{ emp.summary.amount_to_deposit ?? '120.00' }}
                </span>
              </td>
              <td class="px-4 py-3 text-gray-700">{{ emp.comments ?? "GAAAA" }}</td>
              <td class="px-3 py-3 text-center">
                <button 
                  @click="verDetalle(emp)"
                  class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Ver detalle"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

    <DetailModal v-model:isOpen="isOpenModal"></DetailModal>
  </div>
</template>

<script setup lang="ts">
import { apiFetch } from '~/services/api';
import DetailModal from './DetailModal.vue';

const datosMoilityReports = ref([])
const isLoading = ref(true)

const payload = {
  year: 2025,
  month: 10,

}

const isOpenModal = ref(false)

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


function descargarExcel() {
  alert('Descargar Excel (pendiente de implementar)');
}

function agregarMontoMovilidad() {
  alert('Agregar monto movilidad de usuario (pendiente de implementar)');
}
</script>


<style scoped></style>