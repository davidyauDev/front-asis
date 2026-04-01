<template>
    <div>
      <div class="p-4 sm:p-5">
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

          <UFormGroup label="Empleado ID" size="sm" class="w-[160px]">
            <UInput
              v-model="filters.employeeId"
              type="text"
              inputmode="numeric"
              placeholder="Ej: 9"
              size="sm"
              @keydown.enter.prevent="refresh()"
            />
          </UFormGroup>

          <UFormGroup label="Estado" size="sm" class="w-[200px]">
            <USelect v-model="filters.status" :items="statusOptions" size="sm" />
          </UFormGroup>

          <UFormGroup label="Registros" size="sm" class="w-[140px]">
            <USelect v-model="filters.perPage" :items="perPageOptions" size="sm" />
          </UFormGroup>

          <div class="flex items-center gap-2 pb-1">
            <UButton
              size="sm"
              color="neutral"
              variant="outline"
              icon="i-lucide-refresh-cw"
              :loading="loading"
              @click="refresh()"
            >
              Actualizar
            </UButton>

            <UButton size="sm" color="primary" icon="i-lucide-plus" @click="openCreate()">
              Nuevo
            </UButton>
          </div>
        </div>

        <div class="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <span>
            Mostrando <span class="font-semibold text-gray-700 dark:text-gray-200">{{ rowsFiltered.length }}</span>
            de <span class="font-semibold text-gray-700 dark:text-gray-200">{{ rows.length }}</span>
          </span>
          <span class="text-gray-300 dark:text-gray-700">•</span>
          <span
            class="inline-flex items-center rounded-full border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/30 px-2 py-0.5"
          >
            Sin monto: <span class="ml-1 font-semibold text-gray-700 dark:text-gray-200">{{ missingAmountCount }}</span>
          </span>
          <span
            class="inline-flex items-center rounded-full border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/30 px-2 py-0.5"
          >
            Inactivos:
            <span class="ml-1 font-semibold text-gray-700 dark:text-gray-200">{{ inactiveCount }}</span>
          </span>
        </div>

      </div>

    <DataState
      :loading="loading"
      :error="isError"
      :error-message="errorMessage"
      @retry="refresh()"
    >
      <div class="border-t border-gray-200 dark:border-gray-800">
        <div class="h-[650px] overflow-auto">
          <UTable
            sticky
            :data="rowsFiltered"
            :columns="columns"
            :loading="loading"
            :ui="tableUi"
            :meta="tableMeta"
            empty="Sin registros"
          />
        </div>

      </div>
    </DataState>

    <UModal v-model:open="isModalOpen" :title="modalTitle">
      <template #content>
        <div class="space-y-4 p-4">
          <div
            v-if="editingMeta"
            class="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-900/30 p-3"
          >
            <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div class="min-w-0">
                  <div class="text-xs font-medium tracking-wide text-gray-500 dark:text-gray-400">
                  {{ editingMeta.id != null ? 'Editando' : 'Asignando monto' }}
                  </div>
                  <div class="mt-0.5 truncate text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {{ editingMeta.full_name }}
                  </div>
                <div class="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                  Código: <span class="font-mono font-semibold text-gray-700 dark:text-gray-200">{{ editingMeta.emp_code }}</span>
                </div>
              </div>

              <div class="flex flex-wrap items-center justify-start sm:justify-end gap-1.5">
                <span
                  v-if="editingMeta.id != null"
                  class="inline-flex items-center rounded-full border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/40 px-2 py-0.5 text-xs font-medium text-gray-700 dark:text-gray-200"
                >
                  Movilidad #{{ editingMeta.id }}
                </span>
                <span
                  v-else
                  class="inline-flex items-center rounded-full border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/40 px-2 py-0.5 text-xs font-medium text-gray-700 dark:text-gray-200"
                >
                  Sin registro
                </span>
                <span
                  class="inline-flex items-center rounded-full border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/40 px-2 py-0.5 text-xs font-medium text-gray-700 dark:text-gray-200"
                >
                  Empleado ID #{{ editingMeta.employee_id }}
                </span>
              </div>
            </div>
          </div>

          <div v-if="!editingMeta" class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <UFormGroup label="Empleado ID" size="sm" required>
              <div class="space-y-1">
                <UInput
                  v-model="form.employee_id"
                  type="text"
                  inputmode="numeric"
                  placeholder="Ej: 123"
                  size="sm"
                />
                <p class="text-xs text-gray-500 dark:text-gray-400">Requerido para crear</p>
              </div>
            </UFormGroup>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <UFormGroup label="Año" size="sm" required>
              <UInput
                v-model="form.year"
                type="text"
                inputmode="numeric"
                placeholder="2000..2100"
                size="sm"
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
import {
  createEmployeeMobility,
  getApiErrorMessage,
  isApiValidationError,
  listEmployeeMobility,
  updateEmployeeMobility,
  type EmployeeMobilityCreatePayload,
  type EmployeeMobilityRow,
} from '~/services/employeeMobility'

