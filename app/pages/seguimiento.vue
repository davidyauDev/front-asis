
<template>
    <UDashboardPanel id="seguimiento">
       <template #header>
      <UDashboardNavbar title="Seguimiento" :ui="{ right: 'gap-3' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
         <div class="seguimiento-container p-6">
        <!-- Encabezado -->
        <header class="mb-6">
            <h1 class="text-2xl font-bold mb-1 flex items-center gap-2">
                <span>Seguimiento de Técnicos</span>
                <span class="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">Módulo Operativo</span>
            </h1>
            <p class="text-gray-600 mb-4">Monitorea en tiempo real el estado de técnicos en ruta, actividad diaria y cumplimiento de asistencia. Detección temprana de incidencias y trazabilidad para acciones correctivas.</p>
            <div class="flex flex-wrap gap-4 items-center mb-4">
                <input v-model="search" type="text" placeholder="Buscar técnico o ruta..." class="border rounded px-3 py-2 w-64" />
                <button class="bg-gray-100 px-3 py-2 rounded border text-gray-700 hover:bg-gray-200" @click="showFilters = !showFilters">Filtros avanzados</button>
                <button class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 ml-auto" @click="generarReporte">Generar Reporte</button>
            </div>
            <div v-if="showFilters" class="mb-4 p-4 bg-gray-50 border rounded">
                <!-- Filtros avanzados (mock) -->
                <span class="text-gray-500">[Filtros avanzados aquí]</span>
            </div>
            <!-- Indicadores resumen -->
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-2">
                <ResumenCard
                    v-for="card in resumenCards"
                    :key="card.titulo"
                    :titulo="card.titulo"
                    :valor="card.valor"
                    :estado="card.estado"
                    :icono="card.icono"
                />
            </div>
        </header>

        <!-- Navegación por secciones -->
        <nav class="mb-6">
            <ul class="flex gap-4 border-b">
                <li v-for="tab in tabs" :key="tab.value">
                    <button
                        class="px-4 py-2 -mb-px border-b-2"
                        :class="activeTab === tab.value ? 'border-blue-600 text-blue-700 font-semibold' : 'border-transparent text-gray-500'"
                        @click="activeTab = tab.value"
                    >
                        {{ tab.label }}
                    </button>
                </li>
            </ul>
        </nav>

        <!-- Secciones -->
        <section v-if="activeTab === 'general'">
            <!-- General: Técnicos en Ruta -->
            <TecnicosEnRuta :tecnicos="tecnicos" />
        </section>
        <section v-else-if="activeTab === 'alertas'">
            <AlertasSection :alertas="alertas" />
        </section>
        <section v-else-if="activeTab === 'comunicaciones'">
            <ComunicacionesSection :comunicaciones="comunicaciones" />
        </section>
        <section v-else-if="activeTab === 'rutas'">
            <RutasSection :rutas="rutas" />
        </section>
    </div>
    </template>

   
    </UDashboardPanel>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// Mock de tabs/secciones
const tabs = [
    { label: 'General', value: 'general' },
    { label: 'Alertas', value: 'alertas' },
    { label: 'Registro de Comunicaciones', value: 'comunicaciones' },
    { label: 'Rutas', value: 'rutas' },
]
const activeTab = ref('general')

// Mock de buscador y filtros
const search = ref('')
const showFilters = ref(false)
const generarReporte = () => {
    alert('Funcionalidad de generación de reporte (mock)')
}

// Mock de indicadores resumen
const resumenCards = [
    {
        titulo: 'Técnicos Activos',
        valor: 8,
        estado: 'normal',
        icono: 'mdi-account-check',
    },
    {
        titulo: 'Técnicos en Alerta',
        valor: 2,
        estado: 'warning',
        icono: 'mdi-alert',
    },
    {
        titulo: 'No Reportados',
        valor: 1,
        estado: 'critical',
        icono: 'mdi-account-off',
    },
    {
        titulo: 'Comunicaciones 24h',
        valor: 12,
        estado: 'normal',
        icono: 'mdi-email-send',
    },
]

// Mock de datos para secciones (se completarán en siguientes pasos)
const tecnicos = ref([])
const alertas = ref([])
const comunicaciones = ref([])
const rutas = ref([])

// Componentes de sección (se crearán)
import ResumenCard from '../components/seguimiento/ResumenCard.vue'
import TecnicosEnRuta from '../components/seguimiento/TecnicosEnRuta.vue'
import AlertasSection from '../components/seguimiento/AlertasSection.vue'
import ComunicacionesSection from '../components/seguimiento/ComunicacionesSection.vue'
import RutasSection from '../components/seguimiento/RutasSection.vue'
</script>

<style scoped>
.seguimiento-container {
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 2px 8px 0 rgba(0,0,0,0.04);
    min-height: 90vh;
}
</style>