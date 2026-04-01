<script setup lang="ts">
import { apiFetch } from '~/services/api'

const open = defineModel<boolean>('open', {
  default: false,
})

const props = defineProps<{
  userName?: string
}>()

type TabKey = 'birthdays' | 'technicians'

type BirthdayNotification = {
  id: number
  employee_id: number
  dni: string
  title: string
  message: string
  selected: boolean
  type: string
  birthday: string
  birthday_day: string
  birthday_month: number
  birthday_year: number
  department_name: string
  position_name: string
}

type SelectedBirthdayUser = string | {
  id?: number
  full_name?: string
  nombre_completo?: string
  name?: string
  nombre?: string
  apellido?: string
}

type TechnicianNotification = {
  id: number
  employee_id: number
  dni: string
  nombre: string
  apellido: string
  nombre_completo: string
  fecha_referencia: string
  title: string
  message: string
  selected: boolean
  type: string
  rutas_count: number
  rutas: unknown[]
  daily_record: unknown
  source: string
}

type SelectedTechnicianUser = string | {
  id?: number
  nombre_completo?: string
  name?: string
  nombre?: string
  apellido?: string
}

type TechnicianApiResponse = {
  success: boolean
  fecha_referencia?: string
  total_notificaciones?: number
  notifications?: TechnicianNotification[]
  selected_users?: SelectedTechnicianUser[]
  raw?: unknown
}

const activeTab = ref<TabKey>('birthdays')
const loadingBirthdays = ref(false)
const birthdaysError = ref('')
const birthdayMonth = ref(new Date().getMonth() + 1)
const birthdayMonthLabel = ref('')
const totalBirthdays = ref(0)
const selectedBirthdayUsers = ref(0)
const selectedBirthdayUserNames = ref<string[]>([])
const birthdayNotifications = ref<BirthdayNotification[]>([])
const loadingTechnicians = ref(false)
const techniciansError = ref('')
const apiReferenceDate = ref('')
const totalTechnicianNotifications = ref(0)
const selectedTechnicianUsers = ref(0)
const selectedTechnicianUserNames = ref<string[]>([])
const technicianNotifications = ref<TechnicianNotification[]>([])

const yesterdayLabel = computed(() => {
  const date = new Date()
  date.setDate(date.getDate() - 1)
  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
})

const referenceDateLabel = computed(() => apiReferenceDate.value || yesterdayLabel.value)
const currentMonthLabel = computed(() => new Intl.DateTimeFormat('es-PE', { month: 'long' }).format(new Date()))
const todayDayLabel = computed(() => String(new Date().getDate()).padStart(2, '0'))
const todayBirthdayNotifications = computed(() =>
  birthdayNotifications.value.filter((item) => String(item.birthday_day).padStart(2, '0') === todayDayLabel.value)
)

const formatSelectedBirthdayUser = (user: SelectedBirthdayUser) => {
  if (typeof user === 'string') return user

  return user.full_name
    || user.nombre_completo
    || [user.nombre, user.apellido].filter(Boolean).join(' ').trim()
    || user.name
    || (user.id ? `ID ${user.id}` : 'Usuario')
}

const formatSelectedTechnicianUser = (user: SelectedTechnicianUser) => {
  if (typeof user === 'string') return user

  return user.nombre_completo
    || [user.nombre, user.apellido].filter(Boolean).join(' ').trim()
    || user.name
    || (user.id ? `ID ${user.id}` : 'Usuario')
}

const loadBirthdayNotifications = async () => {
  if (!import.meta.client) return

  loadingBirthdays.value = true
  birthdaysError.value = ''

  try {
    const response = await apiFetch(`/api/biotime/personnel-employees/birthdays-by-month?month=${birthdayMonth.value}`, {
      method: 'GET',
    }) as {
      success: boolean
      month?: number
      month_label?: string
      total_birthdays?: number
      notifications?: BirthdayNotification[]
      selected_users?: SelectedBirthdayUser[]
    }

    birthdayMonth.value = response?.month ?? birthdayMonth.value
    birthdayMonthLabel.value = response?.month_label || currentMonthLabel.value
    totalBirthdays.value = response?.total_birthdays ?? 0
    selectedBirthdayUsers.value = Array.isArray(response?.selected_users) ? response.selected_users.length : 0
    selectedBirthdayUserNames.value = Array.isArray(response?.selected_users)
      ? response.selected_users.map(formatSelectedBirthdayUser).filter(Boolean)
      : []
    birthdayNotifications.value = Array.isArray(response?.notifications)
      ? response.notifications.filter((item) => item.type === 'birthday' || item.selected)
      : []
  } catch (error) {
    console.error('Error loading birthday notifications:', error)
    birthdaysError.value = 'No se pudieron cargar los cumpleaños del mes.'
    birthdayNotifications.value = []
  } finally {
    loadingBirthdays.value = false
  }
}

