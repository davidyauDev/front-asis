<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center">
    <div class="absolute inset-0 bg-black/50" @click="close" aria-hidden="true"></div>

    <div class="relative bg-white dark:bg-gray-950 rounded-lg shadow-lg w-full max-w-lg mx-4 p-5" role="dialog" aria-modal="true">
      <header class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-medium text-gray-900 dark:text-gray-50">Validar asistencia</h3>
        <button @click="close" class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">✕</button>
      </header>

      <section class="space-y-4">
        <p class="text-sm text-gray-600 dark:text-gray-400">Seleccione el motivo de la validación y opcionalmente agregue un comentario.</p>

        <div>
          <label v-for="opt in options" :key="opt.value" class="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer">
            <input type="radio" :value="opt.value" v-model="selected" class="form-radio" />
            <div>
              <div class="text-sm font-medium text-gray-900 dark:text-gray-50">{{ opt.label }}</div>
              <div class="text-xs text-gray-500 dark:text-gray-400">{{ opt.desc }}</div>
            </div>
          </label>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Comentario (opcional)</label>
          <textarea v-model="comentario" rows="3" class="w-full rounded-md border border-gray-200/80 dark:border-gray-800/80 p-2 text-sm bg-white dark:bg-gray-950 text-gray-700 dark:text-gray-300" placeholder="Agregar observaciones..."></textarea>
        </div>

        <div class="flex justify-end gap-2">
          <button @click="close" class="px-4 py-2 rounded-md bg-gray-100 dark:bg-gray-800 text-sm">Cancelar</button>
          <button @click="confirm" :disabled="!selected" class="px-4 py-2 rounded-md bg-blue-600 text-white text-sm disabled:opacity-60">Confirmar</button>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{ show: boolean; tecnico: any | null }>()
const emit = defineEmits(['update:show', 'submit'])

const selected = ref<number | null>(null)
const comentario = ref('')
const show = ref(props.show)

const options = [
  { value: 1, label: 'Asistencia', desc: 'Registrar como asistencia' },
  { value: 2, label: 'Vacaciones', desc: 'Empleado en periodo de vacaciones' },
  { value: 3, label: 'Descanso Médico', desc: 'Incapacidad médica' },
  { value: 4, label: 'Sin Ruta', desc: 'No tenía ruta asignada' },
  { value: 5, label: 'No Marcó', desc: 'No registró marcación' },
  { value: 6, label: 'Cese', desc: 'Personal cesado' }
]

watch(() => props.show, (v) => { show.value = v })

const close = () => {
  emit('update:show', false)
}

const confirm = () => {
  if (!selected.value) return
  emit('submit', { motivo: selected.value, comentario: comentario.value })
  emit('update:show', false)
  comentario.value = ''
  selected.value = null
}
</script>

<style scoped>
.form-radio { width: 1rem; height: 1rem; }
</style>
