<script setup lang="ts">
definePageMeta({
  layout: 'support',
  middleware: 'auth',
})

useHead({
  title: 'Mesa de ayuda - Support Llamadas',
})

type CallType = 'consulta' | 'soporte' | 'reclamo'

type CallRecord = {
  user: string
  email: string
  motive: string
  query: string
  technician: string
  dateTime: string
  type: CallType
}

type PaginationToken = number | 'ellipsis'

const pageSizeOptions = [
  { label: '8', value: 8 },
  { label: '12', value: 12 },
  { label: '20', value: 20 },
]

const selectedPerPage = shallowRef(8)
const currentPage = shallowRef(1)
const search = shallowRef('')

const records: CallRecord[] = [
  {
    user: 'Emilio Arturo',
    email: 'demoemail@gmail.com',
    motive: 'CONTADORES',
    query: 'Se reitera al tecnico tener cuidado en el llenado de los informes tecnicos, sobre todo en colocar bien el valor de los contadores.',
    technician: 'Diaz Paz Anthony Manuel',
    dateTime: '29/10/2025, 15:10:50',
    type: 'consulta',
  },
  {
    user: 'Emilio Arturo',
    email: 'demoemail@gmail.com',
    motive: 'CONTADORES',
    query: 'Se recomienda al tecnico escribir correctamente el valor de los contadores ademas tomar foto de contador de los equipos. tecnico indica que por apuro ocaciono el error en la escritura y la foto salio movida (borrosa) haciendo dificil la lectura',
    technician: 'Chiuche Ccama Richard',
    dateTime: '27/10/2025, 15:31:45',
    type: 'consulta',
  },
  {
    user: 'Emilio Arturo',
    email: 'demoemail@gmail.com',
    motive: 'CONTADORES',
    query: 'Se recomienda al tecnico enviar correctamente las fotos de los contadores de los equipos en servicio quedo conforme.',
    technician: 'Perez Tolentino Arnulfo Wilfredo',
    dateTime: '22/10/2025, 15:15:21',
    type: 'consulta',
  },
  {
    user: 'Emilio Arturo',
    email: 'demoemail@gmail.com',
    motive: 'BBVA - CABLE RED',
    query: 'Consulta sobre la conexion de cable de equipo en ventanillas.',
    technician: 'Valle Astucuri Alex Raul',
    dateTime: '18/10/2025, 08:52:35',
    type: 'soporte',
  },
  {
    user: 'Emilio Arturo',
    email: 'demoemail@gmail.com',
    motive: 'CONTADORES',
    query: 'Se le indica al tecnico tener mas cuidado en el llenado del contador en sus informes fisicos',
    technician: 'Sutta Medina Giancarlo',
    dateTime: '13/10/2025, 15:42:59',
    type: 'consulta',
  },
  {
    user: 'Emilio Arturo',
    email: 'demoemail@gmail.com',
    motive: 'CONTADORES',
    query: 'Se recomienda al tecnico tomar foto del contador del equipo. queda conforme.',
    technician: 'Aroni Carrera Manuel Augusto',
    dateTime: '13/10/2025, 09:38:29',
    type: 'consulta',
  },
  {
    user: 'Emilio Arturo',
    email: 'demoemail@gmail.com',
    motive: 'CONTADORES',
    query: 'Se recomienda al tecnico enviar foto del contador del equipo. queda conforme.',
    technician: 'Chiuche Ccama Richard',
    dateTime: '13/10/2025, 09:35:49',
    type: 'consulta',
  },
  {
    user: 'Emilio Arturo',
    email: 'demoemail@gmail.com',
    motive: 'CONTADORES',
    query: 'Se recomienda al tecnico tomar foto al contador de los equipos atendidos',
    technician: 'Santillan Huaman Randal Jampier',
    dateTime: '10/10/2025, 14:27:14',
    type: 'consulta',
  },
  {
    user: 'Jorge Luis',
    email: 'jorge.luis@demo.com',
    motive: 'AGENDA',
    query: 'Se confirma disponibilidad para la siguiente visita tecnica.',
    technician: 'Diaz Paz Anthony Manuel',
    dateTime: '09/10/2025, 11:21:07',
    type: 'soporte',
  },
  {
    user: 'Carlos Alberto',
    email: 'carlos.alberto@demo.com',
    motive: 'RECLAMO',
    query: 'Cliente solicita revisar una demora en el cierre del caso anterior.',
    technician: 'Perez Tolentino Arnulfo Wilfredo',
    dateTime: '08/10/2025, 09:04:55',
    type: 'reclamo',
  },
  {
    user: 'Miguel Gonzalo',
    email: 'miguel.gonzalo@demo.com',
    motive: 'SOPORTE',
    query: 'Se programo seguimiento para validar la configuracion del equipo.',
    technician: 'Sutta Medina Giancarlo',
    dateTime: '06/10/2025, 17:18:32',
    type: 'soporte',
  },
  {
    user: 'Ana Paula',
    email: 'ana.paula@demo.com',
    motive: 'CONTADORES',
    query: 'Se dejo registro de la verificacion de contadores y fotos correctas.',
    technician: 'Valle Astucuri Alex Raul',
    dateTime: '05/10/2025, 13:01:11',
    type: 'consulta',
  },
]

