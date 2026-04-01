<script setup lang="ts">
import { useContracts } from '~/composables/sistemas-ti/useContracts'
import type { CreateSystemContractPayload, SystemContract } from '~/services/sistemas-ti/contracts'

definePageMeta({
  layout: 'sistemas-ti',
  middleware: 'auth',
})

useHead({
  title: 'Sistemas TI - Control Administrativo',
})

const toast = useToast()

const {
  cancelContract,
  createContract,
  error,
  events,
  filteredContracts,
  getStatusColor,
  getStatusLabel,
  loading,
  notifications,
  refresh,
  renewContract,
  resetFilters,
  search,
  stats,
  statusFilter,
  statusFilterItems,
} = useContracts()

const tab = ref<'contracts' | 'events'>('contracts')
const createModalOpen = ref(false)
const creating = ref(false)
const updatingContractId = ref<number | null>(null)

const form = reactive<CreateSystemContractPayload>({
  vendor: '',
  serviceName: '',
  responsible: '',
  amount: 0,
  currency: 'PEN',
  startDate: '',
  endDate: '',
  autoRenew: true,
})

const canCreate = computed(() => {
  return [
    form.vendor,
    form.serviceName,
    form.responsible,
    form.startDate,
    form.endDate,
  ].every(value => value.toString().trim().length > 0) && form.amount > 0
})

const resetCreateForm = () => {
  form.vendor = ''
  form.serviceName = ''
  form.responsible = ''
  form.amount = 0
  form.currency = 'PEN'
  form.startDate = ''
  form.endDate = ''
  form.autoRenew = true
}

const submitCreate = async () => {
  if (!canCreate.value || creating.value) {
    return
  }

  creating.value = true

  try {
    await createContract({
      vendor: form.vendor,
      serviceName: form.serviceName,
      responsible: form.responsible,
      amount: form.amount,
      currency: form.currency,
      startDate: form.startDate,
      endDate: form.endDate,
      autoRenew: form.autoRenew,
    })

    toast.add({
      title: 'Contrato creado',
      description: 'El contrato se registro correctamente.',
      color: 'success',
    })

    createModalOpen.value = false
    resetCreateForm()
  } catch (err) {
    toast.add({
      title: 'Error',
      description: err instanceof Error ? err.message : 'No se pudo crear el contrato.',
      color: 'error',
    })
  } finally {
    creating.value = false
  }
}

const handleRenew = async (contract: SystemContract) => {
  if (updatingContractId.value !== null) {
    return
  }

  updatingContractId.value = contract.id

  try {
    await renewContract(contract.id, 12)
    toast.add({
      title: 'Contrato renovado',
      description: `${contract.code} se extendio 12 meses.`,
      color: 'success',
    })
  } catch (err) {
    toast.add({
      title: 'Error',
      description: err instanceof Error ? err.message : 'No se pudo renovar el contrato.',
      color: 'error',
    })
  } finally {
    updatingContractId.value = null
  }
}

const handleCancel = async (contract: SystemContract) => {
  if (updatingContractId.value !== null) {
    return
  }

  updatingContractId.value = contract.id

  try {
    await cancelContract(contract.id)
    toast.add({
      title: 'Contrato cancelado',
      description: `${contract.code} fue cancelado.`,
      color: 'success',
    })
  } catch (err) {
    toast.add({
      title: 'Error',
      description: err instanceof Error ? err.message : 'No se pudo cancelar el contrato.',
      color: 'error',
    })
  } finally {
    updatingContractId.value = null
  }
}

const formatMoney = (amount: number, currency: 'PEN' | 'USD') => {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount)
}

onMounted(async () => {
  await refresh()
})
</script>

