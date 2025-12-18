<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick } from "vue";

const tabActivo = ref<"incidencias" | "calculo">("incidencias");
const mesSeleccionado = ref(12);
const añoSeleccionado = ref(2024);
const filaSeleccionada = ref<number | null>(null);
const filaRef = ref<HTMLElement | null>(null);
const toast = useToast();
const tardanzaBruta = reactive<Record<number, string>>({
  1: "00:00:00",
  2: "00:55:00",
  3: "00:10:24",
});

const datosEmpleados = ref<any[]>([
  {
    id: 1,
    dni: "72048645",
    apellidos: "Camacho Caceda",
    nombre: "Johana Cecilia",
    dias: {},
  },
  {
    id: 2,
    dni: "43291311",
    apellidos: "Julian Iturbe",
    nombre: "Emma Soledad",
    dias: { "5-Dic": "00:33", "13-Dic": "00:19" },
  },
  {
    id: 3,
    dni: "77335709",
    apellidos: "Orozco Guerrero",
    nombre: "Karen Aylen",
    dias: {},
  },
  
]);

const mostrarToastExito = () => {
  toast.add({
    title: 'Actualización exitosa',
    description: 'Los datos han sido modificados correctamente.',
    icon: 'i-heroicons-check-circle',
    color: 'green',
    timeout: 2000
  });
};

watch(
  () => datosEmpleados.value, 
  (newVal, oldVal) => {
    // Solo disparamos si no es la carga inicial (cuando ya hay datos)
    if (oldVal.length > 0) {
      mostrarToastExito();
    }
  }, 
  { deep: true }
);

watch(
  () => tardanzaBruta,
  () => {
    mostrarToastExito();
  },
  { deep: true }
);

watch(filaSeleccionada, async () => {
  await nextTick();
  filaRef.value?.scrollIntoView({ behavior: "smooth", block: "center" });
});


const validarFormatoTiempo = (valor: string) =>
  /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(valor);

const obtenerColorCelda = (valor: string) => {
  if (!valor) return "";
  const v = valor.toUpperCase();
  if (v === "F") return "bg-pink-200";
  if (v === "DM") return "bg-yellow-200";
  if (v === "V") return "bg-green-200";
  if (v === "TC") return "bg-orange-300";
  if (validarFormatoTiempo(valor)) return "bg-blue-100";
  return "bg-red-100";
};

const obtenerColorTexto = (valor: string) => {
  if (!valor) return "";
  if (valor.toUpperCase() === "V") return "text-green-800 font-semibold";
  if (validarFormatoTiempo(valor)) return "text-blue-800";
  return "text-gray-900 font-semibold";
};

const columnasFechas = computed(() => {
  const dias = new Date(
    añoSeleccionado.value,
    mesSeleccionado.value,
    0
  ).getDate();
  const meses = [
    "Ene",
    "Feb",
    "Mar",
    "Abr",
    "May",
    "Jun",
    "Jul",
    "Ago",
    "Sep",
    "Oct",
    "Nov",
    "Dic",
  ];
  const mes = meses[mesSeleccionado.value - 1];
  return Array.from({ length: dias }, (_, i) => `${i + 1}-${mes}`);
});

const esFinDeSemana = (dia: number) => {
  const fecha = new Date(añoSeleccionado.value, mesSeleccionado.value - 1, dia);
  return [0, 6].includes(fecha.getDay());
};

const actualizarValor = (id: number, fecha: string, valor: string) => {
  const emp = datosEmpleados.value.find((e) => e.id === id);
  if (emp) emp.dias[fecha] = valor.toUpperCase();
};

