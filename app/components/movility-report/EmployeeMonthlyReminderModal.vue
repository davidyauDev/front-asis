<template>
  <UModal
    :open="open"
    @update:open="(v) => emit('update:open', v)"
    :ui="{ content: 'p-0' }"
  >
    <template #content>
      <div class="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        <!-- Header -->
        <div class="flex items-start justify-between gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-900/40">
          <div class="min-w-0 flex-1">
            <div class="text-xs text-gray-600 dark:text-gray-300">
              <span class="font-mono font-semibold">{{ employee.emp_code }}</span>
              <span class="mx-1">·</span>
              <span class="font-semibold">{{ fullName }}</span>
              <span class="mx-1">·</span>
              <span class="font-mono">{{ year }}</span>
            </div>

            <div class="mt-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
              Comentario mensual
            </div>
          </div>

          <div class="flex items-center gap-2">
            <USelect
              v-model="month"
              :items="monthItems"
              size="xs"
              :ui="{ base: 'min-w-28 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800' }"
            />

            <UButton
              square
              size="xs"
              color="neutral"
              variant="soft"
              icon="i-lucide-save"
              :loading="saving"
              @click="saveNow({ close: true })"
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
          <div class="text-xs text-gray-600 dark:text-gray-300 mb-2">
            <span class="font-medium">Borrador:</span>
            <span class="ml-1">{{ autosaveLabel }}</span>
            <span v-if="loading" class="ml-2 text-[11px] text-gray-500 dark:text-gray-400">cargando…</span>
          </div>

          <textarea
            v-model="draft.content"
            placeholder="Escribe tu recordatorio mensual aquí…"
            ref="contentRef"
            class="w-full min-h-[220px] resize-none bg-transparent placeholder:text-gray-400 dark:placeholder:text-gray-500 text-gray-900 dark:text-gray-100 text-sm outline-none"
          />
        </div>

        <!-- Footer (formato rápido) -->
        <div class="flex items-center justify-between px-4 py-2 border-t border-gray-200 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-900/40">
          <div class="flex items-center gap-3 text-gray-800 dark:text-gray-200">
            <button type="button" class="text-sm font-bold underline-offset-2 hover:underline" title="Negrita" @click="toggleBold()">
              B
            </button>
            <button type="button" class="text-sm italic underline-offset-2 hover:underline" title="Cursiva" @click="toggleItalic()">
              I
            </button>
            <button type="button" class="text-sm underline underline-offset-2 hover:no-underline" title="Subrayado" @click="toggleUnderline()">
              U
            </button>
            <button type="button" class="text-sm line-through" title="Tachado" @click="toggleStrike()">
              S
            </button>
          </div>

          <div class="text-[11px] text-gray-500 dark:text-gray-400">
            {{ monthLabel }} · se guarda en el servidor
          </div>
        </div>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core'
import { computed, nextTick, reactive, ref, watch } from 'vue'
import { getApiErrorMessage } from '~/services/employeeMobility'
import { getEmployeeMobilityMonthlyComment, upsertEmployeeMobilityMonthlyComment } from '~/services/employeeMobility'

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
  initialComment?: string | null
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'saved', payload: { employee_id: number; period_month: string; monthly_comment: string | null }): void
}>()

const toast = useToast()

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
const periodMonth = computed(() => `${props.year}-${String(month.value).padStart(2, '0')}-01`)
const periodLabel = computed(() => `${monthLabel.value} ${props.year}`)

const draft = reactive({
  content: '',
})

const contentRef = ref<HTMLTextAreaElement | null>(null)
const suppressAutosave = ref(false)
const loading = ref(false)

const saving = ref(false)
const autosaveState = ref<'idle' | 'saving' | 'saved'>('idle')

const autosaveLabel = computed(() => {
  if (autosaveState.value === 'saving') return 'guardando…'
  if (autosaveState.value === 'saved') return 'guardado'
  return 'sin cambios'
})

const load = async () => {
  suppressAutosave.value = true
  loading.value = true
  try {
    const res = await getEmployeeMobilityMonthlyComment({
      employee_id: props.employee.employee_id,
      period_month: periodMonth.value,
    })
    const comment = (res as any)?.data?.monthly_comment ?? (res as any)?.monthly_comment ?? ''
    draft.content = String(comment ?? '')
    autosaveState.value = 'idle'
  } catch (e) {
    const status = e && typeof e === 'object' && 'status' in e ? Number((e as any).status) : null
    if (status === 404) {
      if (props.initialMonth && month.value === props.initialMonth) {
        draft.content = String(props.initialComment ?? draft.content ?? '')
      } else {
        draft.content = ''
      }
      autosaveState.value = 'idle'
    } else {
      toast.add({
        title: 'Error',
        description: getApiErrorMessage(e),
        icon: 'i-lucide-alert-triangle',
        color: 'error',
      })
    }
  } finally {
    loading.value = false
    nextTick(() => {
      suppressAutosave.value = false
    })
  }
}

