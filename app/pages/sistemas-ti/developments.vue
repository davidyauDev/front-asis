<script setup lang="ts">
import { useDevelopments } from '~/composables/sistemas-ti/useDevelopments'
import type {
  CreateDevelopmentRequestPayload,
  DevelopmentRequest,
  DevelopmentRequestStatus,
} from '~/services/sistemas-ti/developments'

definePageMeta({
  layout: 'sistemas-ti',
  middleware: 'auth',
})

useHead({
  title: 'Sistemas TI - Desarrollos',
})

const toast = useToast()

const {
  error,
  getPriorityColor,
  getPriorityLabel,
  getStatusLabel,
  groupedRequests,
  loading,
  moveToStatus,
  priorityFilter,
  priorityFilterItems,
  priorityOptions,
  refresh,
  removeRequest,
  resetFilters,
  search,
  stats,
  statusOptions,
  statusOrder,
  createRequest,
} = useDevelopments()

const createModalOpen = ref(false)
const creating = ref(false)
const updatingRequestId = ref<number | null>(null)

const statusDrafts = reactive<Record<number, DevelopmentRequestStatus>>({})

const form = reactive<CreateDevelopmentRequestPayload>({
  title: '',
  description: '',
  requester: '',
  area: '',
  priority: 'MEDIUM',
  estimatedHours: 8,
})

const columns: Record<DevelopmentRequestStatus, { title: string, tone: string }> = {
  REGISTERED: { title: 'Registrados', tone: 'border-slate-300/80 dark:border-slate-700' },
  IN_ANALYSIS: { title: 'En analisis', tone: 'border-blue-300/70 dark:border-blue-900/40' },
  APPROVED: { title: 'Aprobados', tone: 'border-indigo-300/70 dark:border-indigo-900/40' },
  IN_DEVELOPMENT: { title: 'En desarrollo', tone: 'border-violet-300/70 dark:border-violet-900/40' },
  IN_TESTING: { title: 'En QA', tone: 'border-amber-300/70 dark:border-amber-900/40' },
  COMPLETED: { title: 'Completados', tone: 'border-emerald-300/70 dark:border-emerald-900/40' },
  REJECTED: { title: 'Rechazados', tone: 'border-rose-300/70 dark:border-rose-900/40' },
}

const canCreate = computed(() => {
  return [
    form.title,
    form.description,
    form.requester,
    form.area,
  ].every(value => value.trim().length > 0) && form.estimatedHours > 0
})

const allRequests = computed(() => {
  return statusOrder.flatMap(status => groupedRequests.value[status])
})

watch(allRequests, (value) => {
  for (const request of value) {
    statusDrafts[request.id] = request.status
  }
}, { immediate: true })

const resetCreateForm = () => {
  form.title = ''
  form.description = ''
  form.requester = ''
  form.area = ''
  form.priority = 'MEDIUM'
  form.estimatedHours = 8
}

const submitCreate = async () => {
  if (!canCreate.value || creating.value) {
    return
  }

  creating.value = true

  try {
    await createRequest({
      title: form.title,
      description: form.description,
      requester: form.requester,
      area: form.area,
      priority: form.priority,
      estimatedHours: form.estimatedHours,
    })

    toast.add({
      title: 'Requerimiento creado',
      description: 'El requerimiento fue agregado al tablero.',
      color: 'success',
    })

    createModalOpen.value = false
    resetCreateForm()
  } catch (err) {
    toast.add({
      title: 'Error',
      description: err instanceof Error ? err.message : 'No se pudo crear el requerimiento.',
      color: 'error',
    })
  } finally {
    creating.value = false
  }
}

const saveStatus = async (request: DevelopmentRequest) => {
  if (updatingRequestId.value !== null) {
    return
  }

  const nextStatus = statusDrafts[request.id] ?? request.status
  if (nextStatus === request.status) {
    return
  }

  updatingRequestId.value = request.id

  try {
    await moveToStatus(request.id, nextStatus)
    toast.add({
      title: 'Estado actualizado',
      description: `${request.code} movido a ${getStatusLabel(nextStatus)}.`,
      color: 'success',
    })
  } catch (err) {
    toast.add({
      title: 'Error',
      description: err instanceof Error ? err.message : 'No se pudo mover el requerimiento.',
      color: 'error',
    })
  } finally {
    updatingRequestId.value = null
  }
}

