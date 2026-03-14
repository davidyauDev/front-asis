<template>
    <div class="space-y-4">
      <div
        class="bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800 p-4"
      >
        <div class="flex flex-wrap items-end gap-3">
        <UFormGroup label="Buscar (código o nombres)" size="sm" class="w-full sm:w-[320px]">
          <UInput
            v-model="filters.search"
            placeholder="Ej: TEC001, Juan, Pérez..."
            size="sm"
            icon="i-lucide-search"
          />
        </UFormGroup>

        <UFormGroup label="Año" size="sm" class="w-[140px]">
          <UInput
            v-model="filters.year"
            type="text"
            inputmode="numeric"
            placeholder="2026"
            size="sm"
          />
        </UFormGroup>

        <UFormGroup label="Per page" size="sm" class="w-[140px]">
          <USelect
            v-model="filters.perPage"
            :items="perPageOptions"
            size="sm"
          />
        </UFormGroup>

        <div class="pb-1">
          <UCheckbox v-model="filters.paginate" label="Paginado" />
        </div>

        <div class="flex items-center gap-2">
          <UButton
            size="sm"
            color="neutral"
            variant="outline"
            icon="i-lucide-search"
            :loading="loading"
            @click="refresh()"
          >
            Buscar
          </UButton>

          <UButton
            size="sm"
            color="primary"
            icon="i-lucide-plus"
            @click="openCreate()"
          >
            Nuevo
          </UButton>
        </div>
      </div>

      <div class="mt-3 text-xs text-gray-500 dark:text-gray-400">
        Endpoint: <span class="font-mono">/api/employee-mobility</span>
      </div>
    </div>

    <DataState
      :loading="loading"
      :error="isError"
      :error-message="errorMessage"
      @retry="refresh()"
    >
      <div
        class="bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden"
      >
        <UTable :data="rowsFiltered" :columns="columns" empty="Sin registros" />

        <div
          v-if="filters.search && filters.paginate"
          class="px-4 py-2 text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30 border-t border-amber-200 dark:border-amber-900"
        >
          La búsqueda filtra solo la página actual. Desactiva “Paginado” para buscar en todos los registros.
        </div>

        <div
          v-if="filters.paginate && pagination.total > pagination.perPage"
          class="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-gray-200 dark:border-gray-800"
        >
          <div class="text-sm text-gray-600 dark:text-gray-300">
            Mostrando
            <span class="font-medium">{{ pagination.from }}</span>
            -
            <span class="font-medium">{{ pagination.to }}</span>
            de
            <span class="font-semibold">{{ pagination.total }}</span>
            registros
          </div>

          <UPagination
            :model-value="pagination.currentPage"
            :total="pagination.total"
            :items-per-page="pagination.perPage"
            @update:page="goToPage"
            :max="7"
            size="sm"
            show-first
            show-last
            :prev-button="{ icon: 'i-lucide-chevron-left', label: '', color: 'neutral' as const }"
            :next-button="{ icon: 'i-lucide-chevron-right', label: '', color: 'neutral' as const }"
            :first-button="{ icon: 'i-lucide-chevrons-left', label: '' }"
            :last-button="{ icon: 'i-lucide-chevrons-right', label: '' }"
          />
        </div>
      </div>
    </DataState>

    <EmployeeMonthlyReminderModal
      v-if="reminderRow"
      :open="isReminderOpen"
      :employee="{
        employee_id: reminderRow.employee_id,
        emp_code: reminderRow.emp_code,
        first_name: reminderRow.first_name,
        last_name: reminderRow.last_name,
      }"
      :year="reminderRow.year"
      @update:open="handleReminderOpenUpdate"
    />

    <UModal v-model:open="isModalOpen" :title="modalTitle">
      <template #content>
        <div class="space-y-4 p-4">
          <div v-if="editingMeta" class="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-900/30 p-3">
            <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
              <div class="text-gray-700 dark:text-gray-200">
                <span class="text-gray-500 dark:text-gray-400">Código:</span>
                <span class="ml-1 font-mono font-semibold">{{ editingMeta.emp_code }}</span>
              </div>
              <div class="text-gray-700 dark:text-gray-200">
                <span class="text-gray-500 dark:text-gray-400">Empleado:</span>
                <span class="ml-1 font-semibold">{{ editingMeta.full_name }}</span>
              </div>
            </div>
            <div class="mt-1 text-xs text-gray-500 dark:text-gray-400">
              ID movilidad: <span class="font-mono">{{ editingMeta.id }}</span> · Employee ID:
              <span class="font-mono">{{ editingMeta.employee_id }}</span>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <UFormGroup label="Empleado ID" size="sm" required>
              <UInput
                v-model="form.employee_id"
                type="text"
                inputmode="numeric"
                placeholder="Ej: 123"
                size="sm"
                :disabled="Boolean(editingId)"
              />
            </UFormGroup>

            <UFormGroup label="Año" size="sm" required>
              <UInput
                v-model="form.year"
                type="text"
                inputmode="numeric"
                placeholder="2000..2100"
                size="sm"
                :disabled="Boolean(editingId)"
              />
            </UFormGroup>

            <UFormGroup label="Monto" size="sm" required>
              <UInput
                v-model="form.amount"
                type="text"
                inputmode="decimal"
                placeholder="0.00"
                size="sm"
              />
            </UFormGroup>
          </div>

          <div
            v-if="formError"
            class="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-md p-3"
          >
            {{ formError }}
          </div>

          <div class="flex justify-end gap-2">
            <UButton color="gray" variant="outline" size="sm" @click="isModalOpen = false">
              Cancelar
            </UButton>
            <UButton
              color="primary"
              size="sm"
              :loading="saving"
              :disabled="saving"
              @click="save()"
            >
              {{ saving ? 'Guardando…' : 'Guardar' }}
            </UButton>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import { computed, h, onMounted, reactive, ref, resolveComponent } from 'vue'
