<template>
  <div>
    <div>
      <div>
        <AppTabs
          v-model="statusTabModel"
          aria-label="Tabs de estado BioTime"
          size="sm"
          :items="statusTabItems"
        />
      </div>

      <div class="mt-4 mb-4">
        <UInput
          v-model="filters.q"
          placeholder="Buscar por tecnico, DNI, agencia o cliente..."
          size="md"
          icon="i-lucide-search"
          class="w-full"
          :ui="{ base: 'rounded-xl' }"
          @keydown.enter.prevent="refresh()"
        />
      </div>
    </div>

    <DataState :loading="loading" :error="isError" :error-message="errorMessage" @retry="refresh()">
      <div class="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800">
        <div class="h-[650px] overflow-auto">
          <UTable
            sticky
            :data="sortedEmployees"
            :columns="columns"
            :loading="loading"
            :ui="tableUi"
            :meta="tableMeta"
            empty="Sin registros"
          />
        </div>
      </div>

      <div class="mt-3 flex items-center text-xs text-gray-500 dark:text-gray-400">
        <span>
          Mostrando <span class="font-semibold text-gray-700 dark:text-gray-200">{{ sortedEmployees.length }}</span>
          registros
        </span>
      </div>

    </DataState>

    <UModal v-model:open="isModalOpen" :title="modalTitle">
      <template #content>
        <div class="space-y-4 p-4">
          <div
            v-if="editing"
            class="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-900/30 p-3"
          >
            <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div class="min-w-0">
                <div class="text-xs font-medium tracking-wide text-gray-500 dark:text-gray-400">Editando</div>
                <div class="mt-0.5 truncate text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {{ editing.full_name }}
                </div>
                <div class="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                  Código:
                  <span class="font-mono font-semibold text-gray-700 dark:text-gray-200">{{ editing.emp_code }}</span>
                </div>
              </div>
              <div class="flex flex-wrap items-center justify-start sm:justify-end gap-1.5">
                <span class="inline-flex items-center rounded-full border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/40 px-2 py-0.5 text-xs font-medium text-gray-700 dark:text-gray-200">
                  ID #{{ editing.id }}
                </span>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <UFormGroup label="Código" size="sm" required>
              <UInput v-model="form.emp_code" size="sm" placeholder="Ej: 47029459" />
            </UFormGroup>

            <UFormGroup label="Estado" size="sm">
              <USelect v-model="form.status" :items="statusEditOptions" size="sm" />
            </UFormGroup>

            <UFormGroup label="Pago movilidad" size="sm" class="sm:col-span-2">
              <div
                class="flex items-center justify-between gap-3 rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2"
              >
                <div class="min-w-0">
                  <div class="text-sm font-medium text-gray-900 dark:text-gray-100">Considerar pago de movilidad</div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">Activa si el empleado recibe monto de movilidad.</div>
                </div>
                <USwitch v-model="form.has_mobility" />
              </div>
            </UFormGroup>

            <UFormGroup label="Nombres" size="sm" required>
              <UInput v-model="form.first_name" size="sm" placeholder="Ej: Carlos" />
            </UFormGroup>

            <UFormGroup label="Apellidos" size="sm" required>
              <UInput v-model="form.last_name" size="sm" placeholder="Ej: Silva" />
            </UFormGroup>

            <UFormGroup label="Email" size="sm">
              <UInput v-model="form.email" size="sm" placeholder="correo@dominio.com" />
            </UFormGroup>

            <UFormGroup label="Móvil" size="sm">
              <UInput v-model="form.mobile" size="sm" placeholder="+51..." />
            </UFormGroup>

            <UFormGroup label="Ciudad" size="sm">
              <UInput v-model="form.city" size="sm" placeholder="Lima" />
            </UFormGroup>

            <UFormGroup label="Departamento ID" size="sm">
              <UInput v-model="form.department_id" size="sm" type="text" inputmode="numeric" placeholder="Ej: 12" />
            </UFormGroup>

            <UFormGroup label="Cargo ID" size="sm">
              <UInput v-model="form.position_id" size="sm" type="text" inputmode="numeric" placeholder="Ej: 3" />
            </UFormGroup>
          </div>

          <div
            v-if="formError"
            class="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-md p-3"
          >
            {{ formError }}
          </div>

          <div class="flex justify-end gap-2">
            <UButton color="neutral" variant="outline" size="sm" @click="isModalOpen = false">
              Cancelar
            </UButton>
            <UButton color="primary" size="sm" :loading="saving" :disabled="saving" @click="save()">
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
  getApiErrorMessage,
  isApiValidationError,
  listBioTimePersonnelEmployees,
  updateBioTimePersonnelEmployee,
  type BioTimePersonnelEmployee,
  type UpdateBioTimePersonnelEmployeePayload,
} from '~/services/biotimePersonnelEmployees'

