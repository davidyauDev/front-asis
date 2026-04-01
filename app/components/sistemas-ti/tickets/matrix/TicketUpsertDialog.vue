<script setup lang="ts">
import type {
  CreateSystemTicketPayload,
  SystemTicket,
  SystemTicketCategory,
  SystemTicketImpact,
  SystemTicketPriority,
  SystemTicketType,
  SystemTicketUrgency,
} from '~/services/sistemas-ti/tickets'

interface Props {
  ticket?: SystemTicket | null
  saving?: boolean
  priorityOptions: Array<{ label: string, value: SystemTicketPriority }>
  typeOptions: Array<{ label: string, value: SystemTicketType }>
  categoryOptions: Array<{ label: string, value: SystemTicketCategory }>
  impactOptions: Array<{ label: string, value: SystemTicketImpact }>
  urgencyOptions: Array<{ label: string, value: SystemTicketUrgency }>
}

const props = withDefaults(defineProps<Props>(), {
  ticket: null,
  saving: false,
})

const open = defineModel<boolean>('open', { default: false })

const emit = defineEmits<{
  (e: 'save', payload: CreateSystemTicketPayload): void
}>()

const DEFAULT_REQUESTER = 'Usuario final'
const DEFAULT_AREA = 'Sistemas TI'

const form = reactive<CreateSystemTicketPayload>({
  title: '',
  description: '',
  requester: DEFAULT_REQUESTER,
  area: DEFAULT_AREA,
  category: 'SOFTWARE',
  type: 'INCIDENT',
  impact: 'MEDIUM',
  urgency: 'MEDIUM',
  priority: 'MEDIUM',
  images: [],
})

const typeVisualMap: Record<SystemTicketType, { helper: string, icon: string, color: string, bg: string }> = {
  INCIDENT: {
    helper: 'Incidentes, fallas o errores en servicios.',
    icon: 'i-lucide-triangle-alert',
    color: 'text-red-600',
    bg: 'bg-red-500/10',
  },
  SERVICE_REQUEST: {
    helper: 'Accesos, instalaciones o nuevos recursos.',
    icon: 'i-lucide-life-buoy',
    color: 'text-blue-600',
    bg: 'bg-blue-500/10',
  },
}

const impactVisualMap: Record<SystemTicketImpact, { description: string, icon: string }> = {
  LOW: {
    description: 'Afecta a una sola persona.',
    icon: 'i-lucide-user',
  },
  MEDIUM: {
    description: 'Impacta en un equipo o area pequena.',
    icon: 'i-lucide-users',
  },
  HIGH: {
    description: 'Impacto amplio en el area o empresa.',
    icon: 'i-lucide-building-2',
  },
}

const urgencyVisualMap: Record<SystemTicketUrgency, { description: string, icon: string }> = {
  LOW: {
    description: 'Puede resolverse sin urgencia inmediata.',
    icon: 'i-lucide-clock-3',
  },
  MEDIUM: {
    description: 'Necesito una solucion en el dia.',
    icon: 'i-lucide-calendar-check-2',
  },
  HIGH: {
    description: 'Trabajo detenido o bloqueo critico.',
    icon: 'i-lucide-triangle-alert',
  },
}

const categoryVisualMap: Record<SystemTicketCategory, { icon: string }> = {
  SOFTWARE: { icon: 'i-lucide-laptop' },
  ACCESS: { icon: 'i-lucide-key-round' },
  EQUIPMENT: { icon: 'i-lucide-monitor-smartphone' },
}

const priorityLabelMap: Record<SystemTicketPriority, string> = {
  LOW: 'Baja',
  MEDIUM: 'Media',
  HIGH: 'Alta',
  URGENT: 'Critica',
}

const typeVisualOptions = computed(() => {
  return props.typeOptions.map(option => ({
    ...option,
    ...typeVisualMap[option.value],
  }))
})

