<script setup lang="ts">
import TablaIncidencias from "~/components/Incidencias/TablaIncidencias.vue";
import TablaCalculo from "~/components/Incidencias/Tardanzas/TablaCalculo.vue";
const hoy = new Date();
// Por defecto: fechaInicio = 23 del mes anterior, fechaFin = 22 del mes actual
const defaultFechaInicio = (() => {
  const anio = hoy.getFullYear();
  let mes = hoy.getMonth(); // mes actual (0-11)
  if (mes === 0) {
    return `${anio - 1}-12-23`;
  }
  const mesStr = (mes).toString().padStart(2, '0');
  return `${anio}-${mesStr}-23`;
})();
const defaultFechaFin = (() => {
  const anio = hoy.getFullYear();
  const mes = hoy.getMonth() + 1;
  const mesStr = (mes).toString().padStart(2, '0');
  return `${anio}-${mesStr}-22`;
})();

// Persistir rango entre cambios de módulo
const fechaInicio = useCookie<string>('incidencias-fecha-inicio', {
  default: () => defaultFechaInicio,
  sameSite: 'lax'
});
const fechaFin = useCookie<string>('incidencias-fecha-fin', {
  default: () => defaultFechaFin,
  sameSite: 'lax'
});

const filaSeleccionada = ref<number | null>(null);
const filaRef = ref<HTMLElement | null>(null);
const filtroUsuario = useCookie<string>('incidencias-filtro-usuario', {
  default: () => '',
  sameSite: 'lax'
});
const filtroEmpresa = useCookie<string>('incidencias-filtro-empresa', {
  default: () => '',
  sameSite: 'lax'
});
const filtroDepartamento = useCookie<string>('incidencias-filtro-departamento', {
  default: () => '',
  sameSite: 'lax'
});
const tabActivo = useCookie<"incidencias" | "calculo">('incidencias-tab-activo', {
  default: () => 'incidencias',
  sameSite: 'lax'
});
const exportando = ref(false)
// Referencias a los componentes hijos
const tablaIncidenciasRef = ref<InstanceType<typeof TablaIncidencias> | null>(null);
const tablaCalculoRef = ref<InstanceType<typeof TablaCalculo> | null>(null);

// Estados temporales para los inputs de fecha
const fechaInicioTemp = ref(fechaInicio.value || defaultFechaInicio);
const fechaFinTemp = ref(fechaFin.value || defaultFechaFin);

function aplicarRangoFechas() {
  if (fechaInicioTemp.value && fechaFinTemp.value) {
    fechaInicio.value = fechaInicioTemp.value;
    fechaFin.value = fechaFinTemp.value;
    // Siempre recargar ambas tablas si existen
    if (tablaIncidenciasRef.value && typeof tablaIncidenciasRef.value.cargarIncidencias === 'function') {
      tablaIncidenciasRef.value.cargarIncidencias();
    }
    if (tablaCalculoRef.value && typeof tablaCalculoRef.value.cargarIncidencias === 'function') {
      tablaCalculoRef.value.cargarIncidencias();
    }
  }
}

// Si el usuario cambia de tab, recargar la tabla activa con los filtros actuales
watch(tabActivo, (nuevo) => {
  if (nuevo === 'incidencias' && tablaIncidenciasRef.value && typeof tablaIncidenciasRef.value.cargarIncidencias === 'function') {
    tablaIncidenciasRef.value.cargarIncidencias();
  }
  if (nuevo === 'calculo' && tablaCalculoRef.value && typeof tablaCalculoRef.value.cargarIncidencias === 'function') {
    tablaCalculoRef.value.cargarIncidencias();
  }
});


watch(filaSeleccionada, async () => {
  await nextTick();
  filaRef.value?.scrollIntoView({ behavior: "smooth", block: "center" });
});

async function descargarExcel() {
  if (exportando.value) return; // Evitar múltiples clics
  exportando.value = true;
  try {
    // Siempre pasar los filtros actuales a los hijos
    if (tabActivo.value === 'incidencias' && tablaIncidenciasRef.value && typeof tablaIncidenciasRef.value.descargarExcel === 'function') {
      await tablaIncidenciasRef.value.descargarExcel({
        fechaInicio: fechaInicio.value,
        fechaFin: fechaFin.value,
        filtroUsuario: filtroUsuario.value
      });
    } else if (tabActivo.value === 'calculo' && tablaCalculoRef.value && typeof tablaCalculoRef.value.descargarExcel === 'function') {
      await tablaCalculoRef.value.descargarExcel({
        fechaInicio: fechaInicio.value,
        fechaFin: fechaFin.value,
        filtroUsuario: filtroUsuario.value
      });
    }
  } catch (error) {
    console.error('Error al descargar Excel:', error);
  } finally {
    exportando.value = false;
  }
}