import DataState from '~/components/common/DataState.vue'
import EmployeeMonthlyReminderModal from '~/components/movility-report/EmployeeMonthlyReminderModal.vue'
import { useEmployeeMobilityReminders } from '~/composables/useEmployeeMobilityReminders'
import {
  createEmployeeMobility,
  getApiErrorMessage,
  isApiValidationError,
  listEmployeeMobility,
  updateEmployeeMobility,
  type EmployeeMobilityPayload,
  type EmployeeMobilityRow,
} from '~/services/employeeMobility'

const toast = useToast()

const filters = reactive({
  search: '',
  year: '' as string | number,
  perPage: 50 as number,
  paginate: true,
})

const perPageOptions = [
  { label: '5', value: 5 },
  { label: '25', value: 25 },
  { label: '50', value: 50 },
  { label: '100', value: 100 },
  { label: '200', value: 200 },
  { label: '500', value: 500 },
]

const loading = ref(false)
const isError = ref(false)
const errorMessage = ref('No se pudieron cargar los montos de movilidad.')

const rows = ref<EmployeeMobilityRow[]>([])

const rowsFiltered = computed(() => {
  const q = String(filters.search || '').trim().toLowerCase()
  if (!q) return rows.value

  return rows.value.filter((r) => {
    const empCode = String(r.emp_code || '').toLowerCase()
    const firstName = String(r.first_name || '').toLowerCase()
    const lastName = String(r.last_name || '').toLowerCase()
    const fullName = `${firstName} ${lastName}`.trim()
    return empCode.includes(q) || firstName.includes(q) || lastName.includes(q) || fullName.includes(q)
  })
})

const pagination = reactive({
  currentPage: 1,
  perPage: 50,
  total: 0,
  from: 0,
  to: 0,
})

const UButton = resolveComponent('UButton')
const UIcon = resolveComponent('UIcon')
const UBadge = resolveComponent('UBadge')