const loadTechnicianNotifications = async () => {
  if (!import.meta.client) return

  loadingTechnicians.value = true
  techniciansError.value = ''

  try {
    const response = await apiFetch('/api/seguimiento-tecnico/notificaciones-dia-anterior', {
      method: 'GET',
    }) as TechnicianApiResponse

    apiReferenceDate.value = response?.fecha_referencia || ''
    totalTechnicianNotifications.value = response?.total_notificaciones ?? 0
    selectedTechnicianUsers.value = Array.isArray(response?.selected_users) ? response.selected_users.length : 0
    selectedTechnicianUserNames.value = Array.isArray(response?.selected_users)
      ? response.selected_users.map(formatSelectedTechnicianUser).filter(Boolean)
      : []
    technicianNotifications.value = Array.isArray(response?.notifications)
      ? response.notifications.filter((item) => item.type === 'technician_missing_mark' || item.selected)
      : []
  } catch (error) {
    console.error('Error loading technician notifications:', error)
    techniciansError.value = 'No se pudieron cargar las notificaciones del dia anterior.'
    technicianNotifications.value = []
  } finally {
    loadingTechnicians.value = false
  }
}

watch(
  open,
  (value) => {
    if (value) {
      activeTab.value = 'birthdays'
      loadBirthdayNotifications()
      loadTechnicianNotifications()
    }
  },
  { immediate: true }
)

const tabs = computed(() => [
  {
    label: 'Cumpleaños',
    value: 'birthdays' as TabKey,
    badge: totalBirthdays.value || birthdayNotifications.value.length || 0,
  },
  {
    label: 'Tecnicos sin asistencia',
    value: 'technicians' as TabKey,
    badge: totalTechnicianNotifications.value || technicianNotifications.value.length || 0,
  },
])

const close = () => {
  open.value = false
}
</script>