</script>

<template>
  <UDashboardPanel id="incidencias">
    <template #header>
      <UDashboardNavbar :ui="{ right: 'gap-3' }">
        <template #leading>
          <div class="flex items-center gap-3">
            <UDashboardSidebarCollapse />
            <div class="flex items-center gap-3 pl-2 border-l border-gray-200 dark:border-gray-800">
              <div class="hidden sm:flex items-center gap-2">
                <div class="h-8 w-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                  <UIcon name="i-heroicons-exclamation-triangle" class="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 class="text-base font-semibold text-gray-900 dark:text-white">
                    Gestión de Incidencias
                  </h1>
                  <p class="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <UIcon name="i-heroicons-clock" class="w-3 h-3" />
                    Tardanzas y faltas del personal
                  </p>
                </div>
              </div>
              <h1 class="sm:hidden text-base font-semibold text-gray-900 dark:text-white">
                Incidencias
              </h1>
            </div>
          </div>
        </template>

        <template #right>
          <div class="flex items-center gap-2">
            <!-- Indicador de sincronización -->
            <UTooltip text="Datos actualizados">
              <div class="hidden md:flex items-center gap-1.5 px-2 py-1 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <div class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                <span class="text-xs font-medium text-green-700 dark:text-green-400">En vivo</span>
              </div>
            </UTooltip>

            <!-- Notificaciones -->
            <UTooltip text="Incidencias pendientes">
              <UButton 
                                      color="neutral" 
                variant="ghost" 
                square 
                class="relative group"
              >
                <div class="relative">
                  <UIcon name="i-heroicons-bell" class="w-5 h-5 animate-ring text-gray-600 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors" />
                  
                  <!-- Contador badge -->
                  <div class="absolute -top-1.5 -right-1.5 min-w-4 h-4 px-1 bg-red-500 text-white text-[9px] font-semibold rounded-full flex items-center justify-center shadow-md border border-white dark:border-gray-900">
                    7
                  </div>
                </div>
              </UButton>
            </UTooltip>
          </div>
        </template>
      </UDashboardNavbar>
    </template>
    <template #body>
      <div class="mt-2">
        <div
          class="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-2"
        >
          <div class="flex">
            <button
              @click="tabActivo = 'incidencias'"
              class="px-6 py-4 text-sm font-semibold transition-colors"
              :class="
                tabActivo === 'incidencias'
                  ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/30 dark:text-blue-300 dark:bg-blue-900/40 dark:border-blue-400'
                  : 'text-slate-500 hover:text-indigo-600 hover:bg-slate-50 dark:text-gray-400 dark:hover:text-blue-300 dark:hover:bg-gray-800'
              "
            >
              Incidencias Justificadas
            </button>

            <button
              @click="tabActivo = 'calculo'"
              class="px-6 py-4 text-sm font-semibold transition-colors"
              :class="
                tabActivo === 'calculo'
                  ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/30 dark:text-blue-300 dark:bg-blue-900/40 dark:border-blue-400'
                  : 'text-slate-500 hover:text-indigo-600 hover:bg-slate-50 dark:text-gray-400 dark:hover:text-blue-300 dark:hover:bg-gray-800'
              "
            >
              Cálculo de Tardanzas
            </button>
          </div>
        </div>
        <div
          class="px-4 py-3 bg-white dark:bg-gray-900 border-y border-slate-200 dark:border-gray-700 flex items-center justify-between gap-4 flex-wrap"
        >
          <!-- IZQUIERDA: filtros -->
          <div class="flex items-end gap-4 flex-wrap">
            <!-- RANGO DE FECHAS -->
            <div class="flex flex-col gap-0.5">
              <label class="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Desde</label>
              <input type="date" v-model="fechaInicioTemp" class="border rounded-md px-2 py-2 bg-white dark:bg-gray-800 dark:text-gray-200 text-sm w-36 text-center focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div class="flex flex-col gap-0.5">
              <label class="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Hasta</label>
              <input type="date" v-model="fechaFinTemp" class="border rounded-md px-2 py-2 bg-white dark:bg-gray-800 dark:text-gray-200 text-sm w-36 text-center focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div class="flex flex-col justify-end">
              <button @click="aplicarRangoFechas" class="mt-2 px-4 py-2 rounded bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 dark:bg-blue-700 dark:hover:bg-blue-800 transition-colors">Aplicar</button>
            </div>


            <!-- BUSCADOR (protagonista) -->
            <div class="flex flex-col gap-0.5">
              <label
                class="text-[11px] font-semibold text-slate-500 uppercase tracking-wide"
              >
                Usuario
              </label>
              <input
                v-model="filtroUsuario"
                type="text"
                placeholder="DNI, apellido o nombre"
                class="border rounded-md px-3 py-2 bg-white dark:bg-gray-800 dark:text-gray-200 text-sm w-64 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div class="flex flex-col gap-0.5">
              <label class="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                Empresa
              </label>
              <select
                v-model="filtroEmpresa"
                class="border rounded-md px-3 py-2 bg-white dark:bg-gray-800 dark:text-gray-200 text-sm w-48 focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="">Todas</option>
                <option value="Ydieza SAC">Ydieza SAC</option>
                <option value="Cechriza SAC">Cechriza SAC</option>
              </select>
            </div>

            <div class="flex flex-col gap-0.5">
              <label class="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                Departamento
              </label>
              <select
                v-model="filtroDepartamento"
                class="border rounded-md px-3 py-2 bg-white dark:bg-gray-800 dark:text-gray-200 text-sm w-56 focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="">Todos</option>
                <option value="Sistemas_C">Sistemas_C</option>
                <option value="Operaciones_C">Operaciones_C</option>
                <option value="TEC_Taller_C">TEC_Taller_C</option>
                <option value="SSGG_C">SSGG_C</option>
                <option value="ADM_Cechriza">ADM_Cechriza</option>
                <option value="TEC_Taller_Y">TEC_Taller_Y</option>
                <option value="Operaciones_Y">Operaciones_Y</option>
              </select>
            </div>

          </div>

          <!-- DERECHA: acciones -->
          <div class="flex items-center gap-2 pl-4 border-slate-200 dark:border-gray-700">
            <!-- DESCARGAR EXCEL (acción secundaria) -->

            <UButton
          variant="outline"
          color="neutral"
        size="sm"
        @click="descargarExcel"
        :loading="exportando"
        :disabled="exportando"
        class="whitespace-nowrap hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-gray-200 transition-colors"
      >
        <UIcon name="i-lucide-download" class="w-4 h-4 mr-2" />
        {{ exportando ? 'Exportando...' : 'Exportar' }}
      </UButton>
           
          
          </div>
        </div>

        <!-- INCIDENCIAS -->
        <div
          v-if="tabActivo === 'incidencias'"
          class="overflow-x-auto rounded-lg shadow dark:bg-gray-900"
        >
          <TablaIncidencias
            ref="tablaIncidenciasRef"
            :filtro-usuario="filtroUsuario"
            :filtro-empresa="filtroEmpresa"
            :filtro-departamento="filtroDepartamento"
            :fecha-inicio="fechaInicio"
            :fecha-fin="fechaFin"
          />
        </div>

        <!-- CALCULO -->
        <div v-if="tabActivo === 'calculo'" class="space-y-4 dark:bg-gray-900">
          <TablaCalculo
            ref="tablaCalculoRef"
            :filtro-usuario="filtroUsuario"
            :filtro-empresa="filtroEmpresa"
            :filtro-departamento="filtroDepartamento"
            :fecha-inicio="fechaInicio"
            :fecha-fin="fechaFin"
          />
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>

<style scoped>

@keyframes ring {
  0% { transform: rotate(0deg); }
  10% { transform: rotate(15deg); }
  20% { transform: rotate(-15deg); }
  30% { transform: rotate(10deg); }
  40% { transform: rotate(-10deg); }
  50% { transform: rotate(5deg); }
  60% { transform: rotate(-5deg); }
  70% { transform: rotate(0deg); }
  100% { transform: rotate(0deg); }
}

.animate-ring {
  animation: ring 2s ease-in-out infinite;
  transform-origin: 50% 0%;
}
</style>