const calcularTotalMinutos = (dias: Record<string, string>) => {
  let total = 0;
  Object.values(dias).forEach((v) => {
    if (validarFormatoTiempo(v)) {
      const [h, m] = v.split(":").map(Number);
      total += h * 60 + m;
    }
  });
  if (!total) return "-";
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(
    total % 60
  ).padStart(2, "0")}`;
};

const convertirAMinutos = (t: string) => {
  if (!t || t === "-") return 0;
  const p = t.split(":").map(Number);
  return p.length === 3
    ? p[0] * 60 + p[1] + Math.round(p[2] / 60)
    : p[0] * 60 + p[1];
};

const calcularTardanzaNeta = (id: number) => {
  const bruto = convertirAMinutos(tardanzaBruta[id] || "00:00:00");
  const emp = datosEmpleados.value.find((e) => e.id === id);
  const inc = convertirAMinutos(calcularTotalMinutos(emp?.dias || {}));
  const neto = Math.max(0, bruto - inc);
  return `${String(Math.floor(neto / 60)).padStart(2, "0")}:${String(
    neto % 60
  ).padStart(2, "0")}`;
};

const notificarPorCorreo = () => {
  alert("Funcionalidad de correo en desarrollo");
};
</script>

<template>
  <UDashboardPanel id="incidencias">
    <template #header>
      <UDashboardNavbar title="Incidencias" :ui="{ right: 'gap-3' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>
    <template #body>
      <div class="space-y-6">
        <!-- TABS -->
        <div class="flex border-b">
          <button @click="tabActivo = 'incidencias'" class="px-6 py-3 font-semibold transition-colors" :class="tabActivo === 'incidencias'
              ? 'bg-[#1f4e78] text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            ">
            Incidencias Justificadas
          </button>

          <button @click="tabActivo = 'calculo'" class="px-6 py-3 font-semibold transition-colors" :class="tabActivo === 'calculo'
              ? 'bg-[#1f4e78] text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            ">
            Cálculo de Tardanzas
          </button>
        </div>
        <div class="flex gap-4 items-center bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <label class="font-semibold text-gray-700">Seleccionar Mes:</label>

          <select v-model="mesSeleccionado"
            class="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option v-for="mes in [
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
            ]" :key="mes.valor" :value="mes.valor">
              {{ mes.nombre }}
            </option>
          </select>

          <label class="font-semibold text-gray-700">Año:</label>

          <input type="number" v-model.number="añoSeleccionado" min="2020" max="2030"
            class="border border-gray-300 rounded-md px-4 py-2 w-24 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <!-- INCIDENCIAS -->
        <div v-if="tabActivo === 'incidencias'" class="overflow-x-auto rounded-lg shadow border">
          <table class="border-collapse w-full text-xs">
            <!-- HEADER SUPERIOR -->
            <thead>
              <tr>
                <th colspan="4" class="bg-[#1f4e78] text-white text-center py-3 font-bold border border-gray-400">
                  INCIDENCIAS JUSTIFICADAS
                </th>

                <th v-for="f in columnasFechas" :key="f" class="border border-gray-400 text-center font-semibold"
                  :class="esFinDeSemana(Number(f.split('-')[0]))
                      ? 'bg-yellow-200'
                      : 'bg-gray-50'
                    ">
                  {{ f }}
                </th>

                <th class="bg-purple-600 text-white border border-gray-400 px-3">
                  TOTAL
                </th>
              </tr>

              <!-- HEADER COLUMNAS -->
              <tr class="bg-gray-100">
                <th class="border border-gray-400 px-2 py-2 text-center bg-blue-100">
                  I_I
                </th>
                <th class="border border-gray-400 px-2 py-2 text-center">
                  DNI
                </th>
                <th class="border border-gray-400 px-4 py-2 text-center">
                  APELLIDOS
                </th>
                <th class="border border-gray-400 px-4 py-2 text-center">
                  NOMBRE
                </th>

                <th v-for="f in columnasFechas" :key="f" class="border border-gray-400 px-2 py-2 text-center" :class="esFinDeSemana(Number(f.split('-')[0]))
                    ? 'bg-yellow-100'
                    : ''
                  ">
                  {{ Number(f.split("-")[0]) }}
                </th>

                <th class="border border-gray-400 px-3 py-2 text-center bg-purple-100 font-bold">
                  HH:MM
                </th>
              </tr>
            </thead>

            <!-- BODY -->
            <tbody>
              <tr v-for="emp in datosEmpleados" :key="emp.id" @click="filaSeleccionada = emp.id" :ref="filaSeleccionada === emp.id ? (el) => (filaRef = el) : null
                " class="cursor-pointer transition-colors" :class="filaSeleccionada === emp.id
                    ? 'bg-blue-100 ring-2 ring-blue-500 ring-inset'
                    : 'hover:bg-gray-50'
                  ">
                <td class="border px-2 text-center">{{ emp.id }}</td>
                <td class="border px-2 text-center">{{ emp.dni }}</td>
                <td class="border px-3">{{ emp.apellidos }}</td>
                <td class="border px-3">{{ emp.nombre }}</td>

                <td v-for="f in columnasFechas" :key="f" class="border px-1 py-1 text-center" :class="[
                  esFinDeSemana(Number(f.split('-')[0])) && !emp.dias[f]
                    ? 'bg-yellow-50'
                    : '',
                  emp.dias[f] ? obtenerColorCelda(emp.dias[f]) : '',
                  filaSeleccionada === emp.id ? 'ring-1 ring-blue-300' : '',
                ]">
                  <input v-if="filaSeleccionada === emp.id" v-model="emp.dias[f]"
                    class="w-full bg-transparent text-center focus:outline-none focus:ring-2 focus:ring-blue-500 rounded" />
                  <span v-else class="font-medium">
                    {{ emp.dias[f] || "" }}
                  </span>
                </td>

                <td class="border px-2 text-center font-bold bg-purple-50 text-purple-900">
                  {{ calcularTotalMinutos(emp.dias) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- CALCULO -->
        <div v-if="tabActivo === 'calculo'" class="space-y-4">
          <div class="flex justify-between items-center bg-white p-4 rounded shadow border">
            <h2 class="text-lg font-bold">Cálculo de Tardanzas Netas</h2>
            <UButton color="blue" @click="notificarPorCorreo">
              Notificar por correo
            </UButton>
          </div>

          <table class="border-collapse w-full text-sm rounded shadow">
            <thead>
              <tr class="bg-[#1f4e78] text-white">
                <th class="border px-3 py-2">ID</th>
                <th class="border px-3 py-2">DNI</th>
                <th class="border px-4 py-2">APELLIDOS Y NOMBRES</th>
                <th class="border px-3 py-2 bg-blue-700">BRUTO</th>
                <th class="border px-3 py-2 bg-purple-700">INCIDENCIAS</th>
                <th class="border px-3 py-2 bg-green-700">NETO</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="emp in datosEmpleados" :key="emp.id" class="hover:bg-gray-50">
                <td class="border px-2 text-center">{{ emp.id }}</td>
                <td class="border px-2 text-center">{{ emp.dni }}</td>
                <td class="border px-3">
                  {{ emp.apellidos }} {{ emp.nombre }}
                </td>

                <td class="border px-2 bg-blue-50">
                  <input v-model="tardanzaBruta[emp.id]" class="w-full text-center border rounded px-2 py-1" />
                </td>

                <td class="border px-2 text-center bg-purple-50 font-bold">
                  {{ calcularTotalMinutos(emp.dias) }}
                </td>

                <td class="border px-2 text-center font-bold" :class="convertirAMinutos(calcularTardanzaNeta(emp.id)) > 0
                    ? 'bg-red-100 text-red-800'
                    : 'bg-green-100 text-green-800'
                  ">
                  {{ calcularTardanzaNeta(emp.id) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>
