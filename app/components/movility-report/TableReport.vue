<template>
  <div class="flex flex-col h-full">
    <!-- FILTROS -->
    <div class="bg-white border-b shadow-sm">
      <div class="p-4 flex flex-wrap gap-4 items-end justify-between">

        <div class="flex flex-1 gap-4 items-end">
          <!-- BUSCADOR -->
          <div class="flex flex-col">
            <label class="text-xs font-semibold text-slate-500 mb-1">
              Buscar usuario
            </label>
            <input v-model="filtroUsuario" type="text" placeholder="DNI, apellido o nombre" class="border rounded-md px-3 py-2 text-sm w-64
                 focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>

          <!-- MES -->
          <div class="flex flex-col">
            <label class="text-xs font-semibold text-slate-500 mb-1">
              Mes
            </label>
            <select v-model="mesSeleccionado" class="border rounded-md px-3 py-2 text-sm bg-white
                 focus:ring-2 focus:ring-indigo-500 outline-none">
              <option v-for="mes in meses" :key="mes.valor" :value="mes.valor">
                {{ mes.nombre }}
              </option>
            </select>
          </div>

          <!-- AÑO -->
          <div class="flex flex-col">
            <label class="text-xs font-semibold text-slate-500 mb-1">
              Año
            </label>
            <input type="number" v-model.number="añoSeleccionado" min="2020" max="2030" class="border rounded-md px-3 py-2 text-sm w-24 text-center
                 focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>

          <!-- BOTÓN APLICAR -->
          <div>
            <button @click="aplicarFiltros" class="bg-indigo-600 text-white px-6 py-2 rounded-md text-sm
                 hover:bg-indigo-700 transition font-medium">
              Aplicar
            </button>
          </div>
        </div>

        <!-- BOTÓN DESCARGAR EXCEL Y AGREGAR MONTO -->
        <div class="flex items-end gap-2">
          <button @click="descargarExcel" class="bg-green-600 text-white px-6 py-2 rounded-md text-sm
               hover:bg-green-700 transition font-medium flex items-center gap-2">
            <span>Descargar Excel</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
              stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M19.5 14.25v2.25A2.25 2.25 0 0 1 17.25 18.75H6.75A2.25 2.25 0 0 1 4.5 16.5v-2.25M7.5 10.5l4.5 4.5m0 0l4.5-4.5m-4.5 4.5V3" />
            </svg>
          </button>
          <button @click="agregarMontoMovilidad" class="bg-amber-500 text-white px-6 py-2 rounded-md text-sm hover:bg-amber-600 transition font-medium flex items-center gap-2">
            <span>Agregar monto movilidad</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <table class="border-collapse w-full text-sm rounded shadow">
      <thead>
        <tr class="bg-slate-800 text-slate-100 text-xs uppercase tracking-wide">
          <th class="px-3 py-2">ID</th>
          <th class="px-3 py-2">DNI</th>
          <th class="px-3 py-2">Apellidos</th>
          <th class="px-4 py-2">Nombres</th>
          <th class="px-3 py-2 bg-slate-700">Cargo</th>
          <th class="px-3 py-2 bg-slate-700">Ingreso</th>
          <th class="px-3 py-2 bg-slate-700">Movilidad</th>

          <th class="px-3 py-2 bg-emerald-700/90">Provincia</th>
          <th class="px-3 py-2 bg-emerald-700/90">Empresa</th>

          <th class="px-3 py-2 bg-emerald-800">Total</th>
          <th class="px-3 py-2 bg-emerald-600">Vac.</th>
          <th class="px-3 py-2 bg-slate-600">No marcó</th>
          <th class="px-3 py-2 bg-red-600/80">DM</th>

          <th class="px-3 py-2 bg-green-700">Monto</th>
          <th class="px-3 py-2 bg-amber-300 text-slate-900">Comentario</th>
          <th class="px-3 py-2 bg-slate-700">Acciones</th>
        </tr>
      </thead>


      <tbody>
        <tr v-for="emp in datosFiltrados" class="hover:bg-slate-50 transition-colors duration-150">
          <td class="border px-2 text-center">{{ emp.employee.id }}</td>
          <td class="border px-2 text-center">{{ emp.employee.dni }}</td>
          <td class="border px-2 text-center">{{ emp.employee.last_name }}</td>
          <td class="border px-4 text-center">{{ emp.employee.first_name }}</td>
          <td class="border px-2 text-center">{{ emp.employee.position_name }}</td>
          <td class="border px-2 text-center">28/03/2022</td>
          <td class="border px-2 text-center">
            <span class="inline-block
           bg-slate-100 text-slate-700
           px-2 py-0.5 rounded-md
           text-xs font-medium tabular-nums
           transition-colors duration-200
           hover:bg-slate-200">
              S/ 150.00
            </span>
          </td>



          <td class="border px-2 text-center">{{ emp.employee.department_name }}</td>
          <td class="border px-2 text-center">CECHRIZA</td>
          <td class="border px-2 text-center">
            <span class="font-medium tabular-nums text-emerald-700">
              {{ emp.summary.total_days }}
            </span>
          </td>

          <td class="border px-2 text-center">
            <span class="text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md text-xs font-medium">
              {{ emp.summary.vacation_days }}
            </span>
          </td>

          <td class="border px-2 text-center">
            <span class="text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md text-xs font-medium">
              {{ emp.summary.no_mark_days }}
            </span>
          </td>
          <td class="border px-2 text-center">{{ emp.summary.medical_leave_days }}</td>
          <td class="border px-2 text-center">
            <span class="inline-flex items-center justify-center
           bg-green-50 text-green-700
           px-3 py-1 rounded-md
           text-xs font-semibold tabular-nums">
              S/ {{ emp.summary.amount_to_deposit ?? '120.00' }}
            </span>
          </td>


          <td class="border px-4 text-center">{{ emp.comments ?? "GAAAA" }}</td>
          <td class="border px-2 text-center space-x-1">
            <UButton size="xs" color="blue" icon="i-heroicons-eye" @click="verDetalle(emp)" />
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <DetailModal v-model:isOpen="isOpenModal"></DetailModal>


</template>

<script setup lang="ts">
import { apiFetch } from '~/services/api';
import DetailModal from './DetailModal.vue';

const datosMoilityReports = ref([])

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
    const response = await apiFetch('/api/mobility/monthly-report', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    datosMoilityReports.value = response;

  } catch (error) {
    console.error('Error loading mobility reports:', error);
  }
};

onMounted(() => {
  cargarMovilityReports();
});


function descargarExcel() {
  // Aquí puedes implementar la lógica real de exportación a Excel
  // Por ahora solo muestra un alert
  alert('Descargar Excel (pendiente de implementar)');
}

function agregarMontoMovilidad() {
  // Aquí puedes implementar la lógica para abrir un modal o similar
  alert('Agregar monto movilidad de usuario (pendiente de implementar)');
}
</script>


<style scoped></style>