const toast = useToast()

const statusTab = ref<'active' | 'inactive'>('active')
const statusCounts = reactive({
  active: 0,
  inactive: 0,
})

const statusTabItems = computed(() => [
  { label: 'Activos', value: 'active', badge: statusCounts.active },
  { label: 'Inactivos', value: 'inactive', badge: statusCounts.inactive },
])

const statusTabModel = computed<'active' | 'inactive'>({
  get: () => statusTab.value,
  set: (tab) => {
    statusTab.value = tab
    refresh()
  },
})

const filters = reactive({
  q: '',
})

const statusEditOptions = [
  { label: 'Activo (0)', value: 0 },
  { label: 'Inactivo (100)', value: 100 },
]

const loading = ref(false)
const isError = ref(false)
const errorMessage = ref('No se pudieron cargar los empleados BioTime.')

const employees = ref<BioTimePersonnelEmployee[]>([])

const refresh = async () => {
  loading.value = true
  isError.value = false
  errorMessage.value = 'No se pudieron cargar los empleados BioTime.'

  try {
    const department_id = undefined
    const position_id = undefined
    const per_page = 25
    const q = String(filters.q || '').trim() || undefined
    const status = statusTab.value === 'active' ? 0 : 100

    const [res, activeCountRes, inactiveCountRes] = await Promise.all([
      listBioTimePersonnelEmployees({
        q,
        department_id,
        position_id,
        status,
        paginate: false,
        per_page,
      }),
      listBioTimePersonnelEmployees({
        q,
        department_id,
        position_id,
        status: 0,
        paginate: true,
        per_page: 1,
        page: 1,
      }),
      listBioTimePersonnelEmployees({
        q,
        department_id,
        position_id,
        status: 100,
        paginate: true,
        per_page: 1,
        page: 1,
      }),
    ])

    employees.value = (res as any).data ?? []
    statusCounts.active = Number((activeCountRes as any)?.data?.total ?? 0)
    statusCounts.inactive = Number((inactiveCountRes as any)?.data?.total ?? 0)
  } catch (error: unknown) {
    isError.value = true
    errorMessage.value = getApiErrorMessage(error)
    statusCounts.active = 0
    statusCounts.inactive = 0
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  refresh()
})

const UButton = resolveComponent('UButton')
const UIcon = resolveComponent('UIcon')
const UBadge = resolveComponent('UBadge')

type SortDirection = 'asc' | 'desc'
type SortKey = 'emp_code' | 'full_name' | 'contact' | 'org' | 'has_mobility' | 'status'

const sortKey = ref<SortKey>('emp_code')
const sortDirection = ref<SortDirection>('asc')

const toggleSort = (key: SortKey) => {
  if (sortKey.value === key) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
    return
  }

  sortKey.value = key
  sortDirection.value = 'asc'
}

const getSortIcon = (key: SortKey) => {
  if (sortKey.value !== key) return 'i-lucide-arrow-up-down'
  return sortDirection.value === 'asc' ? 'i-lucide-arrow-up' : 'i-lucide-arrow-down'
}

const getSortButtonClass = (key: SortKey) => {
  const base =
    'group inline-flex w-full items-center gap-1 text-left text-[11px] font-semibold uppercase tracking-wider text-white/90 transition-colors hover:text-white'
  return sortKey.value === key ? `${base} text-white` : base
}

const normalizeForSort = (value: unknown) =>
  String(value ?? '')
    .trim()
    .toLocaleLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

