<script setup lang="ts">
import { format, formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import type {
  ContractPeriod,
  ContractType,
  NotificationContract,
} from '~/services/sistemas-ti/dashboard'

defineProps<{
  notifications: NotificationContract[]
}>()

const contractTypeOptions: Record<ContractType, { label: string, icon: string, bg: string }> = {
  LICENSE: { label: 'Licencia', icon: 'i-lucide-key', bg: 'bg-blue-500' },
  SERVICE: { label: 'Servicio', icon: 'i-lucide-wrench', bg: 'bg-green-500' },
  SUPPORT: { label: 'Soporte', icon: 'i-lucide-life-buoy', bg: 'bg-yellow-500' },
  HARDWARE: { label: 'Hardware', icon: 'i-lucide-cpu', bg: 'bg-purple-500' },
  OTHER: { label: 'Otro', icon: 'i-lucide-circle-help', bg: 'bg-gray-500' },
}

const contractPeriodOptions: Record<ContractPeriod, { label: string, icon: string, bg: string, card: string }> = {
  RECURRING: {
    label: 'Recurrente',
    icon: 'i-lucide-repeat',
    bg: 'bg-indigo-500',
    card: 'bg-indigo-500/10 text-indigo-700 border-indigo-300/40',
  },
  FIXED_TERM: {
    label: 'Plazo Fijo',
    icon: 'i-lucide-calendar-range',
    bg: 'bg-blue-500',
    card: 'bg-blue-500/10 text-blue-700 border-blue-300/40',
  },
  ONE_TIME: {
    label: 'Unico',
    icon: 'i-lucide-calendar-check',
    bg: 'bg-emerald-500',
    card: 'bg-emerald-500/10 text-emerald-700 border-emerald-300/40',
  },
}

const periodLabel = (period?: ContractPeriod) => {
  if (!period) return 'Contrato'
  return contractPeriodOptions[period]?.label || 'Contrato'
}

const parseMessage = (value?: string) => {
  if (!value) return ''
  try {
    const parsed = JSON.parse(value)
    return parsed?.message || ''
  } catch {
    return ''
  }
}

const alertTitle = (notification: NotificationContract) => {
  const message = parseMessage(notification.data)
  const contractName = notification.contract?.name || 'Contrato sin nombre'
  const typeLabel = notification.contract?.type
    ? contractTypeOptions[notification.contract.type]?.label
    : 'Contrato'

  return `${typeLabel}: ${contractName} ${message}`.trim()
}

const alertSubtitle = (notification: NotificationContract) => {
  const provider = notification.contract?.provider || 'Proveedor no definido'
  const period = periodLabel(notification.contract?.period)
  return `${provider} · ${period}`
}

const alertMeta = (notification: NotificationContract) => {
  const nextBillingDate = notification.contract?.billing?.next_billing_date
  const autoRenew = notification.contract?.billing?.auto_renew

  if (nextBillingDate && autoRenew) {
    return `Proxima facturacion: ${format(new Date(`${nextBillingDate}T00:00:00`), 'dd MMM yyyy', { locale: es })}`
  }

  if (nextBillingDate) {
    return `Vigencia hasta: ${format(new Date(`${nextBillingDate}T00:00:00`), 'dd MMM yyyy', { locale: es })}`
  }

  if (notification.contract?.end_date) {
    return `Vence el ${format(new Date(`${notification.contract.end_date}T00:00:00`), 'dd MMM yyyy', { locale: es })}`
  }

  return 'Revisar vigencia del contrato'
}
</script>

<template>
  <UCard class="border-gray-200/70 dark:border-gray-800/70">
    <template #header>
      <div>
        <h3 class="text-base font-semibold text-gray-900 dark:text-gray-100">
          Alertas activas
        </h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Eventos que requieren seguimiento inmediato.
        </p>
      </div>
    </template>

    <div v-if="notifications.length === 0" class="py-6 text-center">
      <UIcon name="i-lucide-shield-alert" class="mx-auto h-8 w-8 text-gray-400" />
      <p class="mt-3 text-sm font-semibold text-gray-700 dark:text-gray-200">
        No hay alertas activas
      </p>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        No se han reportado nuevas alertas esta semana.
      </p>
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        class="flex items-start gap-2 rounded-lg border p-2"
        :class="notification.contract?.period ? contractPeriodOptions[notification.contract.period].card : 'bg-gray-500/10 border-gray-300/40 text-gray-700'"
      >
        <UIcon
          :name="notification.contract?.type ? contractTypeOptions[notification.contract.type].icon : 'i-lucide-bell'"
          class="mt-0.5 h-4 w-4 shrink-0"
        />

        <div class="min-w-0 flex-1">
          <p class="break-words text-xs font-semibold">
            {{ alertTitle(notification) }}
          </p>
          <p class="mt-1 text-[11px] opacity-80">
            {{ alertSubtitle(notification) }}
          </p>

          <div class="mt-2 flex flex-wrap gap-1">
            <UBadge
              v-if="notification.contract?.type"
              variant="soft"
              class="text-[10px]"
              :class="contractTypeOptions[notification.contract.type].bg"
            >
              {{ contractTypeOptions[notification.contract.type].label }}
            </UBadge>

            <UBadge
              v-if="notification.contract?.period"
              variant="soft"
              class="text-[10px]"
              :class="contractPeriodOptions[notification.contract.period].bg"
            >
              <UIcon :name="contractPeriodOptions[notification.contract.period].icon" class="h-3 w-3" />
              {{ contractPeriodOptions[notification.contract.period].label }}
            </UBadge>
          </div>

          <p class="mt-1 text-[11px] opacity-80">
            {{ alertMeta(notification) }}
          </p>

          <small class="mt-2 block text-end text-[10px] opacity-60">
            {{ formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: es }) }}
          </small>
        </div>
      </div>
    </div>
  </UCard>
</template>
