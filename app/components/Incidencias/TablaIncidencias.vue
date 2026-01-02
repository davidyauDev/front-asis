<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue';
import { apiFetch } from '~/services/api';
import HistoriaIncidencia from './Modales/HistoriaIncidencia.vue';
import AddIncidencia from './Modales/AddIncidencia.vue';


const props = defineProps<{
  filtroUsuario: string,
  mesSeleccionado: number,
  añoSeleccionado: number
}>();
const filaSeleccionada = ref<number | null>(null);

const filaRef = ref<HTMLElement | null>(null);

function setFilaRef(el: Element | any, emp: Empleado) {
  if (filaSeleccionada.value === emp.id && el instanceof HTMLElement) {
    filaRef.value = el;
  }
}

const usuarioSeleccionado = ref<number | null>(null);
const isIncidenciaOpen = ref(false);
const isHistorialOpen = ref(false);
const valuetrackingIncidencia = ref<Record<string, any> | null>(null);

interface Dia {
  valor?: string;
  motivo?: string;
}

interface Empleado {
  id: number;
  dni: string;
  apellidos: string;
  nombre: string;
  incidencias_hhmm: string;
  dias: Record<string, Dia>;
}
const toast = useToast()
const datosEmpleados = ref<Empleado[]>([]);
const cargando = ref(true);


const empleadosFiltrados = computed(() => {
  const q = props.filtroUsuario.trim().toLowerCase();
  if (!q) return datosEmpleados.value;

  return datosEmpleados.value.filter((e) => {
    const texto = `${e.dni} ${e.apellidos} ${e.nombre} ${e.apellidos} ${e.nombre}`.toLowerCase();
    return texto.includes(q);
  });
});

const columnasFechas = computed(() => {
  const diasMes = new Date(props.añoSeleccionado, props.mesSeleccionado, 0).getDate();
  const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const mesStr = meses[props.mesSeleccionado - 1];
  return Array.from({ length: diasMes }, (_, i) => `${i + 1}-${mesStr}`);
});


const validarFormatoTiempo = (valor: string) =>
  /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(valor);

const esFinDeSemana = (dia: number) => {
  const fecha = new Date(props.añoSeleccionado, props.mesSeleccionado - 1, dia);
  return [0, 6].includes(fecha.getDay());
};

const obtenerColorCelda = (valor: string): string => {
  if (!valor) return '';
  const v = valor.toUpperCase();
  if (v === 'F') return 'bg-pink-200';
  if (v === 'DM') return 'bg-yellow-200';
  if (v === 'V') return 'bg-green-200';
  if (v === 'TC') return 'bg-orange-300';
  if (validarFormatoTiempo(valor)) return 'bg-blue-100';
  return 'bg-red-100';
};
const guardarIncidencia = async (formIncidencia: FormIncidencia) => {
  const user = useCookie<{ id: number } | null>('auth_user')
  if (!user.value) {
    toast.add({
      title: 'Error',
      description: 'Usuario no autenticado',
      color: 'error'
    })
    return
  }
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
    await cargarIncidencias()

  } catch (error) {
    console.error('Error al guardar incidencia:', error)

    toast.add({
      title: 'Error',
      description: 'No se pudo registrar la incidencia',
      color: 'error'
    })
  }
}


const cargarIncidencias = async () => {
  cargando.value = true;
  try {
    const response = await apiFetch(`/api/incidencias?mes=${props.mesSeleccionado}&anio=${props.añoSeleccionado}`, {
      method: 'GET',
    });
    datosEmpleados.value = response;
  } catch (error) {
    console.error('Error al cargar incidencias:', error);
    toast.add({
      title: 'Error',
      description: 'No se pudo cargar las incidencias',
      color: 'error',
    });
  } finally {
    cargando.value = false;
  }
};

const agregarIncidencia = (emp: Empleado) => {
  usuarioSeleccionado.value = emp.id;
  isIncidenciaOpen.value = true;
};

const verTracking = (emp: Empleado) => {
  usuarioSeleccionado.value = emp.id;
  isHistorialOpen.value = true;
  valuetrackingIncidencia.value = emp;
};


watch(filaSeleccionada, async () => {
  await nextTick();
  filaRef.value?.scrollIntoView({ behavior: 'smooth', block: 'center' });
});


onMounted(() => {
  cargarIncidencias();
});

watch([
  () => props.mesSeleccionado,
  () => props.añoSeleccionado
], cargarIncidencias);
</script>