watch(
  () => [props.open, props.employee.employee_id, props.year] as const,
  ([isOpen]) => {
    if (!isOpen) return

    const targetMonth = props.initialMonth ?? month.value
    const monthChanged = month.value !== targetMonth

    if (props.initialMonth) month.value = targetMonth

    if (props.initialMonth && targetMonth === props.initialMonth) {
      draft.content = String(props.initialComment ?? '')
      autosaveState.value = 'idle'
    }

    // Si cambiamos el mes aquÃ­, el watch(month) harÃ¡ el load.
    if (monthChanged) return

    load()
  },
  { immediate: true }
)

watch(month, () => {
  if (!props.open) return
  load()
})

const debouncedAutosave = useDebounceFn(() => {
  if (!props.open) return
  if (saving.value) return
  if (suppressAutosave.value) return
  autosaveState.value = 'saving'
  const payload = {
    employee_id: props.employee.employee_id,
    period_month: periodMonth.value,
    monthly_comment: draft.content.trim() ? draft.content : null,
  }
  upsertEmployeeMobilityMonthlyComment({
    employee_id: payload.employee_id,
    period_month: payload.period_month,
    monthly_comment: payload.monthly_comment,
  })
    .then(() => {
      autosaveState.value = 'saved'
      emit('saved', payload)
    })
    .catch((e) => {
      autosaveState.value = 'idle'
      if (saving.value) return
      toast.add({
        title: 'No se pudo guardar',
        description: getApiErrorMessage(e),
        icon: 'i-lucide-alert-triangle',
        color: 'error',
      })
    })
}, 600)

watch(
  () => [draft.content] as const,
  () => {
    if (!props.open) return
    if (suppressAutosave.value) return
    debouncedAutosave()
  }
)

const saveNow = async (opts?: { close?: boolean; title?: string }) => {
  if (saving.value) return
  debouncedAutosave.cancel?.()
  saving.value = true
  try {
    const payload = {
      employee_id: props.employee.employee_id,
      period_month: periodMonth.value,
      monthly_comment: draft.content.trim() ? draft.content : null,
    }
    const res = await upsertEmployeeMobilityMonthlyComment({
      employee_id: payload.employee_id,
      period_month: payload.period_month,
      monthly_comment: payload.monthly_comment,
    })
    autosaveState.value = 'saved'

    const apiMessage =
      (res as any)?.message ?? (res as any)?.data?.message ?? null

    toast.add({
      title: opts?.title ?? 'Comentario guardado',
      description: apiMessage ? `${apiMessage} (${periodLabel.value})` : periodLabel.value,
      icon: 'i-lucide-check-circle',
      color: 'success',
    })

    emit('saved', payload)

    if (opts?.close) emit('update:open', false)
  } catch (e) {
    autosaveState.value = 'idle'
    toast.add({
      title: 'No se pudo guardar',
      description: getApiErrorMessage(e),
      icon: 'i-lucide-alert-triangle',
      color: 'error',
    })
  } finally {
    saving.value = false
  }
}

const clearCurrent = () => {
  debouncedAutosave.cancel?.()
  suppressAutosave.value = true
  draft.content = ''
  autosaveState.value = 'idle'
  nextTick(() => {
    suppressAutosave.value = false
  })
  saveNow({ title: 'Comentario borrado' })
}

const toggleWrap = (before: string, after = before) => {
  const el = contentRef.value
  if (!el) return

  const value = draft.content ?? ''
  const start = el.selectionStart ?? 0
  const end = el.selectionEnd ?? 0
  const selected = value.slice(start, end)

  const left = value.slice(Math.max(0, start - before.length), start)
  const right = value.slice(end, end + after.length)
  const hasWrap = left === before && right === after

  if (hasWrap) {
    const newStart = Math.max(0, start - before.length)
    const newEnd = Math.max(newStart, end - before.length)
    draft.content = value.slice(0, newStart) + selected + value.slice(end + after.length)
    nextTick(() => {
      el.focus()
      el.setSelectionRange(newStart, newEnd)
    })
    return
  }

  draft.content = value.slice(0, start) + before + selected + after + value.slice(end)
  nextTick(() => {
    el.focus()
    if (start === end) {
      const pos = start + before.length
      el.setSelectionRange(pos, pos)
    } else {
      el.setSelectionRange(start + before.length, end + before.length)
    }
  })
}

const toggleBold = () => toggleWrap('**')
const toggleItalic = () => toggleWrap('*')
const toggleUnderline = () => toggleWrap('<u>', '</u>')
const toggleStrike = () => toggleWrap('~~')
</script>
