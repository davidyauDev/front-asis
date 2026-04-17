<script setup lang="ts">
import TablaIncidencias from "~/components/Incidencias/TablaIncidencias.vue";
import TablaCalculo from "~/components/Incidencias/Tardanzas/TablaCalculo.vue";
const hoy = new Date();
const pad2 = (value: number) => String(value).padStart(2, '0')

const formatYmd = (date: Date) =>
  `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`

const getCurrentCycleStart = (date: Date) => {
  const startMonthOffset = date.getDate() >= 23 ? 0 : -1
  return new Date(date.getFullYear(), date.getMonth() + startMonthOffset, 23)
}

// Ciclo mensual: del 23 al 22, con arranque por defecto en el último 23 hasta hoy.
const defaultFechaInicio = formatYmd(getCurrentCycleStart(hoy));
const defaultFechaFin = formatYmd(hoy);

// Persistir rango entre cambios de módulo
const fechaInicio = useCookie<string>('incidencias-fecha-inicio', {
  default: () => defaultFechaInicio,
  sameSite: 'lax'
});
const fechaFin = useCookie<string>('incidencias-fecha-fin', {
  default: () => defaultFechaFin,
  sameSite: 'lax'
});

const { openNotifications: openRrhhNotifications } = useRrhhNotificationsPanel();

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
const tabItems = [
  { label: 'Incidencias Justificadas', value: 'incidencias' },
  { label: 'Calculo de Tardanzas', value: 'calculo' },
] as const
// Referencias a los componentes hijos
const tablaIncidenciasRef = ref<InstanceType<typeof TablaIncidencias> | null>(null);
const tablaCalculoRef = ref<InstanceType<typeof TablaCalculo> | null>(null);

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
      <AppDashboardHeader title="Gestion de Incidencias" mobile-title="Incidencias" subtitle-icon="i-heroicons-clock"
        notification-tooltip="Incidencias pendientes" notification-attention
        @notification-click="openRrhhNotifications" />
      <UDashboardToolbar>
        <div class="mt-2 w-full">
          <AppTabs v-model="tabActivo" aria-label="Tabs de incidencias" :items="tabItems" />
        </div>
      </UDashboardToolbar>

    </template>
    <template #body>
      <div >
        <div v-if="false"
          class="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-2">
          <div class="flex">
            <button @click="tabActivo = 'incidencias'" class="px-6 py-4 text-sm font-semibold transition-colors" :class="tabActivo === 'incidencias'
                ? 'text-[#2d5fc0] border-b-2 border-[#2d5fc0] bg-[#eef4ff] dark:text-[#9cb7f5] dark:bg-[#13203a] dark:border-[#8fb0ff]'
                : 'text-slate-500 hover:text-[#2d5fc0] hover:bg-slate-50 dark:text-gray-400 dark:hover:text-[#9cb7f5] dark:hover:bg-gray-800'
              ">
              Incidencias Justificadas
            </button>

            <button @click="tabActivo = 'calculo'" class="px-6 py-4 text-sm font-semibold transition-colors" :class="tabActivo === 'calculo'
                ? 'text-[#2d5fc0] border-b-2 border-[#2d5fc0] bg-[#eef4ff] dark:text-[#9cb7f5] dark:bg-[#13203a] dark:border-[#8fb0ff]'
                : 'text-slate-500 hover:text-[#2d5fc0] hover:bg-slate-50 dark:text-gray-400 dark:hover:text-[#9cb7f5] dark:hover:bg-gray-800'
              ">
              Cálculo de Tardanzas
            </button>
          </div>
        </div>
        <div class="mb-4 flex items-end justify-between gap-4">
          <!-- IZQUIERDA: filtros -->
          <div class="min-w-0 flex-1 overflow-x-auto pb-1">
            <div class="flex min-w-max items-end gap-4 flex-nowrap pr-2">
            <div class="w-[420px] shrink-0 flex flex-col gap-0.5">
              <label class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Usuario
              </label>
              <UInput
                v-model="filtroUsuario"
                icon="i-lucide-search"
                size="md"
                placeholder="Buscar por nombre, apellido o DNI..."
                class="w-[420px]"
                :ui="{ base: 'rounded-xl border-slate-300 bg-white dark:border-gray-700 dark:bg-gray-800' }"
              />
            </div>
            <!-- RANGO DE FECHAS -->
            <div class="flex flex-col gap-0.5 shrink-0">
              <label class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Desde</label>
              <input v-model="fechaInicio" type="date"
                class="w-36 rounded-md border border-slate-200 bg-white px-2 py-2 text-center text-sm outline-none transition-colors focus:border-[#2d5fc0] focus:ring-2 focus:ring-[#2d5fc0]/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:focus:border-[#8fb0ff] dark:focus:ring-[#8fb0ff]/20" />
            </div>
            <div class="flex flex-col gap-0.5 shrink-0">
              <label class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Hasta</label>
              <input v-model="fechaFin" type="date"
                class="w-36 rounded-md border border-slate-200 bg-white px-2 py-2 text-center text-sm outline-none transition-colors focus:border-[#2d5fc0] focus:ring-2 focus:ring-[#2d5fc0]/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:focus:border-[#8fb0ff] dark:focus:ring-[#8fb0ff]/20" />
            </div>
            <div class="flex flex-col gap-0.5 shrink-0">
              <label class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Empresa
              </label>
              <select v-model="filtroEmpresa"
                class="w-48 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-[#2d5fc0] focus:ring-2 focus:ring-[#2d5fc0]/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:focus:border-[#8fb0ff] dark:focus:ring-[#8fb0ff]/20">
                <option value="">Todas</option>
                <option value="Ydieza SAC">Ydieza SAC</option>
                <option value="Cechriza SAC">Cechriza SAC</option>
              </select>
            </div>
            <div class="flex flex-col gap-0.5 shrink-0">
              <label class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Departamento
              </label>
              <select v-model="filtroDepartamento"
                class="w-56 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-[#2d5fc0] focus:ring-2 focus:ring-[#2d5fc0]/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:focus:border-[#8fb0ff] dark:focus:ring-[#8fb0ff]/20">
                <option value="">Todos</option>
                <option value="Sistemas_C">Sistemas_C</option>
                <option value="Operaciones_C">Operaciones_C</option>
                <option value="TEC_Taller_C">TEC_Taller_C</option>
                <option value="SSGG_C">SSGG_C</option>
                <option value="ADM_Cechriza">ADM_Cechriza</option>
                <option value="ADM_Ydieza">ADM_Ydieza</option>
                <option value="TEC_Taller_Y">TEC_Taller_Y</option>
                <option value="Operaciones_Y">Operaciones_Y</option>
              </select>
            </div>
            </div>
          </div>
          <div class="shrink-0">
            <UButton variant="solid" color="primary" size="md" @click="descargarExcel" :loading="exportando"
              :disabled="exportando"
              class="min-w-[176px] h-11 justify-center whitespace-nowrap rounded-xl border border-[#2d5fc0] !bg-[#2d5fc0] !text-white px-4 font-semibold shadow-sm transition-all hover:!bg-[#244ea4] hover:shadow-md active:scale-[0.99] disabled:border-[#9cb7f5] disabled:!bg-[#9cb7f5] disabled:shadow-none dark:border-[#4a7dff] dark:!bg-[#4a7dff] dark:hover:!bg-[#3f6fe0] dark:disabled:!bg-[#2b4f9f]">
              <template #leading>
                <UIcon name="i-lucide-file-spreadsheet" class="h-4 w-4" />
              </template>
              {{ exportando ? 'Descargando...' : 'Descargar Excel' }}
            </UButton>
          </div>
        </div>
        <div v-if="tabActivo === 'incidencias'" class="overflow-x-auto rounded-lg shadow dark:bg-gray-900">
          <TablaIncidencias ref="tablaIncidenciasRef" :filtro-usuario="filtroUsuario" :filtro-empresa="filtroEmpresa"
            :filtro-departamento="filtroDepartamento" :fecha-inicio="fechaInicio" :fecha-fin="fechaFin" />
        </div>

        <!-- CALCULO -->
        <div v-if="tabActivo === 'calculo'" class="space-y-4 dark:bg-gray-900">
          <TablaCalculo ref="tablaCalculoRef" :filtro-usuario="filtroUsuario" :filtro-empresa="filtroEmpresa"
            :filtro-departamento="filtroDepartamento" :fecha-inicio="fechaInicio" :fecha-fin="fechaFin" />
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>
