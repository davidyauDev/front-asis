<script setup lang="ts">
import TablaIncidencias from "~/components/Incidencias/TablaIncidencias.vue";
import TablaCalculo from "~/components/Incidencias/Tardanzas/TablaCalculo.vue";
const tabActivo = ref<"incidencias" | "calculo">("incidencias");
const mesSeleccionado = ref(12);
const añoSeleccionado = ref(2025);
const filaSeleccionada = ref<number | null>(null);
const filaRef = ref<HTMLElement | null>(null);
const filtroUsuario = ref("");

watch(filaSeleccionada, async () => {
  await nextTick();
  filaRef.value?.scrollIntoView({ behavior: "smooth", block: "center" });
});
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
        <div class="flex items-center justify-between border-b border-gray-200 bg-white px-2">
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
        <div v-if="tabActivo === 'incidencias'" class="overflow-x-auto rounded-lg shadow">
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