const toast = useToast()

const filters = reactive({
  search: '',
  year: '' as string | number,
  employeeId: '' as string | number,
  status: 'all' as 'all' | 'active' | 'inactive' | 'missing_amount',
  perPage: 50 as number,
})

const statusOptions = [
  { label: 'Todos', value: 'all' },
  { label: 'Activos', value: 'active' },
  { label: 'Inactivos', value: 'inactive' },
  { label: 'Sin monto', value: 'missing_amount' },
]

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

const isMissingAmount = (row: EmployeeMobilityRow) => row.amount === null || row.amount === undefined || row.amount === ''

const rowsFiltered = computed(() => {
  const q = String(filters.search || '').trim().toLowerCase()
  let list = rows.value

  if (q) {
    list = list.filter((r) => {
      const empCode = String(r.emp_code || '').toLowerCase()
      const firstName = String(r.first_name || '').toLowerCase()
      const lastName = String(r.last_name || '').toLowerCase()
      const fullName = `${firstName} ${lastName}`.trim()
      return empCode.includes(q) || firstName.includes(q) || lastName.includes(q) || fullName.includes(q)
    })
  }

  if (filters.status === 'active') {
    list = list.filter((r) => r.is_active === true)
  } else if (filters.status === 'inactive') {
    list = list.filter((r) => r.is_active === false)
  } else if (filters.status === 'missing_amount') {
    list = list.filter((r) => isMissingAmount(r))
  }

  return list
})

const missingAmountCount = computed(() => rowsFiltered.value.filter(isMissingAmount).length)
const inactiveCount = computed(() => rowsFiltered.value.filter((r) => r.is_active === false).length)

const tableUi = {
  base: 'table-fixed border-separate border-spacing-0',
  thead: '[&>tr]:bg-elevated/50 [&>tr]:after:content-none',
  tbody: '[&>tr]:last:[&>td]:border-b-0',
  tr: 'transition-colors hover:bg-[#eef4ff]/60 dark:hover:bg-[#13203a]',
  th: 'py-2 px-3 text-xs font-semibold text-[#39569a] dark:text-[#b8c7f7] border-y border-default first:border-l last:border-r first:rounded-l-lg last:rounded-r-lg',
  td: 'px-3 py-2 text-sm border-b border-default',
  separator: 'h-0',
} as const

const tableMeta = {
  class: {
    tr: (row: any) =>
      row?.original?.is_active === false
        ? 'bg-red-50 dark:bg-red-950/25 hover:bg-red-100 dark:hover:bg-red-950/35'
        : '',
  },
} as const

const UButton = resolveComponent('UButton')
const UIcon = resolveComponent('UIcon')

const toNumberOrUndefined = (value: unknown) => {
  if (value === '' || value === null || value === undefined) return undefined
  const n = Number(String(value).trim())
  return Number.isFinite(n) ? n : undefined
}

