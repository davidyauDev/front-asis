<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue';
import { apiFetch } from '~/services/api';
import HistoriaIncidencia from './Modales/HistoriaIncidencia.vue';
import AddIncidencia from './Modales/AddIncidencia.vue';


const props = defineProps<{
  filtroUsuario: string,
  mesSeleccionado: number,
  añoSeleccionado: number,
  diaInicio?: number,
  diaFin?: number
}>();
const filaSeleccionada = ref<number | null>(null);

const filaRef = ref<HTMLElement | null>(null);

function setFilaRef(el: Element | any, emp: Empleado) {
  if (filaSeleccionada.value === emp.id && el instanceof HTMLElement) {
    filaRef.value = el;
  }
}

const usuarioSeleccionado = ref<number | null>(null);
const usuarioNombreSeleccionado = ref<string>("");
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
  let inicio = props.diaInicio ?? 1;
  let fin = props.diaFin ?? diasMes;
  inicio = Math.max(1, inicio);
  fin = Math.min(diasMes, fin);
  return Array.from({ length: fin - inicio + 1 }, (_, i) => `${i + inicio}-${mesStr}`);
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
  if (v === 'F') return 'bg-pink-200 dark:bg-pink-900 dark:text-pink-100';
  if (v === 'DM') return 'bg-yellow-200 text-yellow-900 dark:bg-yellow-700 dark:text-yellow-100';
  if (v === 'V') return 'bg-green-200 text-green-900 dark:bg-green-800 dark:text-green-100';
  if (v === 'TC') return 'bg-orange-300 text-orange-900 dark:bg-orange-800 dark:text-orange-100';
  if (validarFormatoTiempo(valor)) return 'bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100';
  return 'bg-red-100 text-red-900 dark:bg-red-900 dark:text-red-100';
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
    usuario_id: usuarioSeleccionado.value,
    tipo: formIncidencia.tipo,
    fecha: formIncidencia.fecha,
    minutos: formIncidencia.minutos,
    motivo: formIncidencia.motivo
  }
  try {
    await apiFetch('/api/incidencias/store', {
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
    const response = await apiFetch('/api/incidencias', {
      method: 'POST',
      body: JSON.stringify({
        mes: props.mesSeleccionado,
        anio: props.añoSeleccionado
      })
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
  usuarioNombreSeleccionado.value = `${emp.nombre} ${emp.apellidos}`;
  isIncidenciaOpen.value = true;
};

const verTracking = (emp: Empleado) => {
  usuarioSeleccionado.value = emp.id;
  isHistorialOpen.value = true;
  valuetrackingIncidencia.value = emp;
};

const descargarExcel = async () => {
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
      id: 'exportando-incidencias',
      title: 'Preparando exportación',
      description: 'Generando archivo Excel...',
      icon: 'i-lucide-loader-2',
      timeout: 0
    });

    const body = {
      mes: props.mesSeleccionado,
      anio: props.añoSeleccionado,
      descargar: true
    };

    const response = await fetch(
      `${config.public.apiBaseUrl}/api/incidencias`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token.value}`,
          'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        },
        body: JSON.stringify(body)
      }
    );

    if (!response.ok) {
      throw new Error(`Error HTTP ${response.status}`);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `incidencias_${props.mesSeleccionado}_${props.añoSeleccionado}.xlsx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);

    toast.remove('exportando-incidencias');
    toast.add({
      title: 'Descarga completa',
      description: 'El archivo se descargó correctamente',
      icon: 'i-lucide-check-circle',
      color: 'green',
      timeout: 3000
    });
  } catch (error: any) {
    console.error('Error al descargar Excel:', error);
    toast.remove('exportando-incidencias');
    
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
      color: 'red',
      timeout: 8000
    });
  }
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

// Exponer la función para que el padre pueda llamarla
defineExpose({
  descargarExcel
});
</script>

<template>
  <div v-if="cargando" class="my-6">
  <div class="rounded-lg border bg-white shadow-sm dark:bg-gray-900 dark:border-gray-700">
    
    <!-- Header fake -->
    <div class="flex items-center justify-between px-4 py-3 border-b dark:border-gray-700">
      <USkeleton class="h-4 w-64 rounded" />
      <div class="flex gap-2">
        <USkeleton class="h-8 w-28 rounded-md" />
        <USkeleton class="h-8 w-36 rounded-md" />
      </div>
    </div>

    <!-- Table fake -->
    <div class="overflow-x-auto">
      <table class="w-full text-xs">
        <thead>
          <tr>
            <th v-for="i in 12" :key="i" class="px-3 py-2">
              <USkeleton class="h-3 w-16 rounded" />
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in 8" :key="row" class="border-t">
            <td v-for="col in 12" :key="col" class="px-3 py-2">
              <USkeleton class="h-3 w-14 rounded" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

  </div>
