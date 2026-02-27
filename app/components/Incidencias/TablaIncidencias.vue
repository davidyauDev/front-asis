<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue';
import { apiFetch } from '~/services/api';
import HistoriaIncidencia from './Modales/HistoriaIncidencia.vue';
import AddIncidencia from './Modales/AddIncidencia.vue';


const props = defineProps<{
  filtroUsuario: string,
  fechaInicio: string,
  filtroEmpresa: string,
  filtroDepartamento: string,
  fechaFin: string
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
  departamento?: string;
  empresa?: string;
  incidencias_hhmm: string;
  dias: Record<string, Dia>;
}

const toast = useToast()
const datosEmpleados = ref<Empleado[]>([]);
const cargando = ref(true);

type SortKey = 'apellidos' | 'nombre' | 'departamento' | 'empresa';
const sortKey = useCookie<SortKey | ''>('incidencias-sort-key', {
  default: () => ''
});
const sortDir = useCookie<'asc' | 'desc'>('incidencias-sort-dir', {
  default: () => 'asc'
});
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

const obtenerValorOrden = (emp: Empleado, key: SortKey) => {
  switch (key) {
    case 'apellidos':
      return `${emp.apellidos ?? ''} ${emp.nombre ?? ''}`.trim();
    case 'nombre':
      return `${emp.nombre ?? ''} ${emp.apellidos ?? ''}`.trim();
    case 'departamento':
      return String(emp.departamento ?? '').trim();
    case 'empresa':
      return String(emp.empresa ?? '').trim();
    default:
      return '';
  }
};

const empleadosFiltrados = computed(() => {
  let list = datosEmpleados.value.slice();

  const q = props.filtroUsuario.trim().toLowerCase();
  if (q) {
    list = list.filter((e) => {
      const texto = `${e.dni} ${e.apellidos} ${e.nombre} ${e.apellidos} ${e.nombre}`.toLowerCase();
      return texto.includes(q);
    });
  }

  const empresa = props.filtroEmpresa?.trim().toLowerCase();
  if (empresa) {
    list = list.filter((e) => {
      const empEmpresa = (e.empresa ?? '').toString().trim().toLowerCase();
      return empEmpresa === empresa;
    });
  }

  const departamento = props.filtroDepartamento?.trim().toLowerCase();
  if (departamento) {
    list = list.filter((e) => {
      const empDepto = (e.departamento ?? '').toString().trim().toLowerCase();
      return empDepto === departamento;
    });
  }

  if (sortKey.value) {
    const key = sortKey.value;
    list = list.slice().sort((a, b) => {
      const av = obtenerValorOrden(a, key);
      const bv = obtenerValorOrden(b, key);
      const cmp = sortCollator.compare(av, bv);
      return sortDir.value === 'asc' ? cmp : -cmp;
    });
  }

  return list;
});