function normalizeText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

const filteredRecords = computed(() => {
  const query = normalizeText(search.value.trim())

  if (!query) {
    return records
  }

  return records.filter((record) => {
    const searchable = [
      record.user,
      record.email,
      record.motive,
      record.query,
      record.technician,
      record.dateTime,
      record.type,
    ]

    return searchable.some(item => normalizeText(item).includes(query))
  })
})

const pageCount = computed(() =>
  Math.max(1, Math.ceil(filteredRecords.value.length / selectedPerPage.value)),
)

const paginatedRecords = computed(() => {
  const start = (currentPage.value - 1) * selectedPerPage.value

  return filteredRecords.value.slice(start, start + selectedPerPage.value)
})

const showingFrom = computed(() => {
  if (!filteredRecords.value.length) {
    return 0
  }

  return (currentPage.value - 1) * selectedPerPage.value + 1
})

const showingTo = computed(() =>
  Math.min(currentPage.value * selectedPerPage.value, filteredRecords.value.length),
)

const paginationItems = computed<PaginationToken[]>(() => {
  const total = pageCount.value
  const current = currentPage.value

  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1)
  }

  if (current <= 3) {
    return [1, 2, 3, 4, 5, 'ellipsis', total]
  }

  if (current >= total - 2) {
    return [1, 'ellipsis', total - 4, total - 3, total - 2, total - 1, total]
  }

  return [1, 'ellipsis', current - 1, current, current + 1, 'ellipsis', total]
})

function goToPage(page: number) {
  currentPage.value = Math.min(Math.max(page, 1), pageCount.value)
}

watch([search, selectedPerPage], () => {
  currentPage.value = 1
})

watch(pageCount, (count) => {
  if (currentPage.value > count) {
    currentPage.value = count
  }
}, { immediate: true })

const typeLabel: Record<CallType, string> = {
  consulta: 'Consulta',
  soporte: 'Soporte',
  reclamo: 'Reclamo',
}

const typeColor: Record<CallType, 'primary' | 'success' | 'warning'> = {
  consulta: 'warning',
  soporte: 'primary',
  reclamo: 'warning',
}
</script>