const getEmployeeSortValue = (row: BioTimePersonnelEmployee, key: SortKey): string | number => {
  switch (key) {
    case 'emp_code':
      return normalizeForSort(row.emp_code)
    case 'full_name':
      return normalizeForSort(`${row.first_name ?? ''} ${row.last_name ?? ''}`)
    case 'contact':
      return normalizeForSort(`${row.email ?? ''} ${row.mobile ?? ''}`)
    case 'org':
      return normalizeForSort(`${row.department_name ?? ''} ${row.position_name ?? ''}`)
    case 'has_mobility':
      return row.has_mobility ? 1 : 0
    case 'status':
      return Number(row.status ?? 0)
    default:
      return ''
  }
}

const compareSortValues = (a: string | number, b: string | number) => {
  if (typeof a === 'number' && typeof b === 'number') return a - b
  return String(a).localeCompare(String(b), 'es', { numeric: true, sensitivity: 'base' })
}

const sortedEmployees = computed(() => {
  const data = employees.value.slice()
  const multiplier = sortDirection.value === 'asc' ? 1 : -1

  data.sort((a, b) => {
    const av = getEmployeeSortValue(a, sortKey.value)
    const bv = getEmployeeSortValue(b, sortKey.value)
    return compareSortValues(av, bv) * multiplier
  })

  return data
})

const sortableHeader = (label: string, key: SortKey) => {
  return () =>
    h(
      'button',
      {
        type: 'button',
        class: getSortButtonClass(key),
        onClick: (event: MouseEvent) => {
          event.stopPropagation()
          toggleSort(key)
        },
      },
      [
        h('span', { class: 'truncate' }, label),
        h(UIcon, { name: getSortIcon(key), class: 'w-3 h-3 opacity-75 group-hover:opacity-100' }),
      ]
    )
}

const updatingStatusId = ref<number | null>(null)

const toggleStatus = async (row: BioTimePersonnelEmployee) => {
  if (updatingStatusId.value === row.id) return
  updatingStatusId.value = row.id

  const current = Number(row.status)
  const next = current === 0 ? 100 : 0
  try {
    await updateBioTimePersonnelEmployee(row.id, { status: next })
    await refresh()
    toast.add({
      title: next === 0 ? 'Activado' : 'Desactivado',
      description: `Empleado ${row.emp_code} actualizado.`,
      icon: 'i-lucide-check-circle',
      color: 'green',
      timeout: 2500,
    })
  } catch (error: unknown) {
    toast.add({
      title: 'Error',
      description: getApiErrorMessage(error),
      icon: 'i-lucide-alert-circle',
      color: 'error',
      timeout: 6000,
    })
  } finally {
    updatingStatusId.value = null
  }
}

const normalizePhone = (value: string | null | undefined) =>
  String(value ?? '').replace(/\D/g, '')

const resolveWhatsAppPhone = (row: BioTimePersonnelEmployee) => {
  const digits = normalizePhone(row.mobile)
  if (!digits) return ''
  if (digits.startsWith('51')) return digits
  if (digits.length === 9) return `51${digits}`
  return digits
}

const hasValidMobile = (row: BioTimePersonnelEmployee) => Boolean(resolveWhatsAppPhone(row))

const sendWhatsApp = (row: BioTimePersonnelEmployee) => {
  const phone = resolveWhatsAppPhone(row)

  if (!phone) {
    toast.add({
      title: 'Sin numero',
      description: 'Este empleado no tiene un numero movil valido.',
      icon: 'i-lucide-alert-circle',
      color: 'error',
      timeout: 3500,
    })
    return
  }

  const fullName = `${row.first_name ?? ''} ${row.last_name ?? ''}`.trim() || row.emp_code
  const message = encodeURIComponent(`Hola ${fullName}, te escribimos desde RRHH.`)
  const url = `https://wa.me/${phone}?text=${message}`

  if (import.meta.client) {
    window.open(url, '_blank', 'noopener,noreferrer')
  }
}