const deleteItem = async (request: DevelopmentRequest) => {
  if (updatingRequestId.value !== null) {
    return
  }

  updatingRequestId.value = request.id

  try {
    await removeRequest(request.id)
    toast.add({
      title: 'Requerimiento eliminado',
      description: `${request.code} fue eliminado.`,
      color: 'success',
    })
  } catch (err) {
    toast.add({
      title: 'Error',
      description: err instanceof Error ? err.message : 'No se pudo eliminar el requerimiento.',
      color: 'error',
    })
  } finally {
    updatingRequestId.value = null
  }
}

onMounted(async () => {
  await refresh()
})
</script>

<template>
  <UDashboardPanel id="sistemas-ti-developments">
    <template #header>
      <AppDashboardHeader
        title="Gestion de Desarrollos TI"
        mobile-title="Desarrollos TI"
        subtitle="Kanban de requerimientos desde registro hasta produccion"
        subtitle-icon="i-lucide-git-branch"
        icon="i-lucide-code-2"
        :notification-count="stats.urgent"
        notification-tooltip="Requerimientos urgentes"
      >
        <template #right>
          <UButton color="primary" icon="i-lucide-plus" @click="createModalOpen = true">
            Nuevo requerimiento
          </UButton>
        </template>
      </AppDashboardHeader>
    </template>

    <template #body>
      <div class="space-y-5">
        <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <UCard class="border-gray-200/70 dark:border-gray-800/70">
            <p class="text-xs uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">Total</p>
            <p class="mt-2 text-2xl font-black text-gray-900 dark:text-gray-100">{{ stats.total }}</p>
          </UCard>
          <UCard class="border-gray-200/70 dark:border-gray-800/70">
            <p class="text-xs uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">Activos</p>
            <p class="mt-2 text-2xl font-black text-cyan-700 dark:text-cyan-300">{{ stats.active }}</p>
          </UCard>
          <UCard class="border-gray-200/70 dark:border-gray-800/70">
            <p class="text-xs uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">Completados</p>
            <p class="mt-2 text-2xl font-black text-emerald-700 dark:text-emerald-300">{{ stats.completed }}</p>
          </UCard>
          <UCard class="border-gray-200/70 dark:border-gray-800/70">
            <p class="text-xs uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">Rechazados</p>
            <p class="mt-2 text-2xl font-black text-rose-700 dark:text-rose-300">{{ stats.rejected }}</p>
          </UCard>
          <UCard class="border-gray-200/70 dark:border-gray-800/70">
            <p class="text-xs uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">Urgentes</p>
            <p class="mt-2 text-2xl font-black text-amber-700 dark:text-amber-300">{{ stats.urgent }}</p>
          </UCard>
        </div>

        <UCard class="border-gray-200/70 dark:border-gray-800/70">
          <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-[1.2fr_0.5fr_auto_auto]">
            <UInput
              v-model="search"
              icon="i-lucide-search"
              placeholder="Buscar por codigo, titulo, area o solicitante"
            />

            <USelect v-model="priorityFilter" :items="priorityFilterItems" placeholder="Prioridad" />

            <UButton
color="neutral"
variant="outline"
icon="i-lucide-eraser"
@click="resetFilters">
              Limpiar
            </UButton>
            <UButton
