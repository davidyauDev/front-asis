<template>
  <div v-if="showModel" class="fixed inset-0 z-50 flex items-center justify-center">
    <div
      class="absolute inset-0 bg-black/50"
      aria-hidden="true"
      @click="close"
    ></div>

    <div
      class="relative mx-4 w-full max-w-lg rounded-lg bg-white p-5 shadow-lg dark:bg-gray-950"
      role="dialog"
      aria-modal="true"
    >
      <div
        v-if="loading"
        class="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-lg bg-white/80 backdrop-blur-sm dark:bg-gray-950/80"
      >
        <div class="relative">
          <div class="h-16 w-16 rounded-full border-4 border-blue-200 dark:border-blue-900"></div>
          <div class="absolute top-0 h-16 w-16 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
        </div>
        <p class="mt-4 text-sm font-medium text-gray-700 dark:text-gray-300">Registrando...</p>
        <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">Por favor espere</p>
      </div>

      <header class="mb-4 flex items-center justify-between">
        <h3 class="text-lg font-medium text-gray-900 dark:text-gray-50">Validar asistencia</h3>
        <button
          class="text-gray-500 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:text-gray-300"
          :disabled="loading"
          @click="close"
        >
          X
        </button>
      </header>

      <section class="space-y-4">
        <div
          v-if="targetName"
          class="rounded-md border border-gray-200/60 bg-gray-50 px-3 py-2 text-sm text-gray-700 dark:border-gray-800/60 dark:bg-gray-900/60 dark:text-gray-200"
        >
          {{ targetName }}
        </div>

        <p class="text-sm text-gray-600 dark:text-gray-400">
          Seleccione el motivo de la validacion y opcionalmente agregue un comentario.
        </p>

        <div>
          <label
            v-for="opt in options"
            :key="opt.value"
            class="flex cursor-pointer items-center gap-3 rounded-md p-2 hover:bg-gray-50 dark:hover:bg-gray-900"
            :class="{ 'pointer-events-none opacity-50': loading }"
          >
            <input
              v-model="selected"
              type="radio"
              :value="opt.value"
              :disabled="loading"
              class="form-radio"
            />

            <div>
              <div class="text-sm font-medium text-gray-900 dark:text-gray-50">
                {{ opt.label }}
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400">
                {{ opt.desc }}
              </div>
            </div>
          </label>
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Comentario (opcional)
          </label>
          <textarea
            v-model="comentario"
            rows="3"
            :disabled="loading"
            class="w-full rounded-md border border-gray-200/80 bg-white p-2 text-sm text-gray-700 disabled:opacity-50 dark:border-gray-800/80 dark:bg-gray-950 dark:text-gray-300"
            placeholder="Agregar observaciones..."
          ></textarea>
        </div>

        <div class="flex justify-end gap-2">
          <button
            class="rounded-md bg-gray-100 px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-800"
            :disabled="loading"
            @click="close"
          >
            Cancelar
          </button>
          <button
            class="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm text-white transition-colors disabled:cursor-not-allowed disabled:opacity-60 hover:bg-blue-700"
            :disabled="!selected || loading"
            @click="confirm"
          >
            <span
              v-if="loading"
              class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
            ></span>
            {{ loading ? 'Registrando...' : 'Confirmar' }}
          </button>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ValidationSubmitPayload, ValidationTarget } from '~/types/seguimiento'

const props = withDefaults(
  defineProps<{
    show: boolean
    tecnico: ValidationTarget | null
    loading?: boolean
  }>(),
  {
    loading: false,
  },
)

const emit = defineEmits<{
  'update:show': [value: boolean]
  submit: [payload: ValidationSubmitPayload]
}>()

const showModel = computed({
  get: () => props.show,
  set: (value: boolean) => emit('update:show', value),
})

const selected = ref<number | null>(null)
const comentario = ref('')

const options = [
  { value: 1, label: 'Asistencia', desc: 'Registrar como asistencia' },
  { value: 2, label: 'Vacaciones', desc: 'Empleado en periodo de vacaciones' },
  { value: 3, label: 'Descanso Medico', desc: 'Incapacidad medica' },
  { value: 4, label: 'Sin Ruta', desc: 'No tenia ruta asignada' },
  { value: 5, label: 'No Marco', desc: 'No registro marcacion' },
  { value: 6, label: 'Cese', desc: 'Personal cesado' },
]

const targetName = computed(() => {
  if (!props.tecnico) {
    return ''
  }

  if ('usuario' in props.tecnico) {
    return props.tecnico.usuario.nombre_completo || ''
  }

  return props.tecnico.nombre_completo || ''
})

watch(
  () => props.show,
  (isOpen) => {
    if (!isOpen) {
      comentario.value = ''
      selected.value = null
    }
  },
)

const close = () => {
  if (props.loading) {
    return
  }

  showModel.value = false
}

const confirm = () => {
  if (!selected.value || props.loading) {
    return
  }

  emit('submit', { motivo: selected.value, comentario: comentario.value })
}
</script>

<style scoped>
.form-radio {
  width: 1rem;
  height: 1rem;
}
</style>
