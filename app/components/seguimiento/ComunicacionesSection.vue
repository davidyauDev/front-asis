<template>
  <div>
    <h2 class="text-lg font-semibold mb-3">Registro de Comunicaciones</h2>
    <table class="w-full border rounded text-sm">
      <thead class="bg-gray-100">
        <tr>
          <th class="p-2">Destinatario</th>
          <th class="p-2">Tipo</th>
          <th class="p-2">Motivo</th>
          <th class="p-2">Estado</th>
          <th class="p-2">Tiempo</th>
          <th class="p-2">Motivo de fallo</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="com in comunicacionesMock" :key="com.id">
          <td class="p-2">{{ com.destinatario }}</td>
          <td class="p-2">{{ com.tipo }}</td>
          <td class="p-2">{{ com.motivo }}</td>
          <td class="p-2">
            <span :class="['px-2 py-1 rounded text-xs font-semibold', estadoColor(com.estado)]">
              {{ com.estadoLabel }}
            </span>
          </td>
          <td class="p-2">{{ com.tiempo }}</td>
          <td class="p-2">{{ com.motivoFallo || '-' }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
// Mock de comunicaciones
const comunicacionesMock = [
  {
    id: 1,
    destinatario: 'Ana Torres',
    tipo: 'Alerta',
    motivo: 'Sin marcaje',
    estado: 'enviado',
    estadoLabel: 'Enviado',
    tiempo: 'hace 1h',
    motivoFallo: '',
  },
  {
    id: 2,
    destinatario: 'Luis Gómez',
    tipo: 'Recordatorio',
    motivo: 'Desconectado',
    estado: 'fallido',
    estadoLabel: 'Fallido',
    tiempo: 'hace 2h',
    motivoFallo: 'Sin conexión',
  },
  {
    id: 3,
    destinatario: 'Juan Pérez',
    tipo: 'Reporte',
    motivo: 'Marcaje tardío',
    estado: 'enviado',
    estadoLabel: 'Enviado',
    tiempo: 'hace 20min',
    motivoFallo: '',
  },
]

const estadoColor = (estado: string) => {
  if (estado === 'enviado') return 'bg-green-100 text-green-800'
  if (estado === 'fallido') return 'bg-red-100 text-red-800'
  return 'bg-gray-100 text-gray-800'
}
</script>