const impactVisualOptions = computed(() => {
  return props.impactOptions.map(option => ({
    ...option,
    ...impactVisualMap[option.value],
  }))
})

const urgencyVisualOptions = computed(() => {
  return props.urgencyOptions.map(option => ({
    ...option,
    ...urgencyVisualMap[option.value],
  }))
})

const categoryVisualOptions = computed(() => {
  return props.categoryOptions.map(option => ({
    ...option,
    ...categoryVisualMap[option.value],
  }))
})

const resetForm = () => {
  form.title = ''
  form.description = ''
  form.requester = DEFAULT_REQUESTER
  form.area = DEFAULT_AREA
  form.category = 'SOFTWARE'
  form.type = 'INCIDENT'
  form.impact = 'MEDIUM'
  form.urgency = 'MEDIUM'
  form.priority = 'MEDIUM'
  form.images = []
}

const fillFromTicket = (ticket: SystemTicket) => {
  form.title = ticket.title
  form.description = ticket.description
  form.requester = ticket.requester
  form.area = ticket.area
  form.category = ticket.category
  form.type = ticket.type
  form.impact = ticket.impact
  form.urgency = ticket.urgency
  form.priority = ticket.priority
  form.images = [...ticket.images]
}

watch(
  () => [open.value, props.ticket] as const,
  ([isOpen, ticket]) => {
    if (!isOpen) {
      return
    }

    if (ticket) {
      fillFromTicket(ticket)
      return
    }

    resetForm()
  },
  { immediate: true },
)

const derivePriority = (
  impact: SystemTicketImpact,
  urgency: SystemTicketUrgency,
): SystemTicketPriority => {
  if (impact === 'HIGH' && urgency === 'HIGH') {
    return 'URGENT'
  }

  if (
    (impact === 'HIGH' && urgency === 'MEDIUM')
    || (impact === 'MEDIUM' && urgency === 'HIGH')
  ) {
    return 'HIGH'
  }

  if (impact === 'LOW' && urgency === 'LOW') {
    return 'LOW'
  }

  return 'MEDIUM'
}

watch(
  () => [form.impact, form.urgency] as const,
  ([impact, urgency]) => {
    form.priority = derivePriority(impact, urgency)
  },
  { immediate: true },
)

const isEditMode = computed(() => !!props.ticket)
const priorityLabel = computed(() => priorityLabelMap[form.priority])

const isValid = computed(() => {
  const required = [form.title, form.description].every(value => value.trim().length > 0)
  if (!required) {
    return false
  }

  if (form.type === 'SERVICE_REQUEST' && !form.category) {
    return false
  }

  return true
})

const submit = () => {
  if (!isValid.value) {
    return
  }

  emit('save', {
    title: form.title.trim(),
    description: form.description.trim(),
    requester: form.requester.trim(),
    area: form.area.trim(),
    category: form.category,
    type: form.type,
    impact: form.impact,
    urgency: form.urgency,
    priority: form.priority,
    images: form.images,
  })
}

const handleFiles = (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files ? Array.from(target.files) : []
  form.images = files.map(file => file.name)
}
</script>