</div>

  <table v-else class="w-full text-xs dark:text-gray-200">
    <!-- HEADER -->
    <thead>
  <!-- FILA 1: CONTEXTO -->
  <tr>
    <th
      colspan="4"
      class="bg-[#1f4e78] text-white text-center py-3 font-bold border dark:bg-blue-900 dark:text-gray-100 dark:border-gray-700"
    >
      INCIDENCIAS JUSTIFICADAS · DICIEMBRE
    </th>

    <th
      v-for="f in columnasFechas"
      :key="f"
      class="border text-center text-xs font-semibold dark:border-gray-700"
      :class="esFinDeSemana(Number(f.split('-')[0]))
        ? 'bg-yellow-200 text-yellow-900 dark:bg-yellow-900 dark:text-yellow-200'
        : 'bg-slate-100 text-slate-700 dark:bg-gray-800 dark:text-gray-200'"
    >
      {{ f }}
    </th>

    <th class="bg-purple-600 text-white px-3 text-sm dark:bg-purple-900 dark:text-gray-100">
      TOTAL
    </th>

    <th class="bg-slate-200 px-3 text-sm dark:bg-gray-800 dark:text-gray-200">
      ACCIONES
    </th>
  </tr>

  <!-- FILA 2: ESTRUCTURA -->
  <tr class="bg-slate-50 text-xs uppercase tracking-wide text-slate-600 dark:bg-gray-800 dark:text-gray-300">
    <th class="border px-2 py-2 text-center dark:border-gray-700">#</th>
    <th class="border px-2 py-2 text-center dark:border-gray-700">DNI</th>
    <th class="border px-4 py-2 text-center dark:border-gray-700">Apellidos</th>
    <th class="border px-4 py-2 text-center dark:border-gray-700">Nombre</th>

    <th
      v-for="f in columnasFechas"
      :key="f"
      class="border px-2 py-2 text-center dark:border-gray-700"
      :class="esFinDeSemana(Number(f.split('-')[0]))
        ? 'bg-yellow-50 dark:bg-yellow-900 dark:text-yellow-200'
        : 'dark:bg-gray-900 dark:text-gray-200'"
    >
      {{ Number(f.split('-')[0]) }}
    </th>

    <th class="border px-3 py-2 text-center font-semibold text-purple-700 dark:border-gray-700 dark:text-purple-300">
      HH:MM
    </th>

    <th class="border px-3 py-2 text-center dark:border-gray-700"></th>
  </tr>
</thead>


    <!-- BODY -->
    <tbody>
      <tr v-for="emp in empleadosFiltrados" :key="emp.id" :ref="el => setFilaRef(el, emp)"
        class="cursor-pointer transition-colors dark:hover:bg-gray-800"
        :class="filaSeleccionada === emp.id ? 'bg-blue-100 ring-2 ring-blue-500 ring-inset dark:bg-blue-900 dark:ring-blue-300' : 'hover:bg-gray-50 dark:hover:bg-gray-800'">
        <td class="border px-2 text-center dark:border-gray-700">{{ emp.id }}</td>
        <td class="border px-2 text-center dark:border-gray-700">{{ emp.dni }}</td>
        <td class="border px-3 dark:border-gray-700">{{ emp.apellidos }}</td>
        <td class="border px-3 dark:border-gray-700">{{ emp.nombre }}</td>

        <td v-for="f in columnasFechas" :key="f" class="border px-1 py-1 text-center relative group dark:border-gray-700" :class="[
          esFinDeSemana(Number(f.split('-')[0])) && (!emp.dias[f]?.valor ? 'bg-yellow-50 dark:bg-yellow-900 dark:text-yellow-200' : ''),
          emp.dias[f]?.valor ? obtenerColorCelda(emp.dias[f].valor) : '',
          filaSeleccionada === emp.id ? 'ring-1 ring-blue-300 dark:ring-blue-300' : '',
        ]">
          <!-- Tooltip -->
          <div v-if="emp.dias[f]?.motivo"
            class="absolute z-20 top-9 right-1 w-56 p-3 bg-white border rounded-lg shadow-lg text-left text-xs text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200">
            <div class="font-semibold text-gray-900 mb-1 dark:text-gray-100">
              Motivo: {{ emp.dias[f].motivo }}
            </div>
            <div class="text-gray-600 dark:text-gray-300">
              <span class="font-medium">Creado por:</span> Admin
            </div>
            <div class="text-gray-500 dark:text-gray-400">
              <span class="font-medium">Hora:</span> 18/06/2025 15:42
            </div>
          </div>

          <!-- Input / Texto -->
          <template v-if="emp.dias[f]">
            <input v-if="filaSeleccionada === emp.id" v-model="emp.dias[f].valor"
              class="w-full bg-transparent text-center focus:outline-none focus:ring-2 focus:ring-blue-500 rounded dark:bg-gray-800 dark:text-gray-200" />
            <span v-else class="font-medium" :title="emp.dias[f].motivo || ''">
              {{ emp.dias[f].valor }}
            </span>
          </template>
        </td>

        <td class="border px-2 text-center font-bold bg-purple-50 text-purple-900 dark:bg-purple-900 dark:text-yellow-300 dark:border-gray-700">
          <span class="dark:text-yellow-300 text-purple-900">{{ emp.incidencias_hhmm }}</span>
        </td>
        <td class="border px-2 text-center dark:border-gray-700">
          <div class="inline-flex items-center gap-1">
            <UTooltip text="Ver tracking">
              <UButton size="xs" color="primary" variant="ghost" icon="i-heroicons-eye"
                class="transition-transform hover:scale-105 dark:bg-gray-800 dark:text-gray-200" @click.stop="verTracking(emp)" />
            </UTooltip>
            <UTooltip text="Agregar incidencia">
              <UButton size="xs" color="emerald" variant="ghost" icon="i-heroicons-plus"
                class="transition-transform hover:scale-105 dark:bg-gray-800 dark:text-gray-200" @click.stop="agregarIncidencia(emp)" />
            </UTooltip>
          </div>
        </td>

      </tr>
    </tbody>
  </table>
  <AddIncidencia
    v-model:isOpen="isIncidenciaOpen"
    :usuarioNombre="usuarioNombreSeleccionado"
    @submit="guardarIncidencia"
  />
  <HistoriaIncidencia 
    v-model:isOpen="isHistorialOpen" 
    :historialUser="valuetrackingIncidencia"
    @refetch="cargarIncidencias"
  />

</template>
