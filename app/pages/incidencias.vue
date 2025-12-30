<script setup lang="ts">
import { ref, computed, watch, nextTick } from "vue";
import { apiFetch } from "~/services/api";

const tabActivo = ref<"incidencias" | "calculo">("incidencias");
const mesSeleccionado = ref(12);
const añoSeleccionado = ref(2025);
const filaSeleccionada = ref<number | null>(null);
const usuasioSeleccionado = ref<number | null>(null);
const isIncidenciaOpen = ref(false);
const filaRef = ref<HTMLElement | null>(null);
const toast = useToast();


const datosEmpleados = ref<any[]>([]);
const filtroUsuario = ref("");


const empleadosFiltrados = computed(() => {
  if (!filtroUsuario.value.trim()) return datosEmpleados.value;
  const q = filtroUsuario.value.toLowerCase().trim();
  return datosEmpleados.value.filter((e) => {
    const texto = `
      ${e.dni}
      ${e.apellidos}
      ${e.nombre}
      ${e.apellidos} ${e.nombre}
    `.toLowerCase();
    return texto.includes(q);
  });
});

const cargarIncidencias = async () => {
  try {
    const response = await apiFetch(
      `/api/incidencias?mes=${mesSeleccionado.value}&anio=${añoSeleccionado.value}`,
      { method: "GET" }
    );
    datosEmpleados.value = response;
    console.log("log:", response);
    console.log("Incidencias cargadas:", datosEmpleados.value);
  } catch (error) {
    console.error("Error al cargar incidencias:", error);

    toast.add({
      title: "Error",
      description: "No se pudo cargar las incidencias",
      color: "red",
    });
  }
};

const agregarIncidencia = (emp: any) => {
  usuasioSeleccionado.value = emp.id;
  isIncidenciaOpen.value = true;
};

const verTracking = (emp: any) => {
  alert(`Ver tracking de incidencias para ${emp.nombre} ${emp.apellidos}`);
};


onMounted(() => {
  cargarIncidencias();
});