color="neutral"
variant="outline"
icon="i-lucide-refresh-cw"
:loading="loading"
@click="refresh">
              Actualizar
            </UButton>
          </div>
        </UCard>

        <UAlert
          v-if="error"
          color="error"
          variant="soft"
          icon="i-lucide-alert-triangle"
          title="No se pudo cargar el tablero de desarrollos"
          :description="error"
        />

        <div v-else-if="loading" class="grid grid-cols-1 gap-3 lg:grid-cols-3">
          <USkeleton class="h-80 rounded-xl" />
          <USkeleton class="h-80 rounded-xl" />
          <USkeleton class="h-80 rounded-xl" />
        </div>

        <div v-else class="overflow-x-auto pb-2">
          <div class="grid min-w-[1400px] grid-flow-col auto-cols-[minmax(240px,1fr)] gap-4">
            <UCard
              v-for="status in statusOrder"
              :key="status"
              class="border bg-white/80 dark:bg-gray-900/70"
              :class="columns[status].tone"
            >
              <template #header>
                <div class="flex items-center justify-between gap-2">
                  <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {{ columns[status].title }}
                  </p>
                  <UBadge color="neutral" variant="subtle" size="sm">
                    {{ groupedRequests[status].length }}
                  </UBadge>
                </div>
              </template>

              <div class="space-y-3">
                <UCard
                  v-for="request in groupedRequests[status]"
                  :key="request.id"
                  class="border-gray-200/70 dark:border-gray-800/70"
                >
                  <div class="space-y-2">
                    <div class="flex flex-wrap items-center gap-2">
                      <p class="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">
                        {{ request.code }}
                      </p>
                      <UBadge :color="getPriorityColor(request.priority)" variant="soft" size="sm">
                        {{ getPriorityLabel(request.priority) }}
                      </UBadge>
                    </div>

                    <h4 class="line-clamp-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {{ request.title }}
                    </h4>

                    <p class="line-clamp-3 text-xs text-gray-600 dark:text-gray-300">
                      {{ request.description }}
                    </p>

                    <p class="text-xs text-gray-500 dark:text-gray-400">
                      {{ request.requester }} · {{ request.area }} · {{ request.estimatedHours }}h
                    </p>

                    <div class="flex items-center gap-2">
                      <USelect
                        v-model="statusDrafts[request.id]"
                        :items="statusOptions"
                        size="sm"
                        class="flex-1"
                      />
                      <UButton
                        size="sm"
                        color="neutral"
                        variant="outline"
                        icon="i-lucide-check"
                        :loading="updatingRequestId === request.id"
                        @click="saveStatus(request)"
                      />
                    </div>

                    <div class="flex items-center justify-between gap-2">
                      <p class="text-[11px] text-gray-500 dark:text-gray-400">
                        {{ new Date(request.updatedAt).toLocaleDateString() }}
                      </p>
                      <UButton
                        v-if="status === 'REGISTERED' || status === 'REJECTED'"
                        size="xs"
                        color="error"
                        variant="ghost"
                        icon="i-lucide-trash-2"
                        :loading="updatingRequestId === request.id"
                        @click="deleteItem(request)"
                      >
                        Eliminar
                      </UButton>
                    </div>
                  </div>
                </UCard>

                <UCard v-if="!groupedRequests[status].length" class="border-dashed border-gray-300/80 dark:border-gray-700">
                  <p class="text-xs text-center text-gray-500 dark:text-gray-400">
                    Sin requerimientos
                  </p>
                </UCard>
              </div>
            </UCard>
          </div>
        </div>
      </div>
    </template>
  </UDashboardPanel>

  <UModal v-model:open="createModalOpen" title="Nuevo requerimiento de desarrollo">
    <template #content>
      <div class="space-y-4 p-4">
        <div class="grid gap-3">
          <UFormGroup label="Titulo" required>
            <UInput v-model="form.title" placeholder="Ej: Integrar reporte de ventas por sede" />
          </UFormGroup>

          <UFormGroup label="Descripcion" required>
            <UTextarea v-model="form.description" :rows="4" placeholder="Detalle funcional del requerimiento" />
          </UFormGroup>

          <div class="grid gap-3 md:grid-cols-2">
            <UFormGroup label="Solicitante" required>
              <UInput v-model="form.requester" placeholder="Nombre del solicitante" />
            </UFormGroup>
            <UFormGroup label="Area" required>
              <UInput v-model="form.area" placeholder="Ej: Operaciones / Finanzas / RRHH" />
            </UFormGroup>
          </div>

          <div class="grid gap-3 md:grid-cols-2">
            <UFormGroup label="Prioridad">
              <USelect v-model="form.priority" :items="priorityOptions" />
            </UFormGroup>
            <UFormGroup label="Horas estimadas">
              <UInput v-model.number="form.estimatedHours" type="number" min="1" />
            </UFormGroup>
          </div>
        </div>

        <div class="flex justify-end gap-2">
          <UButton
color="neutral"
variant="outline"
:disabled="creating"
@click="createModalOpen = false">
            Cancelar
          </UButton>
          <UButton
            color="primary"
            icon="i-lucide-save"
            :loading="creating"
            :disabled="!canCreate"
            @click="submitCreate"
          >
            Guardar requerimiento
          </UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>