<template>
  <UDashboardPanel id="sistemas-ti-admin-control">
    <template #header>
      <AppDashboardHeader
        title="Control Administrativo TI"
        mobile-title="Contratos TI"
        subtitle="Gestion de contratos, renovaciones y bitacora operativa"
        subtitle-icon="i-lucide-shield-check"
        icon="i-lucide-file-stack"
        :notification-count="notifications.length"
        notification-tooltip="Alertas de contratos"
      >
        <template #right>
          <UButton color="primary" icon="i-lucide-plus" @click="createModalOpen = true">
            Nuevo contrato
          </UButton>
        </template>
      </AppDashboardHeader>
    </template>

    <template #body>
      <div class="space-y-5">
        <UAlert
          v-for="notification in notifications.slice(0, 3)"
          :key="notification.id"
          :color="notification.severity === 'error' ? 'error' : 'warning'"
          variant="soft"
          icon="i-lucide-bell-ring"
          :title="notification.contractCode"
          :description="notification.message"
        />

        <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <UCard class="border-gray-200/70 dark:border-gray-800/70">
            <p class="text-xs uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">Total</p>
            <p class="mt-2 text-2xl font-black text-gray-900 dark:text-gray-100">{{ stats.total }}</p>
          </UCard>
          <UCard class="border-gray-200/70 dark:border-gray-800/70">
            <p class="text-xs uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">Activos</p>
            <p class="mt-2 text-2xl font-black text-emerald-700 dark:text-emerald-300">{{ stats.active }}</p>
          </UCard>
          <UCard class="border-gray-200/70 dark:border-gray-800/70">
            <p class="text-xs uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">Por vencer</p>
            <p class="mt-2 text-2xl font-black text-amber-700 dark:text-amber-300">{{ stats.expiring }}</p>
          </UCard>
          <UCard class="border-gray-200/70 dark:border-gray-800/70">
            <p class="text-xs uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">Vencidos</p>
            <p class="mt-2 text-2xl font-black text-rose-700 dark:text-rose-300">{{ stats.expired }}</p>
          </UCard>
          <UCard class="border-gray-200/70 dark:border-gray-800/70">
            <p class="text-xs uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">Cancelados</p>
            <p class="mt-2 text-2xl font-black text-gray-700 dark:text-gray-300">{{ stats.canceled }}</p>
          </UCard>
        </div>

        <UCard class="border-gray-200/70 dark:border-gray-800/70">
          <div class="flex flex-wrap items-center gap-2">
            <UButton
              :color="tab === 'contracts' ? 'primary' : 'neutral'"
              :variant="tab === 'contracts' ? 'solid' : 'outline'"
              icon="i-lucide-file-text"
              @click="tab = 'contracts'"
            >
              Contratos
            </UButton>
            <UButton
              :color="tab === 'events' ? 'primary' : 'neutral'"
              :variant="tab === 'events' ? 'solid' : 'outline'"
              icon="i-lucide-clipboard-list"
              @click="tab = 'events'"
            >
              Bitacora de eventos
            </UButton>
          </div>
        </UCard>

        <UAlert
          v-if="error"
          color="error"
          variant="soft"
          icon="i-lucide-alert-triangle"
          title="No se pudo cargar el modulo"
          :description="error"
        />

        <template v-else-if="tab === 'contracts'">
          <UCard class="border-gray-200/70 dark:border-gray-800/70">
            <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-[1.2fr_0.5fr_auto_auto]">
              <UInput
                v-model="search"
                icon="i-lucide-search"
                placeholder="Buscar por codigo, proveedor, servicio o responsable"
              />
              <USelect v-model="statusFilter" :items="statusFilterItems" placeholder="Estado" />
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

          <div v-if="loading" class="space-y-3">
            <USkeleton class="h-32 rounded-xl" />
            <USkeleton class="h-32 rounded-xl" />
          </div>

          <div v-else-if="!filteredContracts.length">
            <UCard class="border-dashed border-gray-300/80 text-center dark:border-gray-700">
              <div class="space-y-2 p-2">
                <UIcon name="i-lucide-file-x-2" class="mx-auto h-8 w-8 text-gray-400" />
                <p class="text-sm font-semibold text-gray-700 dark:text-gray-200">
                  No hay contratos para los filtros aplicados
                </p>
              </div>
            </UCard>
          </div>

          <div v-else class="space-y-3">
            <UCard
              v-for="contract in filteredContracts"
              :key="contract.id"
              class="border-gray-200/70 dark:border-gray-800/70"
            >
              <div class="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
                <div class="space-y-2 min-w-0">
                  <div class="flex flex-wrap items-center gap-2">
                    <p class="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">
                      {{ contract.code }}
                    </p>
                    <UBadge :color="getStatusColor(contract.status)" variant="soft" size="sm">
                      {{ getStatusLabel(contract.status) }}
                    </UBadge>
                    <UBadge color="neutral" variant="subtle" size="sm">
                      {{ contract.currency }}
                    </UBadge>
                  </div>

                  <h3 class="truncate text-base font-semibold text-gray-900 dark:text-gray-100">
                    {{ contract.serviceName }}
                  </h3>

                  <p class="text-sm text-gray-600 dark:text-gray-300">
                    Proveedor: {{ contract.vendor }} · Responsable: {{ contract.responsible }}
                  </p>

                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    Vigencia: {{ contract.startDate }} a {{ contract.endDate }} · Monto: {{ formatMoney(contract.amount, contract.currency) }}
                  </p>
                </div>

                <div class="grid gap-2 md:grid-cols-2 xl:grid-cols-1">
                  <UButton
                    color="success"
                    variant="soft"
                    icon="i-lucide-refresh-cw"
                    :loading="updatingContractId === contract.id"
                    :disabled="contract.status === 'CANCELED'"
                    @click="handleRenew(contract)"
                  >
                    Renovar 12 meses
                  </UButton>

                  <UButton
                    color="error"
                    variant="soft"
                    icon="i-lucide-ban"
                    :loading="updatingContractId === contract.id"
                    :disabled="contract.status === 'CANCELED'"
                    @click="handleCancel(contract)"
                  >
                    Cancelar contrato
                  </UButton>

                  <div class="text-xs text-gray-500 dark:text-gray-400">
                    Actualizado: {{ new Date(contract.updatedAt).toLocaleString() }}
                  </div>
                </div>
              </div>
            </UCard>
          </div>
        </template>

        <template v-else>
          <div v-if="loading" class="space-y-3">
            <USkeleton class="h-20 rounded-xl" />
            <USkeleton class="h-20 rounded-xl" />
            <USkeleton class="h-20 rounded-xl" />
          </div>

          <div v-else-if="!events.length">
            <UCard class="border-dashed border-gray-300/80 text-center dark:border-gray-700">
              <div class="space-y-2 p-2">
                <UIcon name="i-lucide-clipboard-x" class="mx-auto h-8 w-8 text-gray-400" />
                <p class="text-sm font-semibold text-gray-700 dark:text-gray-200">
                  No hay eventos registrados
                </p>
              </div>
            </UCard>
          </div>

          <div v-else class="space-y-3">
            <UCard
              v-for="event in events"
              :key="event.id"
              class="border-gray-200/70 dark:border-gray-800/70"
            >
              <div class="space-y-2">
                <div class="flex flex-wrap items-center gap-2">
                  <UBadge
                    :color="event.type === 'ALERT' ? 'warning' : event.type === 'CANCEL' ? 'error' : 'primary'"
                    variant="soft"
                    size="sm"
                  >
                    {{ event.type }}
                  </UBadge>
                  <p class="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">
                    {{ event.contractCode }}
                  </p>
                </div>
                <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100">{{ event.title }}</h3>
                <p class="text-sm text-gray-600 dark:text-gray-300">{{ event.detail }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  {{ new Date(event.createdAt).toLocaleString() }}
                </p>
              </div>
            </UCard>
          </div>
        </template>
      </div>
    </template>
  </UDashboardPanel>

  <UModal v-model:open="createModalOpen" title="Nuevo contrato TI">
    <template #content>
      <div class="space-y-4 p-4">
        <div class="grid gap-3">
          <UFormGroup label="Proveedor" required>
            <UInput v-model="form.vendor" placeholder="Ej: Microsoft / Oracle / Claro" />
          </UFormGroup>

          <UFormGroup label="Servicio / contrato" required>
            <UInput v-model="form.serviceName" placeholder="Ej: Licencias ERP anual" />
          </UFormGroup>

          <div class="grid gap-3 md:grid-cols-2">
            <UFormGroup label="Responsable" required>
              <UInput v-model="form.responsible" placeholder="Responsable TI" />
            </UFormGroup>
            <UFormGroup label="Monto" required>
              <UInput
v-model.number="form.amount"
type="number"
min="0"
step="0.01" />
            </UFormGroup>
          </div>

          <div class="grid gap-3 md:grid-cols-2">
            <UFormGroup label="Moneda">
              <USelect
v-model="form.currency"
:items="[
                { label: 'PEN', value: 'PEN' },
                { label: 'USD', value: 'USD' },
              ]" />
            </UFormGroup>
            <UFormGroup label="Renovacion automatica">
              <USelect
v-model="form.autoRenew"
:items="[
                { label: 'Si', value: true },
                { label: 'No', value: false },
              ]" />
            </UFormGroup>
          </div>

          <div class="grid gap-3 md:grid-cols-2">
            <UFormGroup label="Inicio" required>
              <UInput v-model="form.startDate" type="date" />
            </UFormGroup>
            <UFormGroup label="Fin" required>
              <UInput v-model="form.endDate" type="date" />
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
            Guardar contrato
          </UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>