<template>
  <UModal
    v-model:open="open"
    :ui="{
      content: 'max-w-5xl',
      title: 'py-5 px-6',
    }"
  >
    <template #title>
      <div class="flex items-start gap-4">
        <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eef4ff] text-[#2d5fc0] dark:bg-[#13203a] dark:text-[#9cb7f5]">
          <UIcon name="i-lucide-bell-ring" class="h-5 w-5" />
        </div>
        <div class="min-w-0">
          <div class="text-xs font-semibold uppercase tracking-[0.22em] text-[#39569a] dark:text-[#9cb7f5]">
            Notificaciones RRHH
          </div>
          <h3 class="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">
            Hola{{ props.userName ? `, ${props.userName}` : '' }}. Revisa estos avisos.
          </h3>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Cumpleaños y tecnicos sin asistencia. La informacion de tecnicos se consume desde el endpoint real.
          </p>
        </div>
      </div>
    </template>

    <template #body>
      <div class="space-y-5 p-6">
        <AppTabs
          v-model="activeTab"
          ariaLabel="Notificaciones RRHH"
          size="sm"
          :items="tabs"
          :list-class="'flex-wrap'"
        />

        <div v-if="activeTab === 'birthdays'" class="space-y-3">
          <div class="flex items-center justify-between gap-3 rounded-2xl border border-[#c9d9ff] bg-[#eef4ff]/60 px-4 py-3 dark:border-[#29406f] dark:bg-[#13203a]/60">
            <div>
              <p class="text-sm font-semibold text-[#2d5fc0] dark:text-[#9cb7f5]">
                Cumpleaños del mes: {{ birthdayMonthLabel || currentMonthLabel }}
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                Casos cargados desde el endpoint mensual.
              </p>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <span class="inline-flex items-center rounded-full border border-[#c9d9ff] bg-white px-3 py-1 text-xs font-semibold text-[#2d5fc0] dark:border-[#29406f] dark:bg-gray-950 dark:text-[#9cb7f5]">
                {{ totalBirthdays || birthdayNotifications.length }} cumpleaños
              </span>
              <span class="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 dark:border-amber-900 dark:bg-amber-950/25 dark:text-amber-200">
                {{ selectedBirthdayUsers }} seleccionados
              </span>
            </div>
          </div>

        

          <div
            v-if="todayBirthdayNotifications.length"
            class="flex items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 via-white to-[#eef4ff] px-4 py-3 shadow-sm dark:border-amber-900 dark:from-amber-950/30 dark:via-gray-950 dark:to-[#13203a]"
          >
            <div class="flex items-center gap-3">
              <div class="birthday-today-orb flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-200">
                <UIcon name="i-lucide-party-popper" class="h-5 w-5" />
              </div>
              <div>
                <p class="text-sm font-semibold text-amber-900 dark:text-amber-100">
                  Hoy cumple{{ todayBirthdayNotifications.length > 1 ? 'n' : '' }} {{ todayBirthdayNotifications.length }} colaborador{{ todayBirthdayNotifications.length > 1 ? 'es' : '' }}
                </p>
                <p class="text-xs text-amber-700 dark:text-amber-200">
                  Se resalta con una animacion suave en la tarjeta del cumpleaños de hoy.
                </p>
              </div>
            </div>
            <span class="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-950/60 dark:text-amber-100">
              Dia {{ todayDayLabel }}
            </span>
          </div>

          <div v-if="loadingBirthdays" class="grid gap-3 md:grid-cols-2">
            <USkeleton v-for="i in 4" :key="i" class="h-40 rounded-2xl" />
          </div>

          <UAlert
            v-else-if="birthdaysError"
            color="warning"
            variant="soft"
            icon="i-lucide-alert-triangle"
            title="No se pudo cargar el endpoint"
            :description="birthdaysError"
          />

          <UAlert
            v-else-if="!birthdayNotifications.length"
            color="primary"
            variant="soft"
            icon="i-lucide-info"
            title="Sin novedades"
            description="No hay cumpleaños para el mes consultado."
          />

          <div v-else class="grid gap-3 md:grid-cols-2">
            <div
              v-for="item in birthdayNotifications"
              :key="item.id"
              :class="[
                'rounded-2xl border bg-white p-4 shadow-sm dark:bg-gray-950',
                String(item.birthday_day).padStart(2, '0') === todayDayLabel
                  ? 'birthday-today-card border-amber-200 dark:border-amber-900'
                  : 'border-gray-200 dark:border-gray-800'
              ]"
            >
              <div class="flex items-start gap-3">
                <div
                  :class="[
                    'flex h-11 w-11 items-center justify-center rounded-xl',
                    String(item.birthday_day).padStart(2, '0') === todayDayLabel
                      ? 'birthday-today-orb bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-200'
                      : 'bg-[#eef4ff] text-[#2d5fc0] dark:bg-[#13203a] dark:text-[#9cb7f5]'
                  ]"
                >
                  <UIcon
                    :name="String(item.birthday_day).padStart(2, '0') === todayDayLabel ? 'i-lucide-party-popper' : 'i-lucide-cake'"
                    class="h-5 w-5"
                  />
                </div>
                <div class="min-w-0 flex-1">
                  <div class="flex items-start justify-between gap-3">
                    <div>
                      <p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#2d5fc0] dark:text-[#9cb7f5]">
                        {{ item.title }}
                      </p>
                      <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {{ item.message }}
                      </p>
                      <p class="text-xs text-gray-500 dark:text-gray-400">
                        DNI {{ item.dni }} - ID {{ item.employee_id }}
                      </p>
                    </div>
                    <span class="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800 dark:border-amber-900 dark:bg-amber-950/25 dark:text-amber-100">
                      {{ item.birthday_day }}/{{ item.birthday_month }}
                    </span>
                  </div>

                  <div class="mt-3 flex flex-wrap items-center gap-2">
                    <span class="inline-flex items-center rounded-full border border-[#c9d9ff] bg-[#eef4ff] px-2 py-0.5 text-[11px] font-semibold text-[#2d5fc0] dark:border-[#29406f] dark:bg-[#13203a] dark:text-[#9cb7f5]">
                      {{ item.department_name }}
                    </span>
                    <span class="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/25 dark:text-emerald-200">
                      {{ item.position_name }}
                    </span>
                  </div>

                  <p class="mt-2 text-sm text-gray-700 dark:text-gray-300">
                    {{ item.birthday }}
                  </p>

                  <!-- <div class="mt-3 flex items-center justify-between gap-3">
                    <span class="text-[11px] font-mono text-gray-400 dark:text-gray-500">
                      Tipo: {{ item.type }}
                    </span>
                    <UButton
                      to="/rrhh/eventos"
                      size="sm"
                      color="primary"
                      variant="solid"
                      class="bg-[#2d5fc0] hover:bg-[#244fa4] text-white"
                      icon="i-lucide-gift"
                    >
                      Ver eventos
                    </UButton>
                  </div> -->
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="space-y-3">
          <div class="flex items-center justify-between gap-3 rounded-2xl border border-[#c9d9ff] bg-[#eef4ff]/60 px-4 py-3 dark:border-[#29406f] dark:bg-[#13203a]/60">
            <div>
              <p class="text-sm font-semibold text-[#2d5fc0] dark:text-[#9cb7f5]">
                Tecnicos con ruta pero sin asistencia
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                Casos del dia anterior: {{ referenceDateLabel }}.
              </p>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <span class="inline-flex items-center rounded-full border border-[#c9d9ff] bg-white px-3 py-1 text-xs font-semibold text-[#2d5fc0] dark:border-[#29406f] dark:bg-gray-950 dark:text-[#9cb7f5]">
                {{ totalTechnicianNotifications || technicianNotifications.length }} casos
              </span>
              <span class="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/25 dark:text-emerald-200">
                {{ selectedTechnicianUsers }} seleccionados
              </span>
            </div>
          </div>

       

          <div v-if="loadingTechnicians" class="grid gap-3 md:grid-cols-2">
            <USkeleton v-for="i in 4" :key="i" class="h-44 rounded-2xl" />
          </div>

          <UAlert
            v-else-if="techniciansError"
            color="warning"
            variant="soft"
            icon="i-lucide-alert-triangle"
            title="No se pudo cargar el endpoint"
            :description="techniciansError"
          />

          <UAlert
            v-else-if="!technicianNotifications.length"
            color="primary"
            variant="soft"
            icon="i-lucide-info"
            title="Sin novedades"
            description="No hay tecnicos con ruta y sin asistencia para la fecha consultada."
          />

          <div v-else class="grid gap-3 md:grid-cols-2">
            <div
              v-for="item in technicianNotifications"
              :key="item.id"
              class="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-950"
            >
              <div class="flex items-start gap-3">
                <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-[#eef4ff] text-[#2d5fc0] dark:bg-[#13203a] dark:text-[#9cb7f5]">
                  <UIcon name="i-lucide-user-x" class="h-5 w-5" />
                </div>
                <div class="min-w-0 flex-1">
                  <div class="flex items-start justify-between gap-3">
                    <div>
                      <p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#2d5fc0] dark:text-[#9cb7f5]">
                        {{ item.title }}
                      </p>
                      <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {{ item.nombre_completo }}
                      </p>
                      <p class="text-xs text-gray-500 dark:text-gray-400">
                        DNI {{ item.dni }} - ID {{ item.employee_id }}
                      </p>
                    </div>
                    <span class="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800 dark:border-amber-900 dark:bg-amber-950/25 dark:text-amber-100">
                      {{ item.fecha_referencia }}
                    </span>
                  </div>

                  <div class="mt-3 flex flex-wrap items-center gap-2">
                    <span class="inline-flex items-center rounded-full border border-[#c9d9ff] bg-[#eef4ff] px-2 py-0.5 text-[11px] font-semibold text-[#2d5fc0] dark:border-[#29406f] dark:bg-[#13203a] dark:text-[#9cb7f5]">
                      Ruta asignada: {{ item.rutas_count }} rutas
                    </span>
                    <span class="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/25 dark:text-emerald-200">
                      Sin marcacion
                    </span>
                  </div>

                  <p class="mt-2 text-sm text-gray-700 dark:text-gray-300">
                    {{ item.message }}
                  </p>

                  <p class="mt-2 text-[11px] font-mono text-gray-400 dark:text-gray-500">
                    Fuente: {{ item.source }}
                  </p>

                  <div class="mt-3 flex items-center justify-between gap-3">
                    <span class="text-[11px] font-mono text-gray-400 dark:text-gray-500">
                      Tipo: {{ item.type }}
                    </span>
                    <UButton
                      :to="{
                        path: '/rrhh/seguimiento',
                        query: {
                          tab: 'con-rutas',
                          subtab: 'no-marcaron',
                          fecha: item.fecha_referencia,
                        },
                      }"
                      size="sm"
                      color="primary"
                      variant="solid"
                      class="bg-[#2d5fc0] hover:bg-[#244fa4] text-white"
                      icon="i-lucide-route"
                    >
                      Ir a seguimiento
                    </UButton>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      
      </div>
    </template>
  </UModal>
</template>

<style scoped>
.birthday-today-card {
  position: relative;
  overflow: hidden;
}

.birthday-today-orb {
  animation: birthdayOrbPulse 1.8s ease-in-out infinite;
}

@keyframes birthdayOrbPulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.0);
  }

  50% {
    transform: scale(1.04);
    box-shadow: 0 0 0 8px rgba(245, 158, 11, 0.08);
  }
}
</style>
