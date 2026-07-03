<script setup lang="ts">
type DevelopmentPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'

type DevelopmentRequestDraft = {
  title: string
  areaId: number | null
  description: string
  impact: string
  priority: DevelopmentPriority
  attachment: File | null
}

const open = defineModel<boolean>('open', { default: false })

const props = withDefaults(defineProps<{
  submitting?: boolean
}>(), {
  submitting: false,
})

const emit = defineEmits<{
  (event: 'submit', payload: DevelopmentRequestDraft): void
}>()

const priorityOptions: Array<{
  value: DevelopmentPriority
  label: string
  tone: string
}> = [
  { value: 'LOW', label: 'Baja', tone: 'bg-emerald-500 text-white' },
  { value: 'MEDIUM', label: 'Media', tone: 'bg-amber-500 text-white' },
  { value: 'HIGH', label: 'Alta', tone: 'bg-orange-500 text-white' },
  { value: 'URGENT', label: 'Urgente', tone: 'bg-rose-500 text-white' },
]

const fileInput = ref<HTMLInputElement | null>(null)
const localError = ref('')

const form = reactive<DevelopmentRequestDraft>({
  title: '',
  areaId: 11,
  description: '',
  impact: '',
  priority: 'MEDIUM',
  attachment: null,
})

const canSubmit = computed(() =>
  form.title.trim().length > 0
    && Number.isFinite(Number(form.areaId))
    && form.description.trim().length > 0
    && form.priority.length > 0,
)

const attachmentLabel = computed(() => form.attachment?.name || 'PDF · 4MB máx.')

