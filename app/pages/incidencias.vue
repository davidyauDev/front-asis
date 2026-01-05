<script setup lang="ts">
import TablaIncidencias from "~/components/Incidencias/TablaIncidencias.vue";
import TablaCalculo from "~/components/Incidencias/Tardanzas/TablaCalculo.vue";
const tabActivo = ref<"incidencias" | "calculo">("incidencias");
const hoy = new Date();
const mesSeleccionado = ref(hoy.getMonth() + 1); 
const añoSeleccionado = ref(hoy.getFullYear());
const filaSeleccionada = ref<number | null>(null);
const filaRef = ref<HTMLElement | null>(null);
const filtroUsuario = ref("");

watch(filaSeleccionada, async () => {
  await nextTick();
  filaRef.value?.scrollIntoView({ behavior: "smooth", block: "center" });
});

function descargarExcel() {
  console.log("Descargar Excel", {
    tab: tabActivo.value,
    mes: mesSeleccionado.value,
    año: añoSeleccionado.value,
    filtro: filtroUsuario.value,
  });
}

function enviarCorreosMasivos() {
  console.log("Enviar correos masivos", {
    mes: mesSeleccionado.value,
    año: añoSeleccionado.value,
    filtro: filtroUsuario.value,
  });
}
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
        <div
          class="flex items-center justify-between border-b border-gray-200 bg-white px-2"
        >
          <div class="flex">
            <button
              @click="tabActivo = 'incidencias'"
              class="px-6 py-4 text-sm font-semibold transition-colors"
              :class="
                tabActivo === 'incidencias'
                  ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/30'
                  : 'text-slate-500 hover:text-indigo-600 hover:bg-slate-50'
              "
            >
              Incidencias Justificadas
            </button>

            <button
              @click="tabActivo = 'calculo'"
              class="px-6 py-4 text-sm font-semibold transition-colors"
              :class="
                tabActivo === 'calculo'
                  ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/30'
                  : 'text-slate-500 hover:text-indigo-600 hover:bg-slate-50'
              "
            >
              Cálculo de Tardanzas
            </button>
          </div>
        </div>
        <!-- FILTROS -->
        <!-- FILTER BAR -->
        <div
          class="px-4 py-3 bg-white border-y border-slate-200 flex items-center justify-between gap-4 flex-wrap"
        >
          <!-- IZQUIERDA: filtros -->
          <div class="flex items-end gap-4 flex-wrap">
            <!-- MES (principal) -->
            <div class="flex flex-col gap-0.5">
              <label
                class="text-[11px] font-semibold text-slate-500 uppercase tracking-wide"
              >
                Mes
              </label>
              <select
                v-model="mesSeleccionado"
                class="border rounded-md px-3 py-2 bg-white text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option
                  v-for="mes in [
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
                  ]"
                  :key="mes.valor"
                  :value="mes.valor"
                >
                  {{ mes.nombre }}
                </option>
              </select>
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
                class="border rounded-md px-3 py-2 bg-white text-sm w-64 focus:ring-2 focus:ring-indigo-500 outline-none"
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
                class="border rounded-md px-2 py-2 bg-white text-sm w-20 text-center focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          <!-- DERECHA: acciones -->
          <div class="flex items-center gap-2 pl-4 border-slate-200">
            <!-- DESCARGAR EXCEL (acción secundaria) -->
            <UButton
              color="success"
              variant="outline"
              icon="i-heroicons-arrow-down-tray"
              class="text-slate-700 border-slate-300 hover:bg-slate-50"
              @click="descargarExcel"
            >
              Excel
            </UButton>

            <!-- ENVIAR CORREOS (acción principal, solo cálculo) -->
            <UButton
              v-if="tabActivo === 'calculo'"
              color="primary"
              variant="soft"
              icon="i-heroicons-envelope"
              class="font-medium"
              @click="enviarCorreosMasivos"
            >
              Enviar correos
            </UButton>
          </div>
        </div>

        <!-- INCIDENCIAS -->
        <div
          v-if="tabActivo === 'incidencias'"
          class="overflow-x-auto rounded-lg shadow"
        >
          <TablaIncidencias
            :filtro-usuario="filtroUsuario"
            :mes-seleccionado="mesSeleccionado"
            :año-seleccionado="añoSeleccionado"
          />
        </div>

        <!-- CALCULO -->
        <div v-if="tabActivo === 'calculo'" class="space-y-4">
          <TablaCalculo
            :mes-seleccionado="mesSeleccionado"
            :año-seleccionado="añoSeleccionado"
            :filtro-usuario="filtroUsuario"
          />
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>
