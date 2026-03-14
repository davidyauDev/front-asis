<template>
  <UModal
    :open="open"
    @update:open="(v) => emit('update:open', v)"
    :ui="{ content: 'p-0' }"
  >
    <template #content>
      <div class="rounded-xl overflow-hidden border border-yellow-300 dark:border-yellow-600 bg-yellow-300 dark:bg-yellow-400">
        <!-- Header -->
        <div class="flex items-start justify-between gap-3 px-4 py-3 border-b border-yellow-400/70 dark:border-yellow-600/70">
          <div class="min-w-0 flex-1">
            <div class="text-xs text-yellow-900/80">
              <span class="font-mono font-semibold">{{ employee.emp_code }}</span>
              <span class="mx-1">·</span>
              <span class="font-semibold">{{ fullName }}</span>
              <span class="mx-1">·</span>
              <span class="font-mono">{{ year }}</span>
            </div>

            <input
              v-model="draft.title"
              type="text"
              placeholder="Título del recordatorio…"
              class="mt-2 w-full bg-transparent placeholder:text-yellow-900/60 text-yellow-950 font-semibold text-sm outline-none"
            />
          </div>

          <div class="flex items-center gap-2">
            <USelect
              v-model="month"
              :items="monthItems"
              size="xs"
              :ui="{ base: 'min-w-28 bg-yellow-200/70 dark:bg-yellow-300/70' }"
            />

            <UButton
              square
              size="xs"
              color="neutral"
              variant="soft"
              icon="i-lucide-save"
              :loading="saving"
              @click="saveNow()"
              title="Guardar"
            />

            <UButton
              square
              size="xs"
              color="neutral"
              variant="soft"
              icon="i-lucide-trash-2"
              @click="clearCurrent()"
              title="Borrar"
            />

            <UButton
              square
              size="xs"
              color="neutral"
              variant="soft"
              icon="i-lucide-x"
              @click="emit('update:open', false)"
              title="Cerrar"
            />
          </div>
        </div>

        <!-- Body -->
        <div class="px-4 py-3">
          <div class="text-xs text-yellow-900/80 mb-2">
            <span class="font-medium">Borrador:</span>
            <span class="ml-1">{{ autosaveLabel }}</span>
          </div>

          <textarea
            v-model="draft.content"
            placeholder="Escribe tu recordatorio mensual aquí…"
            class="w-full min-h-[220px] resize-none bg-transparent placeholder:text-yellow-900/60 text-yellow-950 text-sm outline-none"
          />
        </div>

        <!-- Footer (solo maqueta) -->
        <div class="flex items-center justify-between px-4 py-2 border-t border-yellow-400/70 dark:border-yellow-600/70">
          <div class="flex items-center gap-3 text-yellow-950/80">
            <button type="button" class="text-sm font-bold underline-offset-2 hover:underline" title="Negrita">
              B
            </button>
            <button type="button" class="text-sm italic underline-offset-2 hover:underline" title="Cursiva">
              I
            </button>
            <button type="button" class="text-sm underline underline-offset-2 hover:no-underline" title="Subrayado">
              U
            </button>
            <button type="button" class="text-sm line-through" title="Tachado">
              S
            </button>
          </div>

          <div class="text-[11px] text-yellow-900/70">
            {{ monthLabel }} · se guarda en este navegador
          </div>
        </div>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core'
import { computed, reactive, ref, watch } from 'vue'
import { useEmployeeMobilityReminders } from '~/composables/useEmployeeMobilityReminders'

type EmployeeLite = {
  employee_id: number
  emp_code: string
  first_name: string
  last_name: string
}

const props = defineProps<{
  open: boolean
  employee: EmployeeLite
  year: number
  initialMonth?: number
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
}>()

const { get, upsert, remove } = useEmployeeMobilityReminders()

const monthItems = [
  { label: 'Enero', value: 1 },
  { label: 'Febrero', value: 2 },
  { label: 'Marzo', value: 3 },
  { label: 'Abril', value: 4 },
  { label: 'Mayo', value: 5 },
  { label: 'Junio', value: 6 },
  { label: 'Julio', value: 7 },
  { label: 'Agosto', value: 8 },
  { label: 'Septiembre', value: 9 },
  { label: 'Octubre', value: 10 },
  { label: 'Noviembre', value: 11 },
  { label: 'Diciembre', value: 12 },
]

const month = ref<number>(props.initialMonth ?? new Date().getMonth() + 1)

const fullName = computed(() => `${props.employee.first_name ?? ''} ${props.employee.last_name ?? ''}`.trim())
const monthLabel = computed(() => monthItems.find((m) => m.value === month.value)?.label ?? 'Mes')

const draft = reactive({
  title: '',
  content: '',
})

const saving = ref(false)
const autosaveState = ref<'idle' | 'saving' | 'saved'>('idle')

const autosaveLabel = computed(() => {
  if (autosaveState.value === 'saving') return 'guardando…'
  if (autosaveState.value === 'saved') return 'guardado'
  return 'sin cambios'
})

const load = () => {
  const existing = get(props.employee.employee_id, props.year, month.value)
  draft.title = existing?.title ?? ''
  draft.content = existing?.content ?? ''
  autosaveState.value = 'idle'
}

watch(
  () => [props.open, props.employee.employee_id, props.year] as const,
  ([isOpen]) => {
    if (!isOpen) return
    if (props.initialMonth) month.value = props.initialMonth
    load()
  }
)

watch(month, () => {
  if (!props.open) return
  load()
})

const debouncedAutosave = useDebounceFn(() => {
  if (!props.open) return
  autosaveState.value = 'saving'
  upsert(props.employee.employee_id, props.year, month.value, {
    title: draft.title,
    content: draft.content,
  })
  autosaveState.value = 'saved'
}, 600)

watch(
  () => [draft.title, draft.content] as const,
  () => {
    if (!props.open) return
    debouncedAutosave()
  }
)

const saveNow = async () => {
  saving.value = true
  try {
    upsert(props.employee.employee_id, props.year, month.value, {
      title: draft.title,
      content: draft.content,
    })
    autosaveState.value = 'saved'
  } finally {
    saving.value = false
  }
}

const clearCurrent = () => {
  remove(props.employee.employee_id, props.year, month.value)
  draft.title = ''
  draft.content = ''
  autosaveState.value = 'idle'
}
</script>
