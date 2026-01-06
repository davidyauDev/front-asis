<template>
  <div>
    <h2 class="text-lg font-semibold mb-3">Técnicos en Ruta</h2>
    <table class="w-full border rounded text-sm">
      <thead class="bg-gray-100">
        <tr>
          <th class="p-2">Nombre</th>
          <th class="p-2">Contacto</th>
          <th class="p-2">Ruta</th>
          <th class="p-2">Estado</th>
          <th class="p-2">Última actividad</th>
          <th class="p-2">Ubicación</th>
          <th class="p-2">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="tecnico in tecnicosMock" :key="tecnico.id">
          <td class="p-2">{{ tecnico.nombre }}</td>
          <td class="p-2">{{ tecnico.contacto }}</td>
          <td class="p-2">{{ tecnico.ruta }}</td>
          <td class="p-2">
            <span :class="['px-2 py-1 rounded text-xs font-semibold', estadoColor(tecnico.estado)]">
              {{ tecnico.estadoLabel }}
            </span>
          </td>
          <td class="p-2">{{ tecnico.ultimaActividad }}</td>
          <td class="p-2">{{ tecnico.ubicacion }}</td>
          <td class="p-2">
            <button class="text-blue-600 hover:underline mr-2">Ver</button>
            <button class="text-green-600 hover:underline">Acción</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
// Mock de técnicos
const tecnicosMock = [
  {
    id: 1,
    nombre: 'Juan Pérez',
    contacto: '999-123-456',
    ruta: 'Ruta 1',
    estado: 'activo',
    estadoLabel: 'Activo',
    ultimaActividad: 'hace 12 min',
    ubicacion: 'Av. Central 123',
  },
  {
    id: 2,
    nombre: 'Ana Torres',
    contacto: '999-234-567',
    ruta: 'Ruta 2',
    estado: 'alerta',
    estadoLabel: 'Alerta',
    ultimaActividad: 'hace 1h 5min',
    ubicacion: 'Calle Sur 45',
  },
  {
    id: 3,
    nombre: 'Luis Gómez',
    contacto: '999-345-678',
    ruta: 'Ruta 3',
    estado: 'desconectado',
    estadoLabel: 'Desconectado',
    ultimaActividad: 'hace 3h 20min',
    ubicacion: 'Sin datos',
  },
]

const estadoColor = (estado: string) => {
  if (estado === 'activo') return 'bg-green-100 text-green-800'
  if (estado === 'alerta') return 'bg-yellow-100 text-yellow-800'
  if (estado === 'desconectado') return 'bg-red-100 text-red-800'
  return 'bg-gray-100 text-gray-800'
}
</script>
