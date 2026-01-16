<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center">
    <div class="absolute inset-0 bg-black/50" @click="!loading && close()" aria-hidden="true"></div>

    <div class="relative bg-white dark:bg-gray-950 rounded-lg shadow-lg w-full max-w-lg mx-4 p-5" role="dialog" aria-modal="true">
      <!-- Loading Overlay -->
      <div v-if="loading" class="absolute inset-0 bg-white/80 dark:bg-gray-950/80 rounded-lg flex flex-col items-center justify-center z-10 backdrop-blur-sm">
        <div class="relative">
          <div class="w-16 h-16 border-4 border-blue-200 dark:border-blue-900 rounded-full"></div>
          <div class="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0"></div>
        </div>
        <p class="mt-4 text-sm font-medium text-gray-700 dark:text-gray-300">Registrando...</p>
        <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">Por favor espere</p>
      </div>

      <header class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-medium text-gray-900 dark:text-gray-50">Validar asistencia</h3>
        <button @click="close" :disabled="loading" class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed">✕</button>
      </header>

      <section class="space-y-4">
        <p class="text-sm text-gray-600 dark:text-gray-400">Seleccione el motivo de la validación y opcionalmente agregue un comentario.</p>

        <div>
          <label v-for="opt in options" :key="opt.value" class="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer" :class="{ 'opacity-50 pointer-events-none': loading }">
            <input type="radio" :value="opt.value" v-model="selected" :disabled="loading" class="form-radio" />
            <div>
              <div class="text-sm font-medium text-gray-900 dark:text-gray-50">{{ opt.label }}</div>
              <div class="text-xs text-gray-500 dark:text-gray-400">{{ opt.desc }}</div>
            </div>
          </label>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Comentario (opcional)</label>
          <textarea v-model="comentario" :disabled="loading" rows="3" class="w-full rounded-md border border-gray-200/80 dark:border-gray-800/80 p-2 text-sm bg-white dark:bg-gray-950 text-gray-700 dark:text-gray-300 disabled:opacity-50" placeholder="Agregar observaciones..."></textarea>
        </div>

        <div class="flex justify-end gap-2">
          <button @click="close" :disabled="loading" class="px-4 py-2 rounded-md bg-gray-100 dark:bg-gray-800 text-sm disabled:opacity-50 disabled:cursor-not-allowed">Cancelar</button>
          <button @click="confirm" :disabled="!selected || loading" class="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center gap-2">
            <span v-if="loading" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            {{ loading ? 'Registrando...' : 'Confirmar' }}
          </button>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{ show: boolean; tecnico: any | null; loading?: boolean }>()
const emit = defineEmits(['update:show', 'submit'])

const selected = ref<number | null>(null)
const comentario = ref('')
const show = ref(props.show)
const loading = ref(props.loading || false)

const options = [
  { value: 1, label: 'Asistencia', desc: 'Registrar como asistencia' },
  { value: 2, label: 'Vacaciones', desc: 'Empleado en periodo de vacaciones' },
  { value: 3, label: 'Descanso Médico', desc: 'Incapacidad médica' },
  { value: 4, label: 'Sin Ruta', desc: 'No tenía ruta asignada' },
  { value: 5, label: 'No Marcó', desc: 'No registró marcación' },
  { value: 6, label: 'Cese', desc: 'Personal cesado' }
]

watch(() => props.show, (v) => { 
  show.value = v
  if (!v) {
    // Reset al cerrar
    setTimeout(() => {
      comentario.value = ''
      selected.value = null
    }, 300)
  }
})

watch(() => props.loading, (v) => { loading.value = v || false })

const close = () => {
  if (loading.value) return
  emit('update:show', false)
}

const confirm = () => {
  if (!selected.value || loading.value) return
  emit('submit', { motivo: selected.value, comentario: comentario.value })
}
</script>

<style scoped>
.form-radio { width: 1rem; height: 1rem; }
</style>