const refresh = async () => {
  loading.value = true
  isError.value = false
  errorMessage.value = 'No se pudieron cargar los montos de movilidad.'

  try {
    const year = toNumberOrUndefined(filters.year)
    const per_page = toNumberOrUndefined(filters.perPage) ?? 50
    const employee_id = toNumberOrUndefined(filters.employeeId)

    const res = await listEmployeeMobility({
      year,
      employee_id,
      per_page,
      paginate: false,
    })

    rows.value = (res as any).data ?? []
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

onMounted(() => {
  refresh()
})

const formatMoney = (value: EmployeeMobilityRow['amount']) => {
  if (value === null || value === undefined || value === '') return ''
  const n = Number(value)
  if (Number.isFinite(n)) return n.toFixed(2)
  return String(value ?? '')
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
  {
    id: 'org',
    header: 'Área / Cargo',
    cell: ({ row }) => {
      const r = row.original
      return h('div', { class: 'text-xs' }, [
        h('div', { class: 'truncate text-[#2d5fc0] dark:text-[#9cb7f5]' }, r.department_name || '—'),
        h('div', { class: 'truncate text-[11px] text-gray-500 dark:text-gray-400' }, r.position_name || '—'),
      ])
    },
  },
  { accessorKey: 'year', header: 'Año', cell: ({ row }) => row.getValue('year') },
  {
    accessorKey: 'amount',
    header: 'Monto',
    cell: ({ row }) => {
      const original = row.original
      if (isMissingAmount(original)) {
        return h('span', { class: 'text-xs text-gray-500 dark:text-gray-400' }, 'Sin asignar')
      }
      return h('span', { class: 'font-mono tabular-nums' }, formatMoney(original.amount as any))
    },
  },
  {
    id: 'has_mobility',
    header: 'Movilidad',
    cell: ({ row }) => {
      const r = row.original
      const has = r.has_mobility === true || r.id != null
      return h(
        'span',
        { class: has ? 'text-xs font-medium text-emerald-700 dark:text-emerald-300' : 'text-xs text-gray-500 dark:text-gray-400' },
        has ? 'Sí' : 'No'
      )
    },
  },
  {
    id: 'actions',
    header: 'Acciones',
    cell: ({ row }) => {
      const original = row.original
      const needsAssign = original.id == null || isMissingAmount(original) || original.has_mobility === false

      return h(
        UButton,
        {
          size: 'xs',
          color: 'neutral',
          variant: 'outline',
          onClick: () => openEdit(original),
        },
        () => [
          h(UIcon, { name: needsAssign ? 'i-lucide-plus' : 'i-lucide-pencil', class: 'w-3.5 h-3.5 mr-1.5' }),
          needsAssign ? 'Asignar' : 'Editar',
        ]
      )
    },
  },
]

const isModalOpen = ref(false)
const saving = ref(false)
const editingId = ref<number | null>(null)
const editingMeta = ref<null | {
  id: number | null
  employee_id: number
  emp_code: string
  full_name: string
}>(null)
const formError = ref<string | null>(null)

const form = reactive<EmployeeMobilityCreatePayload>({
  employee_id: 0,
  year: new Date().getFullYear(),
  amount: 0,
})

const modalTitle = computed(() => {
  if (editingId.value) return 'Editar monto (Movilidad)'
  if (editingMeta.value) return 'Asignar monto (Movilidad)'
  return 'Nuevo monto (Movilidad)'
})

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
  if (row.id == null) {
    editingId.value = null
    editingMeta.value = {
      id: null,
      employee_id: row.employee_id,
      emp_code: row.emp_code,
      full_name: `${row.first_name ?? ''} ${row.last_name ?? ''}`.trim(),
    }
    form.employee_id = Number(row.employee_id)
    form.year = Number(row.year) || (toNumberOrUndefined(filters.year) ?? new Date().getFullYear())
    form.amount = Number(row.amount) || 0
    formError.value = null
    isModalOpen.value = true
    return
  }

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
    const payload: EmployeeMobilityCreatePayload = {
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
    await refresh()
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
