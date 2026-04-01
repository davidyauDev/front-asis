<script setup lang="ts">
import { useAccess } from '~/composables/sistemas-ti/useAccess'
import type {
  AccessRequest,
  AccessRequestStatus,
  CreateAccessRequestPayload,
} from '~/services/sistemas-ti/access'

definePageMeta({
  layout: 'sistemas-ti',
  middleware: 'auth',
})

useHead({
  title: 'Sistemas TI - Accesos',
})

const toast = useToast()

const {
  changeStatus,
  createRequest,
  error,
  filteredRequests,
  getServiceTypeLabel,
  getStatusColor,
  getStatusLabel,
  loading,
  refresh,
  requests,
  resetFilters,
  search,
  serviceTypeOptions,
  stats,
  statusFilter,
  statusFilterItems,
  statusOptions,
  typeFilter,
  typeFilterItems,
  updateRequest,
} = useAccess()

const createModalOpen = ref(false)
const creating = ref(false)
const updatingRequestId = ref<number | null>(null)

const ownerDrafts = reactive<Record<number, string>>({})
const statusDrafts = reactive<Record<number, AccessRequestStatus>>({})

const form = reactive<CreateAccessRequestPayload>({
  serviceName: '',
  serviceType: 'ERP',
  requester: '',
  area: '',
  owner: null,
  expiresAt: null,
  notes: '',
})

const canCreate = computed(() => {
  return [
    form.serviceName,
    form.requester,
    form.area,
  ].every(value => value.trim().length > 0)
})

const syncDrafts = (rows: AccessRequest[]) => {
  for (const row of rows) {
    if (ownerDrafts[row.id] === undefined) {
      ownerDrafts[row.id] = row.owner ?? ''
    }

    statusDrafts[row.id] = row.status
  }
}

watch(requests, (value) => {
  syncDrafts(value)
}, { immediate: true })

const resetCreateForm = () => {
  form.serviceName = ''
  form.serviceType = 'ERP'
  form.requester = ''
  form.area = ''
  form.owner = null
  form.expiresAt = null
  form.notes = ''
}

const submitCreate = async () => {
  if (!canCreate.value || creating.value) {
    return
  }

  creating.value = true

  try {
    await createRequest({
      serviceName: form.serviceName,
      serviceType: form.serviceType,
      requester: form.requester,
      area: form.area,
      owner: form.owner,
      expiresAt: form.expiresAt,
      notes: form.notes,
    })

    toast.add({
      title: 'Solicitud registrada',
      description: 'La solicitud de acceso fue creada correctamente.',
      color: 'success',
    })

    createModalOpen.value = false
    resetCreateForm()
  } catch (err) {
    toast.add({
      title: 'Error',
      description: err instanceof Error ? err.message : 'No se pudo registrar la solicitud.',
      color: 'error',
    })
  } finally {
    creating.value = false
  }
}

const saveOwner = async (request: AccessRequest) => {
  if (updatingRequestId.value !== null) {
    return
  }

  updatingRequestId.value = request.id

  try {
    await updateRequest(request.id, {
      owner: ownerDrafts[request.id] ?? null,
    })
    toast.add({
      title: 'Responsable actualizado',
      description: `${request.code} actualizado.`,
      color: 'success',
    })
  } catch (err) {
    toast.add({
      title: 'Error',
      description: err instanceof Error ? err.message : 'No se pudo actualizar el responsable.',
      color: 'error',
    })
  } finally {
    updatingRequestId.value = null
  }
}