watch(filaSeleccionada, async () => {
  await nextTick();
  filaRef.value?.scrollIntoView({ behavior: "smooth", block: "center" });
});
watch([mesSeleccionado, añoSeleccionado], () => {
  cargarIncidencias();
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

const tiposIncidencia = [
  { label: 'Descanso médico', value: 'DESCANSO_MEDICO' },
  { label: 'Minutos justificados', value: 'MINUTOS_JUSTIFICADOS' },
  { label: 'Falta', value: 'FALTA' },
  { label: 'Trabajo en campo', value: 'TRABAJO_EN_CAMPO' },
]

const formIncidencia = reactive({
  fecha: '',
  tipo: '',
  minutos: null as number | null,
  motivo: '',
})

const tiposSinMinutos = ['DESCANSO_MEDICO', 'FALTA', 'TRABAJO_EN_CAMPO']

const requiereMinutos = computed(() => {
  return formIncidencia.tipo && !tiposSinMinutos.includes(formIncidencia.tipo)
})


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


const convertirAMinutos = (t: string) => {
  if (!t || t === "-") return 0;
  const p = t.split(":").map(Number);
  return p.length === 3
    ? p[0] * 60 + p[1] + Math.round(p[2] / 60)
    : p[0] * 60 + p[1];
};

const esMayorAUnaHora = (hhmm: string) => {
  const minutos = convertirAMinutos(hhmm)
  return minutos > 60
}

watch([mesSeleccionado, añoSeleccionado], () => {
  filtroUsuario.value = "";
  cargarIncidencias();
});

const guardarIncidencia = async () => {
   const user = useCookie<string | null>('auth_user')

  const payload = {
    creado_por: user.value.id,
    usuario_id: usuasioSeleccionado.value,
    tipo: formIncidencia.tipo,
    fecha: formIncidencia.fecha,
    minutos: formIncidencia.minutos,
    motivo: formIncidencia.motivo
  }

  try {
    await apiFetch('/api/incidencias', {
      method: 'POST',
      body: JSON.stringify(payload)
    })

    toast.add({
      title: 'Incidencia registrada',
      description: 'La incidencia se ha registrado correctamente',
      color: 'success'
    })

      isIncidenciaOpen.value = false

  } catch (error) {
    console.error('Error al guardar incidencia:', error)

    toast.add({
      title: 'Error',
      description: 'No se pudo registrar la incidencia',
      color: 'red'
    })
  } finally {
    cargarIncidencias()
  }
}


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
      <div class="mt-2">
        <!-- TABS -->
        <div class="flex items-center justify-between border-b border-gray-200 bg-white px-2">
          <!-- TABS -->
          <div class="flex">
            <button @click="tabActivo = 'incidencias'" class="px-6 py-4 text-sm font-semibold transition-colors" :class="tabActivo === 'incidencias'
              ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/30'
              : 'text-slate-500 hover:text-indigo-600 hover:bg-slate-50'
              ">
              Incidencias Justificadas
            </button>

            <button @click="tabActivo = 'calculo'" class="px-6 py-4 text-sm font-semibold transition-colors" :class="tabActivo === 'calculo'
              ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/30'
              : 'text-slate-500 hover:text-indigo-600 hover:bg-slate-50'
              ">
              Cálculo de Tardanzas
            </button>
          </div>


        </div>

        <!-- FILTROS -->
        <div class="p-4 bg-slate-50/50 flex items-center gap-4 flex-wrap border-b">
          <!-- MES -->
          <div class="flex items-center gap-2">
            <label class="text-sm font-medium text-slate-600">
              Seleccionar Mes:
            </label>
            <select v-model="mesSeleccionado"
              class="border rounded-md px-3 py-1.5 bg-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
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

            <!-- BUSCADOR -->
            <div class="flex items-center gap-2">
              <label class="text-sm font-medium text-slate-600">
                Buscar Usuario:
              </label>
              <input v-model="filtroUsuario" type="text" placeholder="DNI, apellido o nombre" class="border rounded-md px-3 py-1.5 bg-white text-sm w-56
           focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>

          </div>

          <!-- AÑO -->
          <div class="flex items-center gap-2">
            <label class="text-sm font-medium text-slate-600"> Año: </label>
            <input type="number" v-model.number="añoSeleccionado" min="2020" max="2030"
              class="border rounded-md px-3 py-1.5 bg-white text-sm w-24 text-center focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>

          <!-- BADGE INFO -->
          <div class="ml-auto flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-lg px-4 py-2">
            <UIcon name="i-heroicons-information-circle" class="w-5 h-5 text-indigo-600" />
            <p class="text-xs text-indigo-700 font-medium italic">
              Haz clic en un registro para ver el tracking de quién lo registró
              y el motivo.
            </p>
          </div>
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
                <th class=" px-3 py-2 text-center">ACCIONES</th>

              </tr>

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
                <th class=" px-3 py-2 text-center"></th>


              </tr>
            </thead>

            <!-- BODY -->
            <tbody>
              <tr v-for="emp in empleadosFiltrados" :key="emp.id" @click="filaSeleccionada = emp.id" :ref="filaSeleccionada === emp.id ? (el) => (filaRef = el) : null
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
                  <span v-else class="font-medium" >
                    {{ emp.dias[f] || "" }}
                  </span>
                </td>

                <td class="border px-2 text-center font-bold bg-purple-50 text-purple-900">
                  {{ emp.incidencias_hhmm }}
                </td>
                <td class="border px-2 text-center space-x-1">
                   <UButton size="xs" color="blue" icon="i-heroicons-eye" @click.stop="verTracking(emp)" />

                  <UButton size="xs" color="green" icon="i-heroicons-plus" @click.stop="agregarIncidencia(emp)" />
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

                <td class="border px-2 text-center bg-blue-50">
                  {{ emp.bruto_hhmm }}
                </td>

                <td class="border px-2 text-center bg-purple-50 font-bold">
                  {{ emp.incidencias_hhmm }}
                </td>

                <td class="border px-2 text-center font-bold" :class="esMayorAUnaHora(emp.neto_hhmm)
                  ? 'bg-red-100 text-red-800'
                  : 'bg-green-100 text-green-800'
                  ">
                  {{ emp.neto_hhmm }}
                </td>
              </tr>

            </tbody>
          </table>
        </div>
      </div>
    </template>
  </UDashboardPanel>
  


  <UModal v-model:open="isIncidenciaOpen" :ui="{ width: 'max-w-lg' }">

    <!-- HEADER -->
    <template #header>
      <h3 class="text-lg font-semibold">
        Agregar Incidencia Justificada
      </h3>
    </template>

    <!-- BODY -->
    <template #body>
      <div class="space-y-4 text-sm">

        <!-- FECHA -->
        <div>
          <label class="block font-medium mb-1">
            Fecha
          </label>
          <UInput type="date" v-model="formIncidencia.fecha" />
        </div>

        <div>
          <label class="block font-medium mb-1">
            Tipo de incidencia
          </label>

          <USelect v-model="formIncidencia.tipo" :items="tiposIncidencia" placeholder="Seleccionar tipo" />
        </div>

        <div v-if="requiereMinutos">
          <label class="block font-medium mb-1">
            Minutos
          </label>
          <UInput type="number" min="1" v-model.number="formIncidencia.minutos" placeholder="Ej: 30" />
        </div>

        <div v-else-if="formIncidencia.tipo" class="text-xs text-gray-500 italic">
          Este tipo de incidencia no requiere minutos.
        </div>

        <div>
          <label class="block font-medium mb-1">
            Motivo
          </label>
          <UTextarea v-model="formIncidencia.motivo" rows="3" placeholder="Describir el motivo de la incidencia" />
        </div>

      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton color="gray" variant="ghost" @click="cerrarModal">
          Cancelar
        </UButton>

        <UButton color="indigo" :disabled="!formIncidencia.fecha ||
          !formIncidencia.tipo ||
          (requiereMinutos && !formIncidencia.minutos) ||
          !formIncidencia.motivo
          " @click="guardarIncidencia()">
          Guardar
        </UButton>
      </div>
    </template>

  </UModal>
</template>