const columns: TableColumn<BioTimePersonnelEmployee>[] = [
  {
    accessorKey: 'emp_code',
    header: sortableHeader('DNI', 'emp_code'),
    meta: { class: { th: 'w-[140px]', td: 'w-[140px]' } },
    cell: ({ row }) => h('span', { class: 'font-mono text-xs' }, String(row.getValue('emp_code') ?? '')),
  },
  {
    id: 'full_name',
    header: sortableHeader('Empleado', 'full_name'),
    meta: { class: { th: 'w-[260px]', td: 'w-[260px]' } },
    cell: ({ row }) => {
      const r = row.original
      const fullName = `${r.first_name ?? ''} ${r.last_name ?? ''}`.trim()
      return h('div', { class: 'min-w-0' }, [
        h('div', { class: 'truncate text-sm font-medium text-gray-900 dark:text-gray-100' }, fullName || '—'),
        h('div', { class: 'text-[11px] text-gray-500 dark:text-gray-400' }, `ID: ${r.id}`),
      ])
    },
  },
  {
    id: 'contact',
    header: sortableHeader('Contacto', 'contact'),
    meta: { class: { th: 'w-[260px]', td: 'w-[260px]' } },
    cell: ({ row }) => {
      const r = row.original
      const email = String(r.email ?? '').trim()
      const mobile = String(r.mobile ?? '').trim()
      if (!email && !mobile) return '—'
      return h('div', { class: 'text-xs text-gray-700 dark:text-gray-200' }, [
        h('div', { class: 'truncate' }, email || '—'),
        h('div', { class: 'text-[11px] text-gray-500 dark:text-gray-400' }, mobile || '—'),
      ])
    },
  },
  {
    id: 'org',
    header: sortableHeader('Área / Cargo', 'org'),
    meta: { class: { th: 'w-[220px]', td: 'w-[220px]' } },
    cell: ({ row }) => {
      const r = row.original
      return h('div', { class: 'text-xs' }, [
        h('div', { class: 'truncate text-gray-900 dark:text-gray-100' }, r.department_name || '—'),
        h('div', { class: 'truncate text-[11px] text-gray-500 dark:text-gray-400' }, r.position_name || '—'),
      ])
    },
  },
  {
    id: 'mobility',
    header: sortableHeader('Movilidad', 'has_mobility'),
    meta: { class: { th: 'w-[190px]', td: 'w-[190px]' } },
    cell: ({ row }) => {
      const enabled = Boolean(row.original.has_mobility)
      return h(
        UBadge,
        {
          color: 'neutral',
          variant: 'soft',
          size: 'sm',
          class: enabled
            ? 'rounded-full px-3 py-1 text-[11px] font-semibold ring-1 ring-emerald-200/70 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300 dark:ring-emerald-800/60'
            : 'rounded-full px-3 py-1 text-[11px] font-semibold ring-1 ring-slate-200/80 bg-slate-50 text-slate-600 dark:bg-slate-900/40 dark:text-slate-300 dark:ring-slate-700/70',
        },
        () => [
          h(UIcon, {
            name: enabled ? 'i-lucide-wallet' : 'i-lucide-ban',
            class: 'mr-1 h-3.5 w-3.5',
          }),
          enabled ? 'Recibe movilidad' : 'No recibe movilidad',
        ]
      )
    },
  },
  {
    id: 'active',
    header: sortableHeader('Estado', 'status'),
    meta: { class: { th: 'w-[150px]', td: 'w-[150px]' } },
    cell: ({ row }) => {
      const r = row.original
      const active = Number(r.status) === 0
      return h(
        UButton,
        {
          size: 'xs',
          color: (active ? 'success' : 'error') as any,
          variant: 'outline',
          loading: updatingStatusId.value === r.id,
          onClick: () => toggleStatus(r),
        },
        () => [
          h(UIcon, { name: active ? 'i-lucide-toggle-right' : 'i-lucide-toggle-left', class: 'w-3.5 h-3.5 mr-1.5' }),
          active ? 'Activo' : 'Inactivo',
        ]
      )
    },
  },
  {
    id: 'actions',
    header: 'Acciones',
    meta: { class: { th: 'w-[140px]', td: 'w-[140px]' } },
    cell: ({ row }) => {
      const hasMobile = hasValidMobile(row.original)

      return h('div', { class: 'flex items-center justify-center gap-2' }, [
        h(UButton, {
          size: 'xs',
          square: true,
          color: 'neutral',
          variant: 'outline',
          icon: 'i-lucide-square-pen',
          'aria-label': 'Editar empleado',
          onClick: () => openEdit(row.original),
        }),
        h(UButton, {
          size: 'xs',
          square: true,
          color: (hasMobile ? 'success' : 'error') as any,
          variant: 'outline',
          icon: 'i-simple-icons-whatsapp',
          'aria-label': 'Enviar WhatsApp',
          onClick: () => sendWhatsApp(row.original),
        }),
      ])
    },
  },
]

