<template>
  <div>
    <h2 class="text-lg font-semibold mb-3">Rutas Asignadas</h2>
    <table class="w-full border rounded text-sm">
      <thead class="bg-gray-100">
        <tr>
          <th class="p-2">Ruta</th>
          <th class="p-2">Técnico Asignado</th>
          <th class="p-2">Estado</th>
          <th class="p-2">Última actualización</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="ruta in rutasMock" :key="ruta.id">
          <td class="p-2">{{ ruta.nombre }}</td>
          <td class="p-2">{{ ruta.tecnico }}</td>
          <td class="p-2">
            <span :class="['px-2 py-1 rounded text-xs font-semibold', estadoColor(ruta.estado)]">
              {{ ruta.estadoLabel }}
            </span>
          </td>
          <td class="p-2">{{ ruta.ultimaActualizacion }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
// Mock de rutas
const rutasMock = [
  {
    id: 1,
    nombre: 'Ruta 1',
    tecnico: 'Juan Pérez',
    estado: 'operativa',
    estadoLabel: 'Operativa',
    ultimaActualizacion: 'hace 12 min',
  },
  {
    id: 2,
    nombre: 'Ruta 2',
    tecnico: 'Ana Torres',
    estado: 'con incidencias',
    estadoLabel: 'Con incidencias',
    ultimaActualizacion: 'hace 1h',
  },
  {
    id: 3,
    nombre: 'Ruta 3',
    tecnico: 'Luis Gómez',
    estado: 'sin reporte',
    estadoLabel: 'Sin reporte',
    ultimaActualizacion: 'hace 3h',
  },
]

const estadoColor = (estado: string) => {
  if (estado === 'operativa') return 'bg-green-100 text-green-800'
  if (estado === 'con incidencias') return 'bg-yellow-100 text-yellow-800'
  if (estado === 'sin reporte') return 'bg-red-100 text-red-800'
  return 'bg-gray-100 text-gray-800'
}
</script>