<template>
  <UModal v-model:open="open">
    <template #content>
      <div class="mx-auto w-full sm:max-w-6xl overflow-hidden rounded-xl border border-border bg-background">
        <div class="space-y-3 border-b px-6 pb-4 pt-5">
          <div class="flex items-center gap-3">
            <div class="rounded-lg bg-primary/10 p-2">
              <UIcon name="i-lucide-tag" class="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 class="text-xl font-semibold">
                {{ isEditMode ? 'Editar ticket' : 'Nuevo ticket' }}
              </h2>
              <p class="mt-1 text-sm text-muted-foreground">
                {{ isEditMode ? 'Modifica los detalles de tu ticket.' : 'Completa el formulario para crear un nuevo ticket.' }}
              </p>
            </div>
          </div>
        </div>

        <div class="max-h-[78vh] overflow-y-auto px-6 py-4">
          <form id="ticketForm" class="space-y-6 py-1" @submit.prevent="submit">
            <UCard>
              <template #header>
                <div class="space-y-2">
                  <div class="flex items-center gap-2">
                    <UBadge color="neutral" variant="soft">
                      Paso 1
                    </UBadge>
                    <p class="text-base font-semibold">
                      Tipo de solicitud
                    </p>
                  </div>
                  <p class="text-sm text-muted-foreground">
                    Selecciona la opcion que describe mejor tu necesidad.
                  </p>
                </div>
              </template>

              <div class="grid gap-3 sm:grid-cols-2">
                <div v-for="option in typeVisualOptions" :key="option.value" class="relative cursor-pointer">
                  <input
                    :id="`type-${option.value}`"
                    v-model="form.type"
                    type="radio"
                    :value="option.value"
                    class="sr-only"
                  >
                  <label
                    :for="`type-${option.value}`"
                    class="flex h-full items-start gap-4 rounded-xl border-2 border-transparent p-4 transition-all"
                    :class="form.type === option.value
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-muted hover:border-muted-foreground/60'"
                  >
                    <div class="rounded-lg p-2" :class="option.bg">
                      <UIcon :name="option.icon" class="h-5 w-5" :class="option.color" />
                    </div>
                    <div class="space-y-1">
                      <p class="text-sm font-semibold">
                        {{ option.label }}
                      </p>
                      <p class="text-xs text-muted-foreground">
                        {{ option.helper }}
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </UCard>

            <UCard>
              <template #header>
                <div class="space-y-2">
                  <div class="flex items-center gap-2">
                    <UBadge color="neutral" variant="soft">
                      Paso 2
                    </UBadge>
                    <p class="text-base font-semibold">
                      Informacion principal
                    </p>
                  </div>
                  <p class="text-sm text-muted-foreground">
                    Completa los datos basicos del ticket.
                  </p>
                </div>
              </template>

              <div class="space-y-4">
                <div class="space-y-2">
                  <label for="ticket-title" class="text-sm font-medium">Titulo</label>
                  <UInput id="ticket-title" v-model="form.title" class="h-10" placeholder="Ej: No puedo acceder al sistema" />
                </div>

                <div class="space-y-2">
                  <label for="ticket-description" class="text-sm font-medium">Describe el detalle</label>
                  <UTextarea
                    id="ticket-description"
                    v-model="form.description"
                    :rows="3"
                    class="resize-none"
                    placeholder="Que ocurrio, cuando empezo y que intentaste hacer."
                  />
                </div>

                <div class="space-y-2">
                  <label class="text-sm font-medium">Adjuntar archivos (opcional)</label>
                  <UInput type="file" multiple accept="image/*" @change="handleFiles" />
                  <p class="text-xs text-muted-foreground">
                    Formatos sugeridos: PNG, JPG.
                  </p>
                </div>
              </div>
            </UCard>

            <UCard>
              <template #header>
                <div class="space-y-2">
                  <div class="flex items-center gap-2">
                    <UBadge color="neutral" variant="soft">
                      Paso 3
                    </UBadge>
                    <p class="text-base font-semibold">
                      Impacto y urgencia
                    </p>
                  </div>
                  <p class="text-sm text-muted-foreground">
                    Describe a quien afecta y que tan urgente es.
                  </p>
                </div>
              </template>

              <div class="grid gap-6 lg:grid-cols-2">
                <div class="space-y-3">
                  <p class="text-xs font-medium text-muted-foreground">
                    A cuantas personas afecta
                  </p>
                  <div class="grid gap-2">
                    <label
                      v-for="option in impactVisualOptions"
                      :key="option.value"
                      :for="`impact-${option.value}`"
                      class="cursor-pointer rounded-lg border-2 border-transparent p-3 transition-all"
                      :class="form.impact === option.value
                        ? 'border-primary bg-primary/5'
                        : 'border-muted hover:border-muted-foreground'"
                    >
                      <input
                        :id="`impact-${option.value}`"
                        v-model="form.impact"
                        class="sr-only"
                        type="radio"
                        :value="option.value"
                      >
                      <div class="flex items-center gap-3">
                        <div class="rounded-md bg-muted p-2">
                          <UIcon :name="option.icon" class="h-4 w-4" />
                        </div>
                        <div>
                          <p class="text-sm font-medium">
                            {{ option.label }}
                          </p>
                          <p class="text-xs text-muted-foreground">
                            {{ option.description }}
                          </p>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                <div class="space-y-3">
                  <p class="text-xs font-medium text-muted-foreground">
                    Que tan urgente es para tu trabajo
                  </p>
                  <div class="grid gap-2">
                    <label
                      v-for="option in urgencyVisualOptions"
                      :key="option.value"
                      :for="`urgency-${option.value}`"
                      class="cursor-pointer rounded-lg border-2 border-transparent p-3 transition-all"
                      :class="form.urgency === option.value
                        ? 'border-primary bg-primary/5'
                        : 'border-muted hover:border-muted-foreground'"
                    >
                      <input
                        :id="`urgency-${option.value}`"
                        v-model="form.urgency"
                        class="sr-only"
                        type="radio"
                        :value="option.value"
                      >
                      <div class="flex items-center gap-3">
                        <div class="rounded-md bg-muted p-2">
                          <UIcon :name="option.icon" class="h-4 w-4" />
                        </div>
                        <div>
                          <p class="text-sm font-medium">
                            {{ option.label }}
                          </p>
                          <p class="text-xs text-muted-foreground">
                            {{ option.description }}
                          </p>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              <div class="mt-4 rounded-lg border border-border bg-muted/40 p-3 text-xs">
                Prioridad calculada automaticamente:
                <span class="font-semibold">{{ priorityLabel }}</span>
              </div>
            </UCard>

            <UCard v-if="form.type === 'SERVICE_REQUEST'" class="border-sky-200/60 bg-sky-50/30">
              <template #header>
                <div class="flex items-center gap-2">
                  <UIcon name="i-lucide-zap" class="h-4 w-4 text-sky-600" />
                  <p class="text-base font-semibold text-sky-900 dark:text-sky-200">
                    Detalles de la solicitud
                  </p>
                </div>
              </template>

              <div>
                <p class="text-xs font-medium text-muted-foreground">
                  Tipo de solicitud
                </p>
                <div class="mt-2 grid gap-2 sm:grid-cols-3">
                  <label
                    v-for="option in categoryVisualOptions"
                    :key="option.value"
                    :for="`category-${option.value}`"
                    class="cursor-pointer rounded-lg border-2 border-transparent p-3 text-center transition-all"
                    :class="form.category === option.value
                      ? 'border-sky-500 bg-sky-100/40'
                      : 'border-muted hover:border-muted-foreground'"
                  >
                    <input
                      :id="`category-${option.value}`"
                      v-model="form.category"
                      class="sr-only"
                      type="radio"
                      :value="option.value"
                    >
                    <div class="flex flex-col items-center gap-2">
                      <UIcon :name="option.icon" class="h-5 w-5" />
                      <span class="text-sm font-medium">{{ option.label }}</span>
                    </div>
                  </label>
                </div>
              </div>
            </UCard>
          </form>
        </div>

        <div class="flex flex-col gap-3 border-t px-6 py-4 sm:flex-row sm:justify-end">
          <UButton color="neutral" variant="outline" :disabled="saving" @click="open = false">
            Cancelar
          </UButton>
          <UButton color="primary" icon="i-lucide-check-circle-2" :loading="saving" :disabled="!isValid" @click="submit">
            {{ isEditMode ? 'Guardar cambios' : 'Crear ticket' }}
          </UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>