<template>
  <SupportPageShell
    panel-id="support-llamadas"
    title="Mesa de ayuda"
    subtitle="Resumen operativo del soporte"
    subtitle-icon="i-lucide-lifebuoy"
    :show-icon="false"
    :show-notifications="true"
    :notification-count="4"
    :notification-shortcuts="['N']"
  >
    <section class="overflow-hidden rounded-[1.8rem] border border-gray-200/80 bg-white shadow-[0_18px_40px_-28px_rgba(15,23,42,0.28)] dark:border-gray-800 dark:bg-gray-950">
      <div class="border-b border-gray-200/80 px-5 py-5 dark:border-gray-800">
        <div class="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div class="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
            <span class="font-medium text-gray-600 dark:text-gray-400">Mostrar</span>
            <USelectMenu
              v-model="selectedPerPage"
              :items="pageSizeOptions"
              :search-input="false"
              :ignoreFilter="true"
              value-key="value"
              class="w-20"
              size="sm"
            />
            <span class="font-medium text-gray-600 dark:text-gray-400">registros</span>
          </div>

          <div class="flex flex-1 flex-col gap-3 xl:flex-row xl:items-center xl:justify-end">
            <UInput
              v-model="search"
              icon="i-lucide-search"
              placeholder="Buscar..."
              class="w-full xl:w-72"
            />

            <div class="flex flex-wrap items-center gap-2">
              <UButton
                color="neutral"
                variant="outline"
                icon="i-lucide-download"
                class="rounded-full px-4"
              >
                Download
              </UButton>

              <UButton
                color="primary"
                variant="solid"
                icon="i-lucide-plus"
                :trailing="true"
                class="rounded-full px-4 shadow-sm shadow-blue-500/20"
              >
                Nuevo Registro
              </UButton>
            </div>
          </div>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-[1320px] w-full border-separate border-spacing-0">
          <thead>
            <tr class="bg-gray-50/90 dark:bg-gray-900/70">
              <th class="border-b border-gray-200/80 px-5 py-4 text-left text-[11px] font-bold uppercase tracking-[0.18em] text-gray-500 dark:border-gray-800 dark:text-gray-400">
                Usuario
              </th>
              <th class="border-b border-gray-200/80 px-5 py-4 text-left text-[11px] font-bold uppercase tracking-[0.18em] text-gray-500 dark:border-gray-800 dark:text-gray-400">
                Motivo
              </th>
              <th class="border-b border-gray-200/80 px-5 py-4 text-left text-[11px] font-bold uppercase tracking-[0.18em] text-gray-500 dark:border-gray-800 dark:text-gray-400">
                Consulta
              </th>
              <th class="border-b border-gray-200/80 px-5 py-4 text-left text-[11px] font-bold uppercase tracking-[0.18em] text-gray-500 dark:border-gray-800 dark:text-gray-400">
                Tecnico
              </th>
              <th class="border-b border-gray-200/80 px-5 py-4 text-left text-[11px] font-bold uppercase tracking-[0.18em] text-gray-500 dark:border-gray-800 dark:text-gray-400">
                Fecha y Hora
              </th>
              <th class="border-b border-gray-200/80 px-5 py-4 text-left text-[11px] font-bold uppercase tracking-[0.18em] text-gray-500 dark:border-gray-800 dark:text-gray-400">
                Tipo
              </th>
              <th class="border-b border-gray-200/80 px-5 py-4 text-center text-[11px] font-bold uppercase tracking-[0.18em] text-gray-500 dark:border-gray-800 dark:text-gray-400">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="record in paginatedRecords"
              :key="`${record.user}-${record.dateTime}-${record.technician}`"
              class="transition-colors odd:bg-white even:bg-gray-50/50 hover:bg-blue-50/50 dark:odd:bg-gray-950 dark:even:bg-gray-900/40 dark:hover:bg-blue-950/20"
            >
              <td class="border-b border-gray-100 px-5 py-4 text-sm text-gray-800 dark:border-gray-800 dark:text-gray-200">
                <div class="space-y-0.5">
                  <p class="font-semibold">
                    {{ record.user }}
                  </p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    {{ record.email }}
                  </p>
                </div>
              </td>

              <td class="border-b border-gray-100 px-5 py-4 text-sm font-medium text-[#2d5fc0] dark:border-gray-800">
                {{ record.motive }}
              </td>

              <td class="border-b border-gray-100 px-5 py-4 text-sm text-gray-700 dark:border-gray-800 dark:text-gray-300">
                <p class="max-w-[620px] leading-6">
                  {{ record.query }}
                </p>
              </td>

              <td class="border-b border-gray-100 px-5 py-4 text-sm text-gray-800 dark:border-gray-800 dark:text-gray-200">
                <div class="max-w-[180px] leading-6 font-medium">
                  {{ record.technician }}
                </div>
              </td>

              <td class="border-b border-gray-100 px-5 py-4 text-sm text-gray-800 dark:border-gray-800 dark:text-gray-200">
                <div class="max-w-[120px] leading-6">
                  {{ record.dateTime }}
                </div>
              </td>

              <td class="border-b border-gray-100 px-5 py-4 text-sm dark:border-gray-800">
                <UBadge
                  :color="typeColor[record.type]"
                  variant="soft"
                  class="rounded-full px-3 py-1 font-semibold"
                >
                  {{ typeLabel[record.type] }}
                </UBadge>
              </td>

              <td class="border-b border-gray-100 px-5 py-4 dark:border-gray-800">
                <div class="flex items-center justify-center gap-1">
                  <UButton
                    color="neutral"
                    variant="ghost"
                    icon="i-lucide-pencil"
                    class="rounded-full"
                    aria-label="Editar"
                  />
                  <UButton
                    color="neutral"
                    variant="ghost"
                    icon="i-lucide-trash-2"
                    class="rounded-full"
                    aria-label="Eliminar"
                  />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="flex flex-col gap-4 border-t border-gray-200/80 px-5 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-gray-800">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Mostrando {{ showingFrom }} a {{ showingTo }} de {{ filteredRecords.length }} registros
        </p>

        <div v-if="pageCount > 1" class="flex flex-wrap items-center gap-1.5">
          <UButton
            color="neutral"
            variant="outline"
            label="Previous"
            icon="i-lucide-chevron-left"
            :disabled="currentPage === 1"
            class="h-10 rounded-lg px-4"
            @click="goToPage(currentPage - 1)"
          />

          <template v-for="item in paginationItems" :key="`${item}`">
            <span
              v-if="item === 'ellipsis'"
              class="flex h-10 min-w-10 items-center justify-center px-2 text-sm font-semibold text-gray-400 dark:text-gray-500"
            >
              ...
            </span>

            <UButton
              v-else
              :label="String(item)"
              :color="item === currentPage ? 'primary' : 'neutral'"
              :variant="item === currentPage ? 'solid' : 'outline'"
              class="h-10 min-w-10 rounded-lg px-3"
              @click="goToPage(item)"
            />
          </template>

          <UButton
            color="neutral"
            variant="outline"
            label="Next"
            :trailing="true"
            icon="i-lucide-chevron-right"
            :disabled="currentPage === pageCount"
            class="h-10 rounded-lg px-4"
            @click="goToPage(currentPage + 1)"
          />
        </div>
      </div>
    </section>
  </SupportPageShell>
</template>