const toNumberOrUndefined = (value: unknown) => {
  if (value === '' || value === null || value === undefined) return undefined
  const n = Number(String(value).trim())
  return Number.isFinite(n) ? n : undefined
}

const refresh = async (page = 1) => {
  loading.value = true
  isError.value = false
  errorMessage.value = 'No se pudieron cargar los montos de movilidad.'

  try {
    const year = toNumberOrUndefined(filters.year)
    const per_page = toNumberOrUndefined(filters.perPage) ?? 50

    if (filters.paginate) {
      const res = await listEmployeeMobility({
        year,
        per_page,
        page,
      })

      const pageData = res.data
      rows.value = pageData.data
      pagination.currentPage = pageData.current_page
      pagination.perPage = pageData.per_page
      pagination.total = pageData.total
      pagination.from = pageData.from ?? 0
      pagination.to = pageData.to ?? 0
      return
    }

    const res = await listEmployeeMobility({
      year,
      per_page,
      paginate: false,
    })

    rows.value = res.data
    pagination.currentPage = 1
    pagination.perPage = res.data.length || per_page
    pagination.total = res.data.length
    pagination.from = res.data.length ? 1 : 0
    pagination.to = res.data.length
  } catch (error: unknown) {
    isError.value = true
    const msg = getApiErrorMessage(error)

    if (msg === 'Unauthenticated.' || msg.toLowerCase().includes('unauth')) {
      errorMessage.value = 'Sesión expirada. Vuelve a iniciar sesión.'
    } else {
      errorMessage.value = msg
    }
  } finally {
    loading.value = false
  }
}

const goToPage = (page: number) => {
  refresh(page)
}

onMounted(() => {
  refresh()
})

const formatMoney = (value: EmployeeMobilityRow['amount']) => {
  const n = Number(value)
  if (Number.isFinite(n)) return n.toFixed(2)
  return String(value ?? '')
}

const { countEmployeeYear } = useEmployeeMobilityReminders()

const isReminderOpen = ref(false)
const reminderRow = ref<EmployeeMobilityRow | null>(null)

const openReminder = (row: EmployeeMobilityRow) => {
  reminderRow.value = row
  isReminderOpen.value = true
}

const handleReminderOpenUpdate = (v: boolean) => {
  isReminderOpen.value = v
  if (!v) reminderRow.value = null
}

const columns: TableColumn<EmployeeMobilityRow>[] = [
  {
    accessorKey: 'emp_code',
    header: 'Código',
    cell: ({ row }) => h('span', { class: 'font-mono text-xs' }, row.getValue('emp_code') as any),
  },
  {
    accessorKey: 'first_name',
    header: 'Nombres',
    cell: ({ row }) => row.getValue('first_name'),
  },
  { accessorKey: 'last_name', header: 'Apellidos', cell: ({ row }) => row.getValue('last_name') },
  { accessorKey: 'year', header: 'Año', cell: ({ row }) => row.getValue('year') },
  {
    accessorKey: 'amount',
    header: 'Monto',
    cell: ({ row }) =>
      h('span', { class: 'font-mono tabular-nums' }, formatMoney(row.getValue('amount') as any)),
  },
  {
    id: 'reminder',
    header: 'Recordatorio',
    cell: ({ row }) => {
      const r = row.original
      const count = countEmployeeYear(r.employee_id, r.year)
      return h(
        'div',
        { class: 'flex items-center gap-2' },
        [
          h(
            UButton,
            {
              size: 'xs',
              color: 'neutral',
              variant: 'outline',
              onClick: () => openReminder(r),
            },
            () => [
              h(UIcon, { name: 'i-lucide-sticky-note', class: 'w-3.5 h-3.5 mr-1.5' }),
              'Abrir',
            ]
          ),
          count
            ? h(
                UBadge,
                { color: 'warning', variant: 'subtle' },
                () => String(count)
              )
            : null,
        ].filter(Boolean)
      )
    },
  },
  {
    id: 'actions',
    header: 'Acciones',
    cell: ({ row }) =>
      h(
        UButton,
        {
          size: 'xs',
          color: 'neutral',
          variant: 'outline',
          onClick: () => openEdit(row.original),
        },
        () => [h(UIcon, { name: 'i-lucide-pencil', class: 'w-3.5 h-3.5 mr-1.5' }), 'Editar']
      ),
  },
]

