<template>
  <div class="flex flex-col h-full">
    <!-- FILTROS -->
    <div class="bg-white border-b shadow-sm">
      <div class="p-4 flex flex-wrap gap-4 items-end">

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

        <!-- BOTÓN -->
        <div>
          <button @click="aplicarFiltros" class="bg-indigo-600 text-white px-6 py-2 rounded-md text-sm
               hover:bg-indigo-700 transition font-medium">
            Aplicar
          </button>
        </div>
      </div>
    </div>

    <table class="border-collapse w-full text-sm rounded shadow">
      <thead>
        <tr class="bg-slate-800 text-white">
          <th class=" px-3 py-2">ID</th>
          <th class=" px-3 py-2">APELLIDOS</th>
          <th class=" px-4 py-2">NOMBRES</th>

          <th class=" px-3 py-2 bg-slate-700">CARGO</th>
          <th class=" px-3 py-2 bg-slate-700">MOVILIDAD</th>

          <th class=" px-3 py-2 bg-emerald-700">PROVINCIA</th>
          <th class=" px-3 py-2 bg-emerald-700">EMPRESA</th>

          <th class=" px-3 py-2 bg-emerald-800">TOTAL</th>
          <th class=" px-3 py-2 bg-emerald-600">VACACIONES</th>
          <th class=" px-3 py-2 bg-emerald-600">NO MARCÓ</th>
          <th class=" px-3 py-2 bg-emerald-600">DM</th>

          <th class=" px-3 py-2 bg-green-700">MONTO A DEPOSITAR</th>
          <th class=" px-3 py-2 bg-amber-300 text-black">COMENTARIO</th>
          <th class=" px-3 py-2  ">Acciones</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="emp in datosFiltrados" class="hover:bg-gray-50">

          <td class="border px-2 text-center">{{ emp.employee.id }}</td>
          <td class="border px-2 text-center">{{ emp.employee.last_name }}</td>
          <td class="border px-4 text-center">{{ emp.employee.first_name }}</td>
          <td class="border px-2 text-center">{{ emp.employee.position_name }}</td>
          <td class="border px-2 text-center">150</td>
          <td class="border px-2 text-center">{{ emp.employee.department_name }}</td>
          <td class="border px-2 text-center">CECHRIZA</td>
          <td class="border px-2 text-center">{{ emp.summary.total_days }}</td>
          <td class="border px-2 text-center">{{ emp.summary.vacation_days }}</td>
          <td class="border px-2 text-center">{{ emp.summary.no_mark_days }}</td>
          <td class="border px-2 text-center">{{ emp.summary.medical_leave_days }}</td>
          <td class="border px-2 text-center">{{ emp.summary.amount_to_deposit }}</td>
          <td class="border px-4 text-center">{{ emp.comments }}</td>
          <td class="border px-2 text-center space-x-1">
            <UButton size="xs" color="blue" icon="i-heroicons-eye" " /> 
                </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { apiFetch } from '~/services/api';

const datosMoilityReports = ref([])

const payload = {
  year: 2025,
  month: 10,

}

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

</script>
