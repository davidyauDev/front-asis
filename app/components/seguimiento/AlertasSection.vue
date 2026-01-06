<template>
  <div>
    <h2 class="text-lg font-semibold mb-3">Alertas del Sistema</h2>
    <table class="w-full border rounded text-sm">
      <thead class="bg-gray-100">
        <tr>
          <th class="p-2">Técnico</th>
          <th class="p-2">Tipo</th>
          <th class="p-2">Descripción</th>
          <th class="p-2">Tiempo</th>
          <th class="p-2">Ruta</th>
          <th class="p-2">Severidad</th>
          <th class="p-2">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="alerta in alertasMock" :key="alerta.id">
          <td class="p-2">{{ alerta.tecnico }}</td>
          <td class="p-2">{{ alerta.tipo }}</td>
          <td class="p-2">{{ alerta.descripcion }}</td>
          <td class="p-2">{{ alerta.tiempo }}</td>
          <td class="p-2">{{ alerta.ruta }}</td>
          <td class="p-2">
            <span :class="['px-2 py-1 rounded text-xs font-semibold', severidadColor(alerta.severidad)]">
              {{ alerta.severidadLabel }}
            </span>
          </td>
          <td class="p-2">
            <button class="text-blue-600 hover:underline mr-2">Contactar</button>
            <button class="text-orange-600 hover:underline mr-2">Notificar</button>
            <button class="text-red-600 hover:underline">Registrar Incidencia</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
// Mock de alertas
const alertasMock = [
  {
    id: 1,
    tecnico: 'Ana Torres',
    tipo: 'Sin marcaje',
    descripcion: 'No ha marcado asistencia en el periodo esperado',
    tiempo: 'hace 1h',
    ruta: 'Ruta 2',
    severidad: 'crítica',
    severidadLabel: 'Crítica',
  },
  {
    id: 2,
    tecnico: 'Luis Gómez',
    tipo: 'Desconectado',
    descripcion: 'Técnico desconectado por más de 3 horas',
    tiempo: 'hace 3h',
    ruta: 'Ruta 3',
    severidad: 'advertencia',
    severidadLabel: 'Advertencia',
  },
  {
    id: 3,
    tecnico: 'Juan Pérez',
    tipo: 'Marcaje tardío',
    descripcion: 'Marcaje realizado fuera de horario',
    tiempo: 'hace 20min',
    ruta: 'Ruta 1',
    severidad: 'informativa',
    severidadLabel: 'Informativa',
  },
]

const severidadColor = (sev: string) => {
  if (sev === 'crítica') return 'bg-red-100 text-red-800'
  if (sev === 'advertencia') return 'bg-yellow-100 text-yellow-800'
  if (sev === 'informativa') return 'bg-blue-100 text-blue-800'
  return 'bg-gray-100 text-gray-800'
}
</script>