// Generar columnas de fechas entre fechaInicio y fechaFin usando UTC para evitar desfases por zona horaria
const columnasFechas = computed(() => {
  const fechas: string[] = [];
  // Parsear fechas como UTC
  const [anioInicio, mesInicio, diaInicio] = props.fechaInicio.split('-').map(Number);
  const [anioFin, mesFin, diaFin] = props.fechaFin.split('-').map(Number);
  let d = new Date(Date.UTC(anioInicio, mesInicio - 1, diaInicio));
  const fin = new Date(Date.UTC(anioFin, mesFin - 1, diaFin));
  while (d.getTime() <= fin.getTime()) {
    const dia = d.getUTCDate().toString().padStart(2, '0');
    const mes = (d.getUTCMonth() + 1).toString().padStart(2, '0');
    fechas.push(`${dia}-${mes}`);
    // Avanzar un día en UTC
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return fechas;
});


const validarFormatoTiempo = (valor: string) =>
  /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(valor);

const fechaUtc = (fechaStr: string) => {
  // fechaStr: 'dd-mm'
  if (typeof fechaStr !== 'string' || !fechaStr.includes('-')) return null;
  const [dia, mes] = fechaStr.split('-').map(Number);
  if (!dia || !mes) return null;
  const [anio] = props.fechaInicio.split('-').map(Number);
  if (!anio) return null;
  const fecha = new Date(Date.UTC(anio, mes - 1, dia));
  if (isNaN(fecha.getTime())) return null;
  return fecha;
};

const esFinDeSemana = (fechaStr: string) => {
  const fecha = fechaUtc(fechaStr);
  if (!fecha) return false;
  return [0, 6].includes(fecha.getUTCDay());
};

const esDomingo = (fechaStr: string) => {
  const fecha = fechaUtc(fechaStr);
  if (!fecha) return false;
  return fecha.getUTCDay() === 0;
};

const inicialDia = (fechaStr: string) => {
  const fecha = fechaUtc(fechaStr);
  if (!fecha) return '';
  const map: Record<number, string> = {
    0: 'D', // Domingo
    1: 'L', // Lunes
    2: 'M', // Martes
    3: 'X', // Miércoles
    4: 'J', // Jueves
    5: 'V', // Viernes
    6: 'S', // Sábado
  };
  return map[fecha.getUTCDay()] || '';
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


// Utilidad para convertir claves tipo '30-Dic' a '30-12', '13-Ene' a '13-01', etc.
const MES_MAP: Record<string, string> = {
  'Ene': '01', 'Feb': '02', 'Mar': '03', 'Abr': '04', 'May': '05', 'Jun': '06',
  'Jul': '07', 'Ago': '08', 'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dic': '12',
};
function normalizaDias(dias: Record<string, any>): Record<string, any> {
  const normalizado: Record<string, any> = {};
  for (const key in dias) {
    if (/^\d{2}-\d{2}$/.test(key)) {
      normalizado[key] = dias[key];
    } else if (/^\d{1,2}-[A-Za-z]{3}$/.test(key)) {
      const [dia, mesStr] = key.split('-');
      const mes = MES_MAP[mesStr.charAt(0).toUpperCase() + mesStr.slice(1,3).toLowerCase()] || MES_MAP[mesStr];
      if (mes) {
        const diaNum = dia.padStart(2, '0');
        normalizado[`${diaNum}-${mes}`] = dias[key];
      }
    }
  }
  return normalizado;
}

const cargarIncidencias = async () => {
  cargando.value = true;
  try {
    const response = await apiFetch('/api/incidencias', {
      method: 'POST',
      body: JSON.stringify({
        fecha_desde: props.fechaInicio,
        fecha_hasta: props.fechaFin
      })
    });
    let empleados: any[] = [];
    if (Array.isArray(response)) {
      empleados = response;
    } else if (response && Array.isArray(response.data)) {
      empleados = response.data;
    }
    // Normaliza las claves de dias para cada empleado
    datosEmpleados.value = empleados.map(emp => ({
      ...emp,
      dias: emp.dias ? normalizaDias(emp.dias) : {}
    }));
  } catch (error) {
    console.error('Error al cargar incidencias:', error);
    datosEmpleados.value = [];
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

const descargarExcel = async (filtros?: { fechaInicio?: string, fechaFin?: string, filtroUsuario?: string }) => {
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

    const body: any = {
      fecha_desde: filtros?.fechaInicio || props.fechaInicio,
      fecha_hasta: filtros?.fechaFin || props.fechaFin,
      descargar: true
    };
    if (filtros?.filtroUsuario) {
      body.filtro_usuario = filtros.filtroUsuario;
    }

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
    a.download = `incidencias_${body.fecha_desde}_${body.fecha_hasta}.xlsx`;
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
  () => props.fechaInicio,
  () => props.fechaFin
], cargarIncidencias);

// Exponer la función para que el padre pueda llamarla
defineExpose({
  descargarExcel
});
</script>

<template>
  <div>
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
    <div v-else>
      <div v-if="empleadosFiltrados.length === 0" class="my-8 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
        <span class="text-lg font-semibold mb-2">No hay incidencias para el rango seleccionado</span>
        <span class="text-sm">Ajusta el filtro de fechas o verifica los datos.</span>
      </div>
      <table v-else class="w-full text-xs dark:text-gray-200">
    <!-- HEADER -->
    <thead>
  <!-- FILA 1: CONTEXTO -->
  <tr>
    <th
      colspan="5"
      class="bg-[#1f4e78] text-white text-center py-3 font-bold border dark:bg-blue-900 dark:text-gray-100 dark:border-gray-700"
    >
      INCIDENCIAS JUSTIFICADAS 
    </th>

     <th
      v-for="f in columnasFechas"
      :key="f"
      class="border text-center text-xs font-semibold dark:border-gray-700"
      :class="esDomingo(f)
        ? 'bg-red-100 text-red-900 dark:bg-red-900/50 dark:text-red-100'
        : esFinDeSemana(f)
          ? 'bg-yellow-50 dark:bg-yellow-900 dark:text-yellow-200'
          : 'dark:bg-gray-900 dark:text-gray-200'"
      
    >
      <span class="text-[10px] font-semibold">{{ inicialDia(f) }}</span>
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
    <th class="border px-2 py-2 text-center dark:border-gray-700">DNI</th>
    <th class="border px-4 py-2 text-center dark:border-gray-700">
      <button
        type="button"
        class="inline-flex items-center justify-center gap-1 w-full"
        @click="toggleSort('apellidos')"
      >
        Apellidos
        <UIcon :name="sortIcon('apellidos')" class="w-3 h-3" />
      </button>
    </th>
    <th class="border px-4 py-2 text-center dark:border-gray-700">
      <button
        type="button"
        class="inline-flex items-center justify-center gap-1 w-full"
        @click="toggleSort('nombre')"
      >
        Nombre
        <UIcon :name="sortIcon('nombre')" class="w-3 h-3" />
      </button>
    </th>
    <th class="border px-4 py-2 text-center dark:border-gray-700">
      <button
        type="button"
        class="inline-flex items-center justify-center gap-1 w-full"
        @click="toggleSort('departamento')"
      >
        Departamento
        <UIcon :name="sortIcon('departamento')" class="w-3 h-3" />
      </button>
    </th>
    <th class="border px-4 py-2 text-center dark:border-gray-700">
      <button
        type="button"
        class="inline-flex items-center justify-center gap-1 w-full"
        @click="toggleSort('empresa')"
      >
        Empresa
        <UIcon :name="sortIcon('empresa')" class="w-3 h-3" />
      </button>
    </th>

    <th
      v-for="f in columnasFechas"
      :key="f"
      class="border px-2 py-2 text-center dark:border-gray-700"
      :class="esDomingo(f)
        ? 'bg-red-100 text-red-900 dark:bg-red-900/50 dark:text-red-100'
        : esFinDeSemana(f)
          ? 'bg-yellow-50 dark:bg-yellow-900 dark:text-yellow-200'
          : 'dark:bg-gray-900 dark:text-gray-200'"
    >
      <span class="text-xs">{{ Number(f.split('-')[0]) }}</span>
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
        <td class="border px-2 text-center dark:border-gray-700">{{ emp.dni }}</td>
        <td class="border px-3 dark:border-gray-700">{{ emp.apellidos }}</td>
        <td class="border px-3 dark:border-gray-700">{{ emp.nombre }}</td>
        <td class="border px-3 dark:border-gray-700">{{ emp.departamento || '' }}</td>
        <td class="border px-3 dark:border-gray-700">{{ emp.empresa || '' }}</td>

        <td v-for="f in columnasFechas" :key="f" class="border px-1 py-1 text-center relative group dark:border-gray-700" :class="[
          esFinDeSemana(f) && (!emp.dias[f]?.valor ? 'bg-yellow-50 dark:bg-yellow-900 dark:text-yellow-200' : ''),
          emp.dias[f]?.valor ? obtenerColorCelda(emp.dias[f].valor) : '',
          filaSeleccionada === emp.id ? 'ring-1 ring-blue-300 dark:ring-blue-300' : '',
          esDomingo(f) ? 'bg-red-100 text-red-900 dark:bg-red-900/50 dark:text-red-100' : '',
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
    </div>
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
  </div>
</template>