const tableUi = {
  base: 'table-fixed min-w-full border-separate border-spacing-0',
  thead: 'bg-[#2d5fc0] text-white',
  tbody: '[&>tr]:last:[&>td]:border-b-0',
  tr: 'transition-colors hover:bg-[#f7f9ff] dark:hover:bg-gray-900/60',
  th: 'px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-white',
  td: 'px-5 py-3 text-sm text-gray-700 dark:text-gray-200 align-top',
  separator: 'h-0',
} as const

const tableMeta = {
  class: {
    tr: (row: any) => {
      const original = row?.original as BioTimePersonnelEmployee | undefined
      if (!original) return ''

      const inactive = Number(original.status) === 100 || original.is_active === false
      const missingMobile = !hasValidMobile(original)

      return inactive || missingMobile
        ? 'bg-red-50 dark:bg-red-950/25 hover:bg-red-100 dark:hover:bg-red-950/35'
        : ''
    },
  },
} as const

const isModalOpen = ref(false)
const saving = ref(false)
const editing = ref<null | { id: number; emp_code: string; full_name: string }>(null)
const formError = ref<string | null>(null)

const form = reactive<UpdateBioTimePersonnelEmployeePayload>({
  emp_code: '',
  first_name: '',
  last_name: '',
  has_mobility: false,
  email: '',
  mobile: '',
  city: '',
  department_id: undefined,
  position_id: undefined,
  status: '',
})

const modalTitle = computed(() => (editing.value ? 'Editar empleado (BioTime)' : 'Editar'))

const openEdit = (row: BioTimePersonnelEmployee) => {
  editing.value = {
    id: row.id,
    emp_code: row.emp_code,
    full_name: `${row.first_name ?? ''} ${row.last_name ?? ''}`.trim(),
  }

  form.emp_code = row.emp_code ?? ''
  form.first_name = row.first_name ?? ''
  form.last_name = row.last_name ?? ''
  form.has_mobility = Boolean(row.has_mobility)
  form.email = row.email ?? ''
  form.mobile = row.mobile ?? ''
  form.city = row.city ?? ''
  form.department_id = row.department_id ?? undefined
  form.position_id = row.position_id ?? undefined
  form.status = (row.status as any) ?? ''
  formError.value = null
  isModalOpen.value = true
}

const save = async () => {
  if (!editing.value || saving.value) return
  formError.value = null
  saving.value = true

  try {
    const payload: UpdateBioTimePersonnelEmployeePayload = {
      emp_code: String(form.emp_code ?? '').trim(),
      first_name: String(form.first_name ?? '').trim(),
      last_name: String(form.last_name ?? '').trim(),
      has_mobility: Boolean(form.has_mobility),
      email: String(form.email ?? '').trim() || null,
      mobile: String(form.mobile ?? '').trim() || null,
      city: String(form.city ?? '').trim() || null,
      department_id: form.department_id === '' ? null : (form.department_id as any),
      position_id: form.position_id === '' ? null : (form.position_id as any),
      status: form.status === '' ? null : (form.status as any),
    }

    if (!payload.emp_code || !payload.first_name || !payload.last_name) {
      formError.value = 'Completa los campos requeridos.'
      return
    }

    const res = await updateBioTimePersonnelEmployee(editing.value.id, payload)
    const updated = (res as any).data ?? res

    employees.value = employees.value.map((r) => (r.id === editing.value!.id ? { ...r, ...updated } : r))

    toast.add({
      title: 'Actualizado',
      description: 'Empleado actualizado correctamente.',
      icon: 'i-lucide-check-circle',
      color: 'green',
      timeout: 2500,
    })

    isModalOpen.value = false
    editing.value = null
  } catch (error: unknown) {
    if (isApiValidationError(error) && error.errors) {
      const firstField = Object.keys(error.errors)[0]
      const firstMsg = firstField ? error.errors[firstField]?.[0] : undefined
      formError.value = firstMsg || error.message
      return
    }

    formError.value = getApiErrorMessage(error)
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
