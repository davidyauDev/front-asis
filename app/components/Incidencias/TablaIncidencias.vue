<script setup lang="ts">
import { ref, shallowRef, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue';
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
const imagenPreviewOpen = ref(false);
const imagenPreview = shallowRef<{
  src: string;
  titulo: string;
  detalle: string;
} | null>(null);

interface Dia {
  valor?: string;
  motivo?: string;
  created_at?: string;
  creado_por?: any;
  imagen_url?: string | null;
  imagenUrl?: string | null;
  imagen_path?: string | null;
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

interface FormIncidenciaPayload {
  fecha: string;
  minutos?: number;
  duracionSegundos?: number;
  tipo?: string;
  motivo: string;
  imagenFile?: File | null;
}

const toast = useToast()
const datosEmpleados = ref<Empleado[]>([]);
const cargando = ref(true);
const topScrollRef = ref<HTMLElement | null>(null);
const tableScrollRef = ref<HTMLElement | null>(null);
const tableScrollWidth = ref(0);
let tableResizeObserver: ResizeObserver | null = null;

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

const syncHorizontalScroll = (source: HTMLElement | null, target: HTMLElement | null) => {
  if (!source || !target) return

  const nextLeft = source.scrollLeft
  if (target.scrollLeft !== nextLeft) {
    target.scrollLeft = nextLeft
  }
}

const syncTopToTable = () => syncHorizontalScroll(topScrollRef.value, tableScrollRef.value)
const syncTableToTop = () => syncHorizontalScroll(tableScrollRef.value, topScrollRef.value)

const updateTableScrollWidth = () => {
  tableScrollWidth.value = tableScrollRef.value?.scrollWidth || 0
}

const setupTableScrollSync = () => {
  tableResizeObserver?.disconnect()
  tableResizeObserver = null

  if (tableScrollRef.value && typeof ResizeObserver !== 'undefined') {
    tableResizeObserver = new ResizeObserver(() => {
      updateTableScrollWidth()
    })
    tableResizeObserver.observe(tableScrollRef.value)
  }

  updateTableScrollWidth()
}

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
  if (validarFormatoTiempo(valor)) return 'bg-[#eef4ff] text-[#2d5fc0] dark:bg-[#13203a] dark:text-[#9cb7f5]';
  return 'bg-red-100 text-red-900 dark:bg-red-900 dark:text-red-100';
};

const formatCreatedAt = (raw?: string) => {
  if (!raw) return '';
  const date = new Date(raw);
  if (isNaN(date.getTime())) return raw;

  const fecha = new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'America/Lima'
  }).format(date);

  const hora = new Intl.DateTimeFormat('es-PE', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
    timeZone: 'America/Lima'
  }).format(date);

  return `${fecha} ${hora}`;
};

const formatCreatedBy = (raw: any) => {
  if (!raw) return 'Admin';
  if (typeof raw === 'string' || typeof raw === 'number') return String(raw);

  const nombre =
    raw.nombre ||
    raw.nombres ||
    raw.name ||
    raw.full_name ||
    raw.fullName;

  const apellidos =
    raw.apellidos ||
    raw.apellido ||
    raw.last_name ||
    raw.lastName;

  const partes = [nombre, apellidos].filter(Boolean);
  if (partes.length) return partes.join(' ');

  return 'Admin';
};

const resolveDiaImageUrl = (dia?: Dia | null) => {
  const candidates = [
    dia?.imagen_url,
    dia?.imagenUrl,
    dia?.imagen_path,
  ];

  return candidates.find((value) => Boolean(value)) || '';
};

const openDiaImagePreview = (dia: Dia | undefined | null, emp: Empleado) => {
  const src = resolveDiaImageUrl(dia);
  if (!src) return;

  imagenPreview.value = {
    src,
    titulo: dia?.motivo || 'Vista previa de la incidencia',
    detalle: `${emp.apellidos} ${emp.nombre}`.trim(),
  };
  imagenPreviewOpen.value = true;
};

const closeDiaImagePreview = () => {
  imagenPreviewOpen.value = false;
  imagenPreview.value = null;
};