const isModalOpen = ref(false)
const saving = ref(false)
const editingId = ref<number | null>(null)
const editingMeta = ref<null | {
  id: number
  employee_id: number
  emp_code: string
  full_name: string
}>(null)
const formError = ref<string | null>(null)

const form = reactive<EmployeeMobilityPayload>({
  employee_id: 0,
  year: new Date().getFullYear(),
  amount: 0,
})

const modalTitle = computed(() => (editingId.value ? 'Editar monto (Movilidad)' : 'Nuevo monto (Movilidad)'))

const openCreate = () => {
  editingId.value = null
  editingMeta.value = null
  form.employee_id = 0
  form.year = toNumberOrUndefined(filters.year) ?? new Date().getFullYear()
  form.amount = 0
  formError.value = null
  isModalOpen.value = true
}

const openEdit = (row: EmployeeMobilityRow) => {
  editingId.value = row.id
  editingMeta.value = {
    id: row.id,
    employee_id: row.employee_id,
    emp_code: row.emp_code,
    full_name: `${row.first_name ?? ''} ${row.last_name ?? ''}`.trim(),
  }
  form.employee_id = Number(row.employee_id)
  form.year = Number(row.year)
  form.amount = Number(row.amount) || 0
  formError.value = null
  isModalOpen.value = true
}

const save = async () => {
  if (saving.value) return
  formError.value = null

  saving.value = true
  try {
    const payload: EmployeeMobilityPayload = {
      employee_id: Number(form.employee_id),
      year: Number(form.year),
      amount: Number(form.amount),
    }

    if (!payload.employee_id || !payload.year || Number.isNaN(payload.amount)) {
      formError.value = 'Completa los campos requeridos.'
      return
    }

    if (payload.year < 2000 || payload.year > 2100) {
      formError.value = 'El año debe estar entre 2000 y 2100.'
      return
    }

    if (payload.amount < 0) {
      formError.value = 'El monto no puede ser negativo.'
      return
    }

    if (editingId.value) {
      await updateEmployeeMobility(editingId.value, payload)
      toast.add({
        title: 'Actualizado',
        description: 'El monto se actualizó correctamente.',
        icon: 'i-lucide-check-circle',
        color: 'green',
        timeout: 2500,
      })
    } else {
      await createEmployeeMobility(payload)
      toast.add({
        title: 'Creado',
        description: 'El monto se registró correctamente.',
        icon: 'i-lucide-check-circle',
        color: 'green',
        timeout: 2500,
      })
    }

    isModalOpen.value = false
    await refresh(filters.paginate ? pagination.currentPage : 1)
  } catch (error: unknown) {
    if (isApiValidationError(error) && error.errors) {
      const firstField = Object.keys(error.errors)[0]
      const firstMsg = firstField ? error.errors[firstField]?.[0] : undefined
      formError.value = firstMsg || error.message
      return
    }

    const msg = getApiErrorMessage(error)
    if (msg === 'Unauthenticated.' || msg.toLowerCase().includes('unauth')) {
      formError.value = 'Sesión expirada. Vuelve a iniciar sesión.'
    } else if (msg === 'Registro de movilidad no encontrado.') {
      formError.value = 'El registro ya no existe (404). Refresca la tabla e intenta nuevamente.'
    } else {
      formError.value = msg
    }
    toast.add({
      title: 'Error',
      description: formError.value,
      icon: 'i-lucide-alert-circle',
      color: 'error',
      timeout: 6000,
    })
  } finally {
    saving.value = false
  }
}
</script>
