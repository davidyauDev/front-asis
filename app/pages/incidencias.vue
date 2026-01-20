<script setup lang="ts">
import TablaIncidencias from "~/components/Incidencias/TablaIncidencias.vue";
import TablaCalculo from "~/components/Incidencias/Tardanzas/TablaCalculo.vue";
const tabActivo = ref<"incidencias" | "calculo">("incidencias");
const hoy = new Date();
const mesSeleccionado = ref(hoy.getMonth() + 1); 
const añoSeleccionado = ref(hoy.getFullYear());
const diaInicio = ref(1);
const diaFin = ref(31);
const filtroDiaInicio = ref(diaInicio.value);
const filtroDiaFin = ref(diaFin.value);
const filaSeleccionada = ref<number | null>(null);
const filaRef = ref<HTMLElement | null>(null);
const filtroUsuario = ref("");
const exportando = ref(false)
// Referencias a los componentes hijos
const tablaIncidenciasRef = ref<InstanceType<typeof TablaIncidencias> | null>(null);
const tablaCalculoRef = ref<InstanceType<typeof TablaCalculo> | null>(null);

function aplicarRangoDias() {
  diaInicio.value = filtroDiaInicio.value;
  diaFin.value = filtroDiaFin.value;
}

watch(filaSeleccionada, async () => {
  await nextTick();
  filaRef.value?.scrollIntoView({ behavior: "smooth", block: "center" });
});

async function descargarExcel() {
  if (exportando.value) return; // Evitar múltiples clics
  
  exportando.value = true;
  try {
    if (tabActivo.value === 'incidencias' && tablaIncidenciasRef.value) {
      await tablaIncidenciasRef.value.descargarExcel();
    } else if (tabActivo.value === 'calculo' && tablaCalculoRef.value) {
      await tablaCalculoRef.value.descargarExcel();
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
                                      color="gray" 
                variant="ghost" 
                square 
                class="relative group"
              >
                <div class="relative">
                  <UIcon name="i-heroicons-bell" class="w-5 h-5 animate-ring text-gray-600 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors" />
                  
                  <!-- Contador badge -->
                  <div class="absolute -top-1.5 -right-1.5 min-w-[16px] h-[16px] px-1 bg-red-500 text-white text-[9px] font-semibold rounded-full flex items-center justify-center shadow-md border border-white dark:border-gray-900">
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
            <!-- MES (principal) -->
            <div class="flex flex-col gap-0.5">
              <label class="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Mes</label>
              <select v-model="mesSeleccionado" class="border rounded-md px-3 py-2 bg-white dark:bg-gray-800 dark:text-gray-200 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none">
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
            </div>
            <!-- RANGO DE DÍAS SOLO EN TAB INCIDENCIAS -->
            <template v-if="tabActivo === 'incidencias'">
              <div class="flex flex-col gap-0.5">
                <label class="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Día inicio</label>
                <input type="number" v-model.number="filtroDiaInicio" min="1" :max="31" class="border rounded-md px-2 py-2 bg-white dark:bg-gray-800 dark:text-gray-200 text-sm w-20 text-center focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div class="flex flex-col gap-0.5">
                <label class="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Día fin</label>
                <input type="number" v-model.number="filtroDiaFin" min="1" :max="31" class="border rounded-md px-2 py-2 bg-white dark:bg-gray-800 dark:text-gray-200 text-sm w-20 text-center focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div class="flex flex-col justify-end">
                <button @click="aplicarRangoDias" class="mt-2 px-4 py-2 rounded bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 dark:bg-blue-700 dark:hover:bg-blue-800 transition-colors">Aplicar</button>
              </div>
            </template>

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

            <!-- AÑO (secundario) -->
            <div class="flex flex-col gap-0.5">
              <label
                class="text-[11px] font-semibold text-slate-500 uppercase tracking-wide"
              >
                Año
              </label>
              <input
                type="number"
                v-model.number="añoSeleccionado"
                min="2020"
                max="2030"
                class="border rounded-md px-2 py-2 bg-white dark:bg-gray-800 dark:text-gray-200 text-sm w-20 text-center focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          <!-- DERECHA: acciones -->
          <div class="flex items-center gap-2 pl-4 border-slate-200 dark:border-gray-700">
            <!-- DESCARGAR EXCEL (acción secundaria) -->

            <UButton
        variant="outline"
        color="gray"
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
            :mes-seleccionado="mesSeleccionado"
            :año-seleccionado="añoSeleccionado"
            :dia-inicio="diaInicio"
            :dia-fin="diaFin"
          />
        </div>

        <!-- CALCULO -->
        <div v-if="tabActivo === 'calculo'" class="space-y-4 dark:bg-gray-900">
          <TablaCalculo
            ref="tablaCalculoRef"
            :mes-seleccionado="mesSeleccionado"
            :año-seleccionado="añoSeleccionado"
            :filtro-usuario="filtroUsuario"
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