<template>
  <div v-if="cargando" class="my-8">
    <div class="rounded shadow border bg-white p-4 animate-pulse">
      <div class="mb-4 flex justify-between items-center">
        <USkeleton class="h-6 w-72 rounded" />
        <div class="flex gap-2">
          <USkeleton class="h-10 w-36 rounded" />
          <USkeleton class="h-10 w-36 rounded" />
        </div>
      </div>
      <div class="overflow-x-auto">
        <table class="border-collapse w-full text-xs">
          <thead>
            <tr>
              <th v-for="i in 10" :key="i">
                <USkeleton class="h-4 w-24 rounded" />
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in 8" :key="row">
              <td v-for="col in 10" :key="col">
                <USkeleton class="h-4 w-20 rounded my-2" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
  <table v-else class="border-collapse w-full text-xs">
    <!-- HEADER -->
    <thead>
      <tr>
        <th colspan="4" class="bg-[#1f4e78] text-white text-center py-3 font-bold border">INCIDENCIAS JUSTIFICADAS</th>
        <th
          v-for="f in columnasFechas"
          :key="f"
          class="border text-center font-semibold"
          :class="esFinDeSemana(Number(f.split('-')[0])) ? 'bg-yellow-200' : 'bg-gray-50'"
        >
          {{ f }}
        </th>
        <th class="bg-purple-600 text-white border px-3">TOTAL</th>
        <th class="px-3 py-2 text-center">ACCIONES</th>
      </tr>

      <tr class="bg-gray-100">
        <th class="border px-2 py-2 text-center bg-blue-100">I_I</th>
        <th class="border px-2 py-2 text-center">DNI</th>
        <th class="border px-4 py-2 text-center">APELLIDOS</th>
        <th class="border px-4 py-2 text-center">NOMBRE</th>
        <th
          v-for="f in columnasFechas"
          :key="f"
          class="border px-2 py-2 text-center"
          :class="esFinDeSemana(Number(f.split('-')[0])) ? 'bg-yellow-100' : ''"
        >
          {{ Number(f.split('-')[0]) }}
        </th>
        <th class="border px-3 py-2 text-center bg-purple-100 font-bold">HH:MM</th>
        <th class="px-3 py-2 text-center"></th>
      </tr>
    </thead>

    <!-- BODY -->
    <tbody>
      <tr
        v-for="emp in empleadosFiltrados"
        :key="emp.id"
        :ref="el => setFilaRef(el, emp)"
        class="cursor-pointer transition-colors"
        :class="filaSeleccionada === emp.id ? 'bg-blue-100 ring-2 ring-blue-500 ring-inset' : 'hover:bg-gray-50'"
      >
        <td class="border px-2 text-center">{{ emp.id }}</td>
        <td class="border px-2 text-center">{{ emp.dni }}</td>
        <td class="border px-3">{{ emp.apellidos }}</td>
        <td class="border px-3">{{ emp.nombre }}</td>

        <td
          v-for="f in columnasFechas"
          :key="f"
          class="border px-1 py-1 text-center relative group"
          :class="[
            esFinDeSemana(Number(f.split('-')[0])) && (!emp.dias[f]?.valor ? 'bg-yellow-50' : ''),
            emp.dias[f]?.valor ? obtenerColorCelda(emp.dias[f].valor) : '',
            filaSeleccionada === emp.id ? 'ring-1 ring-blue-300' : '',
          ]"
        >
          <!-- Tooltip -->
          <div
            v-if="emp.dias[f]?.motivo"
            class="absolute z-20 top-9 right-1 w-56 p-3 bg-white border rounded-lg shadow-lg text-left text-xs text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
          >
            <div class="font-semibold text-gray-900 mb-1">
              Motivo: {{ emp.dias[f].motivo }}
            </div>
            <div class="text-gray-600">
              <span class="font-medium">Creado por:</span> Admin
            </div>
            <div class="text-gray-500">
              <span class="font-medium">Hora:</span> 18/06/2025 15:42
            </div>
          </div>

          <!-- Input / Texto -->
          <template v-if="emp.dias[f]">
            <input
              v-if="filaSeleccionada === emp.id"
              v-model="emp.dias[f].valor"
              class="w-full bg-transparent text-center focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
            />
            <span v-else class="font-medium" :title="emp.dias[f].motivo || ''">
              {{ emp.dias[f].valor }}
            </span>
          </template>
        </td>

        <td class="border px-2 text-center font-bold bg-purple-50 text-purple-900">
          {{ emp.incidencias_hhmm }}
        </td>
        <td class="border px-2 text-center space-x-1">
          <UButton size="xs" color="primary" icon="i-heroicons-eye" @click.stop="verTracking(emp)" />
          <UButton size="xs" color="secondary" icon="i-heroicons-plus" @click.stop="agregarIncidencia(emp)" />
        </td>
      </tr>
    </tbody>
  </table>
   <AddIncidencia
    v-model:isOpen="isIncidenciaOpen"
    @submit="guardarIncidencia"
  />
   <HistoriaIncidencia v-model:isOpen="isHistorialOpen" :historialUser="valuetrackingIncidencia" />

</template>
