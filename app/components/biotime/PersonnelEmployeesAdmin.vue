<template>
  <div>
    <div class="p-4 sm:p-5">
      <div class="mb-4 rounded-t-lg border border-gray-200 dark:border-gray-800 border-b-0 bg-white dark:bg-gray-950 overflow-hidden">
        <div class="flex border-b border-emerald-600">
          <button
            type="button"
            class="px-6 py-3 text-sm font-semibold uppercase tracking-wide"
            :class="statusTab === 'active'
              ? 'bg-emerald-600 text-white'
              : 'bg-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900/40'"
            @click="setStatusTab('active')"
          >
            Activos
          </button>
          <button
            type="button"
            class="px-6 py-3 text-sm font-semibold uppercase tracking-wide"
            :class="statusTab === 'inactive'
              ? 'bg-emerald-600 text-white'
              : 'bg-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900/40'"
            @click="setStatusTab('inactive')"
          >
            Inactivos
          </button>
          <div class="flex-1" />
        </div>
      </div>

      <div class="flex flex-wrap items-end gap-3">
        <UFormGroup label="Buscar" size="sm" class="w-full sm:w-[320px]">
          <UInput
            v-model="filters.q"
            placeholder="Código, nombre, email, móvil…"
            size="sm"
            icon="i-lucide-search"
            @keydown.enter.prevent="refresh()"
          />
        </UFormGroup>

        <UFormGroup label="Departamento ID" size="sm" class="w-[160px]">
          <UInput
            v-model="filters.departmentId"
            type="text"
            inputmode="numeric"
            placeholder="Ej: 12"
            size="sm"
            @keydown.enter.prevent="refresh()"
          />
        </UFormGroup>

        <UFormGroup label="Cargo ID" size="sm" class="w-[160px]">
          <UInput
            v-model="filters.positionId"
            type="text"
            inputmode="numeric"
            placeholder="Ej: 3"
            size="sm"
            @keydown.enter.prevent="refresh()"
          />
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
        </div>
      </div>

      <div class="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
        <span>
          Mostrando <span class="font-semibold text-gray-700 dark:text-gray-200">{{ employees.length }}</span>
          registros
        </span>
      </div>
    </div>

    <DataState :loading="loading" :error="isError" :error-message="errorMessage" @retry="refresh()">
      <div class="border-t border-gray-200 dark:border-gray-800">
        <div class="h-[650px] overflow-auto">
          <UTable
            sticky
            :data="employees"
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

const setStatusTab = (tab: 'active' | 'inactive') => {
  statusTab.value = tab
  refresh()
}

const filters = reactive({
  q: '',
  departmentId: '' as string | number,
  positionId: '' as string | number,
  perPage: 25 as number,
})

const statusEditOptions = [
  { label: 'Activo (0)', value: 0 },
  { label: 'Inactivo (100)', value: 100 },
]

const perPageOptions = [
  { label: '10', value: 10 },
  { label: '25', value: 25 },
  { label: '50', value: 50 },
  { label: '100', value: 100 },
]

const loading = ref(false)
const isError = ref(false)
const errorMessage = ref('No se pudieron cargar los empleados BioTime.')

const employees = ref<BioTimePersonnelEmployee[]>([])

const toNumberOrUndefined = (value: unknown) => {
  if (value === '' || value === null || value === undefined) return undefined
  const n = Number(String(value).trim())
  return Number.isFinite(n) ? n : undefined
}

const refresh = async () => {
  loading.value = true
  isError.value = false
  errorMessage.value = 'No se pudieron cargar los empleados BioTime.'

  try {
    const department_id = toNumberOrUndefined(filters.departmentId)
    const position_id = toNumberOrUndefined(filters.positionId)
    const per_page = toNumberOrUndefined(filters.perPage) ?? 25
    const status = statusTab.value === 'active' ? 0 : 100

    const res = await listBioTimePersonnelEmployees({
      q: String(filters.q || '').trim() || undefined,
      department_id,
      position_id,
      status,
      paginate: false,
      per_page,
    })

    employees.value = (res as any).data ?? []
  } catch (error: unknown) {
    isError.value = true
    errorMessage.value = getApiErrorMessage(error)
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

const columns: TableColumn<BioTimePersonnelEmployee>[] = [
  {
    accessorKey: 'emp_code',
    header: 'DNI',
    meta: { class: { th: 'w-[140px]', td: 'w-[140px]' } },
    cell: ({ row }) => h('span', { class: 'font-mono text-xs' }, String(row.getValue('emp_code') ?? '')),
  },
  {
    id: 'full_name',
    header: 'Empleado',
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
    header: 'Contacto',
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
    header: 'Área / Cargo',
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
    header: 'Movilidad',
    meta: { class: { th: 'w-[140px]', td: 'w-[140px]' } },
    cell: ({ row }) => {
      const enabled = Boolean(row.original.has_mobility)
      return h(
        UBadge,
        { color: (enabled ? 'success' : 'neutral') as any, variant: 'soft', size: 'xs' },
        () => (enabled ? 'Paga' : 'No paga')
      )
    },
  },
  {
    id: 'active',
    header: 'Estado',
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
    meta: { class: { th: 'w-[120px]', td: 'w-[120px]' } },
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

const tableUi = {
  base: 'table-fixed border-separate border-spacing-0',
  thead: '[&>tr]:bg-elevated/50 [&>tr]:after:content-none',
  tbody: '[&>tr]:last:[&>td]:border-b-0',
  tr: 'transition-colors hover:bg-gray-50 dark:hover:bg-gray-900/40',
  th: 'py-2 px-3 text-xs font-semibold text-gray-600 dark:text-gray-300 border-y border-default first:border-l last:border-r first:rounded-l-lg last:rounded-r-lg',
  td: 'px-3 py-2 text-sm border-b border-default align-top',
  separator: 'h-0',
} as const

const tableMeta = {
  class: {
    tr: (row: any) =>
      Number(row?.original?.status) === 100 || row?.original?.is_active === false
        ? 'bg-red-50 dark:bg-red-950/25 hover:bg-red-100 dark:hover:bg-red-950/35'
        : '',
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