const resetForm = () => {
  form.title = ''
  form.areaId = 11
  form.description = ''
  form.impact = ''
  form.priority = 'MEDIUM'
  form.attachment = null
  localError.value = ''

  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

watch(open, (isOpen) => {
  if (!isOpen) {
    resetForm()
  }
})

const pickFile = () => {
  fileInput.value?.click()
}

const onFileChange = (event: Event) => {
  localError.value = ''

  const target = event.target as HTMLInputElement
  const file = target.files?.[0] ?? null

  if (!file) {
    form.attachment = null
    return
  }

  if (file.type && file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
    localError.value = 'El archivo debe ser PDF.'
    target.value = ''
    form.attachment = null
    return
  }

  const maxSize = 4 * 1024 * 1024
  if (file.size > maxSize) {
    localError.value = 'El archivo no puede superar 4 MB.'
    target.value = ''
    form.attachment = null
    return
  }

  form.attachment = file
}

const submit = () => {
  localError.value = ''

  if (!canSubmit.value) {
    localError.value = 'Completa el título, área y descripción para continuar.'
    return
  }

  if (form.areaId === null || !Number.isFinite(Number(form.areaId))) {
    localError.value = 'Selecciona un área válida.'
    return
  }

  emit('submit', {
    title: form.title.trim(),
    areaId: Number(form.areaId),
    description: form.description.trim(),
    impact: form.impact.trim(),
    priority: form.priority,
    attachment: form.attachment,
  })
}

const closeModal = () => {
  open.value = false
}
</script>

<template>
  <UModal
    v-model:open="open"
    :ui="{ content: 'max-w-4xl w-[min(94vw,920px)]' }"
  >
    <template #content>
      <div class="overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div class="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
          <div class="flex items-start gap-3">
            <div class="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-[#eef3ff] text-[#2850aa]">
              <UIcon name="i-lucide-code-2" class="size-5" />
            </div>

            <div>
              <h3 class="text-[22px] font-bold tracking-[-0.04em] text-slate-900">
                Crear Nuevo Requerimiento
              </h3>
              <p class="text-sm text-slate-500">
                Completa el formulario para crear un nuevo requerimiento de desarrollo.
              </p>
            </div>
          </div>

          <UButton
            color="neutral"
            variant="ghost"
            icon="i-lucide-x"
            class="rounded-full"
            :disabled="props.submitting"
            @click="closeModal"
          />
        </div>

        <div class="p-5">
          <div class="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
            <div class="mb-4 flex items-start justify-between gap-3">
              <div>
                <p class="text-base font-medium text-slate-900">
                  Información del requerimiento
                </p>
                <p class="text-sm text-slate-500">
                  Título, área, descripción e impacto esperado.
                </p>
              </div>

              <UBadge color="neutral" variant="soft" class="rounded-full bg-slate-600 px-3 py-1 text-white">
                Requerido
              </UBadge>
            </div>

            <div class="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
              <div class="space-y-4">
                <UFormField label="Título *" name="title">
                  <UInput
                    v-model="form.title"
                    placeholder="Ej: Módulo de reportes avanzados"
                    size="lg"
                    class="w-full"
                    :disabled="props.submitting"
                  />
                </UFormField>

                <div class="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                  <div class="flex items-center justify-between gap-3">
                    <div>
                      <p class="text-sm font-medium text-slate-900">
                        Área solicitante
                      </p>
                      <p class="text-xs text-slate-500">
                        Envío fijo a RRHH
                      </p>
                    </div>

                    <UBadge color="neutral" variant="soft" class="rounded-full bg-slate-600 px-3 py-1 text-white">
                      RRHH
                    </UBadge>
                  </div>
                  <input type="hidden" :value="form.areaId ?? 11">
                </div>

                <UFormField label="Descripción detallada *" name="description">
                  <UTextarea
                    v-model="form.description"
                    placeholder="Describe la funcionalidad requerida con el mayor detalle posible..."
                    :rows="6"
                    class="w-full"
                    :disabled="props.submitting"
                  />
                </UFormField>

                <UFormField label="Impacto esperado" name="impact">
                  <UTextarea
                    v-model="form.impact"
                    placeholder="¿Qué beneficio traerá? ¿Qué problema resuelve?"
                    :rows="5"
                    class="w-full"
                    :disabled="props.submitting"
                  />
                </UFormField>
              </div>

              <div class="space-y-4">
                <UFormField label="Prioridad *" name="priority">
                  <div class="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                    <div class="grid gap-2">
                      <button
                        v-for="option in priorityOptions"
                        :key="option.value"
                        type="button"
                        class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-semibold transition"
                        :class="form.priority === option.value ? 'bg-[#2d5fc0] text-white shadow-sm' : 'bg-transparent text-slate-700 hover:bg-slate-100'"
                        :disabled="props.submitting"
                        @click="form.priority = option.value"
                      >
                        <span
                          class="inline-flex size-5 items-center justify-center rounded-full text-[11px] font-bold"
                          :class="option.tone"
                        >
                          <UIcon
                            :name="option.value === 'LOW' ? 'i-lucide-arrow-down' : option.value === 'MEDIUM' ? 'i-lucide-minus' : option.value === 'HIGH' ? 'i-lucide-arrow-up' : 'i-lucide-flame'"
                            class="size-3.5"
                          />
                        </span>
                        <span>{{ option.label }}</span>
                      </button>
                    </div>
                  </div>
                </UFormField>

                <div class="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-4">
                  <div class="flex min-h-[180px] flex-col items-center justify-center text-center">
                    <div class="flex size-12 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm">
                      <UIcon name="i-lucide-upload" class="size-5" />
                    </div>

                    <p class="mt-4 text-sm font-medium text-slate-800">
                      Adjuntar archivo relacionado (opcional)
                    </p>
                    <p class="mt-1 text-xs text-slate-500">
                      {{ attachmentLabel }}
                    </p>

                    <input
                      ref="fileInput"
                      type="file"
                      class="hidden"
                      accept=".pdf,application/pdf"
                      @change="onFileChange"
                    >

                    <UButton
                      color="neutral"
                      variant="outline"
                      class="mt-4 rounded-lg"
                      :disabled="props.submitting"
                      @click="pickFile"
                    >
                      Seleccionar archivo
                    </UButton>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            v-if="localError"
            class="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {{ localError }}
          </div>
        </div>

        <div class="flex items-center justify-end border-t border-slate-200 px-5 py-4">
          <UButton
            color="primary"
            icon="i-lucide-rocket"
            :disabled="!canSubmit || props.submitting"
            :loading="props.submitting"
            class="rounded-lg bg-[#2d5fc0] px-4 font-semibold shadow-sm disabled:bg-[#9cb7f5]"
            @click="submit"
          >
            Crear Requerimiento
          </UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>