const saveStatus = async (request: AccessRequest) => {
  if (updatingRequestId.value !== null) {
    return
  }

  updatingRequestId.value = request.id

  try {
    await changeStatus(request.id, statusDrafts[request.id] ?? request.status)
    toast.add({
      title: 'Estado actualizado',
      description: `${request.code} actualizado.`,
      color: 'success',
    })
  } catch (err) {
    toast.add({
      title: 'Error',
      description: err instanceof Error ? err.message : 'No se pudo actualizar el estado.',
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
  <UDashboardPanel id="sistemas-ti-access">
    <template #header>
      <AppDashboardHeader
        title="Matriz de Accesos"
        mobile-title="Accesos TI"
        subtitle="Control de provisionamiento y baja de servicios"
        subtitle-icon="i-lucide-key-round"
        icon="i-lucide-shield-check"
        :notification-count="stats.pending"
        notification-tooltip="Solicitudes pendientes"
      >
        <template #right>
          <UButton color="primary" icon="i-lucide-plus" @click="createModalOpen = true">
            Nueva solicitud
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
            <p class="text-xs uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">Pendientes</p>
            <p class="mt-2 text-2xl font-black text-amber-700 dark:text-amber-300">{{ stats.pending }}</p>
          </UCard>
          <UCard class="border-gray-200/70 dark:border-gray-800/70">
            <p class="text-xs uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">Aprobadas</p>
            <p class="mt-2 text-2xl font-black text-cyan-700 dark:text-cyan-300">{{ stats.approved }}</p>
          </UCard>
          <UCard class="border-gray-200/70 dark:border-gray-800/70">
            <p class="text-xs uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">Provisionadas</p>
            <p class="mt-2 text-2xl font-black text-emerald-700 dark:text-emerald-300">{{ stats.provisioned }}</p>
          </UCard>
          <UCard class="border-gray-200/70 dark:border-gray-800/70">
            <p class="text-xs uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">Rechazadas</p>
            <p class="mt-2 text-2xl font-black text-rose-700 dark:text-rose-300">{{ stats.rejected }}</p>
          </UCard>
        </div>

        <UCard class="border-gray-200/70 dark:border-gray-800/70">
          <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-[1.2fr_0.5fr_0.5fr_auto_auto]">
            <UInput
              v-model="search"
              icon="i-lucide-search"
              placeholder="Buscar por codigo, servicio, solicitante, area o responsable"
            />

            <USelect v-model="statusFilter" :items="statusFilterItems" placeholder="Estado" />
            <USelect v-model="typeFilter" :items="typeFilterItems" placeholder="Servicio" />

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
          title="No se pudieron cargar los accesos"
          :description="error"
        />

        <div v-else-if="loading" class="space-y-3">
          <USkeleton class="h-32 rounded-xl" />
          <USkeleton class="h-32 rounded-xl" />
          <USkeleton class="h-32 rounded-xl" />
        </div>

        <div v-else-if="!filteredRequests.length">
          <UCard class="border-dashed border-gray-300/80 text-center dark:border-gray-700">
            <div class="space-y-2 p-2">
              <UIcon name="i-lucide-key-round" class="mx-auto h-8 w-8 text-gray-400" />
              <p class="text-sm font-semibold text-gray-700 dark:text-gray-200">
                No hay solicitudes para los filtros aplicados
              </p>
            </div>
          </UCard>
        </div>

        <div v-else class="space-y-3">
          <UCard
            v-for="request in filteredRequests"
            :key="request.id"
            class="border-gray-200/70 dark:border-gray-800/70"
          >
            <div class="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
              <div class="space-y-2 min-w-0">
                <div class="flex flex-wrap items-center gap-2">
                  <p class="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">
                    {{ request.code }}
                  </p>
                  <UBadge color="neutral" variant="subtle" size="sm">
                    {{ getServiceTypeLabel(request.serviceType) }}
                  </UBadge>
                  <UBadge :color="getStatusColor(request.status)" variant="soft" size="sm">
                    {{ getStatusLabel(request.status) }}
                  </UBadge>
                </div>

                <h3 class="truncate text-base font-semibold text-gray-900 dark:text-gray-100">
                  {{ request.serviceName }}
                </h3>

                <p class="text-sm text-gray-600 dark:text-gray-300">
                  Solicitante: {{ request.requester }} · Area: {{ request.area }}
                </p>

                <p class="text-xs text-gray-500 dark:text-gray-400">
                  Responsable: {{ request.owner || 'Sin asignar' }} · Expira: {{ request.expiresAt || 'No aplica' }}
                </p>

                <p v-if="request.notes" class="text-xs text-gray-500 dark:text-gray-400">
                  {{ request.notes }}
                </p>
              </div>

              <div class="grid gap-2 md:grid-cols-2 xl:grid-cols-1">
                <div class="flex items-center gap-2">
                  <UInput
                    v-model="ownerDrafts[request.id]"
                    placeholder="Responsable TI"
                    size="sm"
                  />
                  <UButton
                    size="sm"
                    color="neutral"
                    variant="outline"
                    icon="i-lucide-user-check"
                    :loading="updatingRequestId === request.id"
                    @click="saveOwner(request)"
                  >
                    Guardar
                  </UButton>
                </div>

                <div class="flex items-center gap-2">
                  <USelect
                    v-model="statusDrafts[request.id]"
                    :items="statusOptions"
                    size="sm"
                  />
                  <UButton
                    size="sm"
                    color="neutral"
                    variant="outline"
                    icon="i-lucide-check"
                    :loading="updatingRequestId === request.id"
                    @click="saveStatus(request)"
                  >
                    Estado
                  </UButton>
                </div>

                <div class="text-xs text-gray-500 dark:text-gray-400">
                  Actualizado: {{ new Date(request.updatedAt).toLocaleString() }}
                </div>
              </div>
            </div>
          </UCard>
        </div>
      </div>
    </template>
  </UDashboardPanel>

  <UModal v-model:open="createModalOpen" title="Nueva solicitud de acceso">
    <template #content>
      <div class="space-y-4 p-4">
        <div class="grid gap-3">
          <UFormGroup label="Servicio" required>
            <UInput v-model="form.serviceName" placeholder="Ej: VPN corporativa / SAP ERP / CRM" />
          </UFormGroup>

          <div class="grid gap-3 md:grid-cols-2">
            <UFormGroup label="Tipo de servicio">
              <USelect v-model="form.serviceType" :items="serviceTypeOptions" />
            </UFormGroup>
            <UFormGroup label="Responsable TI (opcional)">
              <UInput v-model="form.owner" placeholder="Nombre del responsable" />
            </UFormGroup>
          </div>

          <div class="grid gap-3 md:grid-cols-2">
            <UFormGroup label="Solicitante" required>
              <UInput v-model="form.requester" placeholder="Nombre del solicitante" />
            </UFormGroup>
            <UFormGroup label="Area" required>
              <UInput v-model="form.area" placeholder="Ej: Operaciones" />
            </UFormGroup>
          </div>

          <UFormGroup label="Fecha de expiracion (opcional)">
            <UInput v-model="form.expiresAt" type="date" />
          </UFormGroup>

          <UFormGroup label="Notas">
            <UTextarea v-model="form.notes" :rows="3" placeholder="Contexto adicional de la solicitud" />
          </UFormGroup>
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
            Guardar solicitud
          </UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>