watch(imagenPreviewOpen, (isOpen) => {
  if (!isOpen) {
    closeDiaImagePreview();
  }
});
const guardarIncidencia = async (formIncidencia: FormIncidenciaPayload) => {
  const user = useCookie<{ id: number } | null>('auth_user')
  if (!user.value) {
    toast.add({
      title: 'Error',
      description: 'Usuario no autenticado',
      color: 'error'
    })
    return
  }
  try {
    const config = useRuntimeConfig()
    const token = useCookie<string | null>('auth_token')
    const formData = new FormData()

    formData.append('creado_por', String(user.value.id))
    formData.append('usuario_id', String(usuarioSeleccionado.value ?? ''))
    formData.append('tipo', String(formIncidencia.tipo ?? ''))
    formData.append('fecha', formIncidencia.fecha)
    formData.append(
      'duracion_segundos',
      String(
        formIncidencia.duracionSegundos ??
          (typeof formIncidencia.minutos === 'number'
            ? formIncidencia.minutos * 60
            : 0)
      )
    )
    formData.append('motivo', formIncidencia.motivo)

    if (typeof formIncidencia.minutos === 'number') {
      formData.append('minutos', String(formIncidencia.minutos))
    }

    if (typeof formIncidencia.duracionSegundos === 'number') {
      formData.append('segundos', String(formIncidencia.duracionSegundos % 60))
    }

    if (formIncidencia.imagenFile) {
      formData.append('imagen', formIncidencia.imagenFile)
    }

    await fetch(`${config.public.apiBaseUrl}/api/incidencias/store`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        ...(token.value ? { Authorization: `Bearer ${token.value}` } : {}),
      },
      body: formData
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


onMounted(async () => {
  await cargarIncidencias();
  await nextTick();
  setupTableScrollSync();
});

watch([
  () => props.fechaInicio,
  () => props.fechaFin
], async () => {
  await cargarIncidencias();
  await nextTick();
  setupTableScrollSync();
});

watch(
  () => columnasFechas.value.length,
  async () => {
    await nextTick()
    updateTableScrollWidth()
  }
)

onBeforeUnmount(() => {
  tableResizeObserver?.disconnect()
  tableResizeObserver = null
});

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
      <div v-else class="space-y-0">
        <div
          ref="topScrollRef"
          class="h-5 overflow-x-scroll overflow-y-hidden rounded-t-lg border border-b-0 border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900"
          @scroll="syncTopToTable"
        >
          <div :style="{ width: `${tableScrollWidth || 0}px` }" class="h-1 min-w-full" />
        </div>

        <div
          ref="tableScrollRef"
          class="overflow-x-auto rounded-b-lg border border-gray-200 shadow dark:border-gray-700 dark:bg-gray-900"
          @scroll="syncTableToTop"
        >
          <table class="w-full text-xs dark:text-gray-200">
    <!-- HEADER -->
    <thead>
  <!-- FILA 1: CONTEXTO -->
  <tr>
    <th
      colspan="5"
      class="bg-gradient-to-r from-[#2d5fc0] to-[#4a7dff] text-white text-center py-3 font-bold border dark:from-[#244a95] dark:to-[#355fba] dark:text-gray-100 dark:border-gray-700"
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

    <th class="bg-emerald-600 text-white px-3 text-sm dark:bg-emerald-900 dark:text-gray-100">
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

    <th class="border px-3 py-2 text-center font-semibold text-emerald-700 dark:border-gray-700 dark:text-emerald-300">
      HH:MM
    </th>

    <th class="border px-3 py-2 text-center dark:border-gray-700"></th>
  </tr>

</thead>


    <!-- BODY -->
    <tbody>
      <tr v-for="emp in empleadosFiltrados" :key="emp.id" :ref="el => setFilaRef(el, emp)"
        class="cursor-pointer transition-colors dark:hover:bg-gray-800"
        :class="filaSeleccionada === emp.id ? 'bg-[#eef4ff] ring-2 ring-[#2d5fc0]/35 ring-inset dark:bg-[#13203a] dark:ring-[#8fb0ff]/30' : 'hover:bg-gray-50 dark:hover:bg-gray-800'">
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
          <UPopover
            v-if="emp.dias[f]?.motivo || resolveDiaImageUrl(emp.dias[f])"
            mode="hover"
            :portal="true"
            :arrow="true"
            :content="{ side: 'top', sideOffset: 8, collisionPadding: 12 }"
          >
            <template #default>
              <template v-if="emp.dias[f]">
                <input v-if="filaSeleccionada === emp.id" v-model="emp.dias[f].valor"
                  class="w-full bg-transparent text-center focus:outline-none focus:ring-2 focus:ring-[#2d5fc0] rounded dark:bg-gray-800 dark:text-gray-200" />
                <span v-else class="font-medium" :title="emp.dias[f].motivo || ''">
                  {{ emp.dias[f].valor }}
                </span>
              </template>
            </template>
            <template #content>
              <div class="w-96 max-w-[90vw] overflow-hidden rounded-2xl border border-gray-200 bg-white/95 shadow-2xl backdrop-blur dark:border-gray-700 dark:bg-gray-900/95">
                <div class="border-b border-gray-100 px-4 py-3 dark:border-gray-800">
                  <div class="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
                    Motivo
                  </div>
                  <div class="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {{ emp.dias[f].motivo || 'Sin motivo registrado' }}
                  </div>
                </div>

                <div class="space-y-3 px-4 py-3 text-xs text-gray-700 dark:text-gray-200">
                  <div class="flex items-start justify-between gap-3">
                    <div class="text-gray-600 dark:text-gray-300">
                      <span class="font-medium">Creado por:</span> {{ formatCreatedBy(emp.dias[f].creado_por) }}
                    </div>
                    <div class="text-right text-gray-500 dark:text-gray-400">
                      <span class="font-medium">Fecha:</span> {{ formatCreatedAt(emp.dias[f].created_at) }}
                    </div>
                  </div>

                  <div v-if="resolveDiaImageUrl(emp.dias[f])" class="space-y-2">
                    <div class="flex items-center justify-between">
                      <span class="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400">
                        Imagen adjunta
                      </span>
                      <UButton
                        size="xs"
                        color="neutral"
                        variant="ghost"
                        icon="i-lucide-maximize-2"
                        @click.stop="openDiaImagePreview(emp.dias[f], emp)"
                      >
                        Ampliar
                      </UButton>
                    </div>

                    <button
                      type="button"
                      class="group block w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-50 text-left transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
                      @click.stop="openDiaImagePreview(emp.dias[f], emp)"
                    >
                      <img
                        :src="resolveDiaImageUrl(emp.dias[f])"
                        alt="Imagen de incidencia"
                        class="h-40 w-full object-cover"
                      />
                      <div class="flex items-center justify-between px-3 py-2 text-[11px] text-gray-500 dark:text-gray-400">
                        <span>Haz clic para ampliar</span>
                        <UIcon name="i-lucide-zoom-in" class="h-3.5 w-3.5" />
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </template>
          </UPopover>

          <template v-else-if="emp.dias[f]">
            <input v-if="filaSeleccionada === emp.id" v-model="emp.dias[f].valor"
              class="w-full bg-transparent text-center focus:outline-none focus:ring-2 focus:ring-[#2d5fc0] rounded dark:bg-gray-800 dark:text-gray-200" />
            <span v-else class="font-medium" :title="emp.dias[f].motivo || ''">
              {{ emp.dias[f].valor }}
            </span>
          </template>
        </td>

        <td class="border px-2 text-center font-bold bg-emerald-50 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-200 dark:border-gray-700">
          <span class="dark:text-emerald-200 text-emerald-900">{{ emp.incidencias_hhmm }}</span>
        </td>
        <td class="border px-2 text-center dark:border-gray-700">
          <div class="inline-flex items-center gap-1">
            <UTooltip text="Ver tracking">
              <UButton size="xs" color="primary" variant="ghost" icon="i-heroicons-eye"
                class="transition-colors hover:bg-[#eef4ff] dark:hover:bg-gray-800/60 dark:text-gray-200" @click.stop="verTracking(emp)" />
            </UTooltip>
            <UTooltip text="Agregar incidencia">
              <UButton size="xs" color="emerald" variant="ghost" icon="i-heroicons-plus"
                class="transition-colors hover:bg-emerald-50 dark:hover:bg-gray-800/60 dark:text-gray-200" @click.stop="agregarIncidencia(emp)" />
            </UTooltip>
          </div>
        </td>

      </tr>
    </tbody>
          </table>
        </div>
      </div>
    </div>
    <UModal
      v-model:open="imagenPreviewOpen"
      title="Vista previa de la imagen"
      :close="{ color: 'neutral', variant: 'ghost' }"
      class="max-w-4xl w-full"
    >
      <template #body>
        <div v-if="imagenPreview" class="space-y-4 p-4">
          <div class="space-y-1">
            <p class="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {{ imagenPreview.titulo }}
            </p>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              {{ imagenPreview.detalle }}
            </p>
          </div>

          <div class="overflow-hidden rounded-2xl border border-gray-200 bg-gray-950 shadow-2xl dark:border-gray-800">
            <img
              :src="imagenPreview.src"
              alt="Imagen ampliada de la incidencia"
              class="max-h-[78vh] w-full object-contain bg-black"
            />
          </div>
        </div>
      </template>
    </UModal>
    <AddIncidencia
      v-model:isOpen="isIncidenciaOpen"
      :empleadoId="usuarioSeleccionado"
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
