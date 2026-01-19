<script setup lang="ts">
const { isNotificationsSlideoverOpen } = useDashboard()

const cumpleañosHoy = ref([
  { id: 1, name: 'Juan Pérez García', email: 'juan.perez@cechriza.com', age: 30, fecha: '19/01/2026', enviado: false },
  { id: 2, name: 'María García López', email: 'maria.garcia@cechriza.com', age: 25, fecha: '22/01/2026', enviado: false },
  { id: 3, name: 'Carlos Rodríguez Martín', email: 'carlos.rodriguez@cechriza.com', age: 35, fecha: '15/01/2026', enviado: true },
  { id: 4, name: 'Ana Fernández Torres', email: 'ana.fernandez@cechriza.com', age: 28, fecha: '25/01/2026', enviado: false },
  { id: 5, name: 'Luis Sánchez Ruiz', email: 'luis.sanchez@cechriza.com', age: 42, fecha: '28/01/2026', enviado: false },
  { id: 6, name: 'Patricia Morales Díaz', email: 'patricia.morales@cechriza.com', age: 31, fecha: '10/01/2026', enviado: true },
  { id: 7, name: 'Roberto Vega Castro', email: 'roberto.vega@cechriza.com', age: 29, fecha: '30/01/2026', enviado: false },
])

const isLoading = ref(false)

const cargarCumpleañosHoy = async () => {
  try {
    isLoading.value = true
    // Aquí llamarías a tu API para obtener los cumpleaños de hoy
    // const response = await apiFetch('/api/cumpleaños/hoy')
    // cumpleañosHoy.value = response.data
  } catch (error) {
    console.error('Error al cargar cumpleaños:', error)
  } finally {
    isLoading.value = false
  }
}

const enviarCorreo = async (cumpleaños: any) => {
  try {
    // Aquí llamarías a tu API para enviar el correo
    // await apiFetch('/api/cumpleaños/enviar-correo', {
    //   method: 'POST',
    //   body: JSON.stringify({ usuario_id: cumpleaños.id })
    // })
    cumpleaños.enviado = true
    alert(`Correo enviado a ${cumpleaños.name}`)
  } catch (error) {
    console.error('Error al enviar correo:', error)
  }
}

onMounted(() => {
  cargarCumpleañosHoy()
})
</script>

<template>
  <USlideover v-model:open="isNotificationsSlideoverOpen" title="Cumpleaños del mes 🎉">
    <template #body>
      <div v-if="isLoading" class="p-4 text-center text-sm text-muted">
        Cargando cumpleaños...
      </div>

      <template v-else-if="cumpleañosHoy.length === 0">
        <div class="p-4 text-center text-sm text-muted">
          No hay cumpleaños este mes.
        </div>
      </template>

      <template v-else>
        <div v-for="persona in cumpleañosHoy" :key="persona.id"
          class="px-3 py-2.5 rounded-md hover:bg-elevated/50 flex items-center gap-3 relative -mx-3 first:-mt-3 last:-mb-3 border-b border-gray-100 dark:border-gray-800">
          
          <UAvatar :alt="persona.name" size="md" />

          <div class="text-sm flex-1">
            <p class="flex items-center justify-between mb-1">
              <span class="text-highlighted font-medium">{{ persona.name }}</span>
              <span class="text-muted text-xs font-semibold">{{ persona.fecha }}</span>
            </p>

            <p class="text-dimmed text-xs mb-1">
              {{ persona.email }} • {{ persona.age }} años 🎂
            </p>

            <button 
              v-if="!persona.enviado"
              @click="enviarCorreo(persona)"
              class="mt-1.5 px-3 py-1 text-xs bg-primary-500 hover:bg-primary-600 text-white rounded-md transition-colors"
            >
              Enviar correo de felicitación
            </button>
            
            <span 
              v-else
              class="inline-block mt-1.5 px-3 py-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-md"
            >
              ✓ Correo enviado
            </span>
          </div>
        </div>
      </template>
    </template>
  </USlideover>
</template>
