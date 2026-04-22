<script setup lang="ts">
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
const exportando = ref(false)
const tablaCalculoRef = ref<InstanceType<typeof TablaCalculo> | null>(null);


watch(filaSeleccionada, async () => {
  await nextTick();
  filaRef.value?.scrollIntoView({ behavior: "smooth", block: "center" });
});

async function descargarExcel() {
  if (exportando.value) return; // Evitar múltiples clics
  exportando.value = true;
  try {
    if (tablaCalculoRef.value && typeof tablaCalculoRef.value.descargarExcel === 'function') {
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
  <UDashboardPanel id="tardanzas">
    <template #header>
      <AppDashboardHeader title="Calculo de Tardanzas" mobile-title="Tardanzas" subtitle-icon="i-heroicons-clock"
        notification-tooltip="Tardanzas pendientes" notification-attention
        @notification-click="openRrhhNotifications" />
    </template>
    <template #body>
      <div >
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
        <div class="overflow-x-auto rounded-lg shadow dark:bg-gray-900">
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
