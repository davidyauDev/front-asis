<script setup lang="ts">
definePageMeta({
  layout: 'support',
  middleware: 'auth',
})

useHead({
  title: 'Mesa de ayuda - Modelos',
})

type ModelRecord = {
  equipo: string
  ingACargo: string
  asistente1: string
  asistente2: string
}

type PaginationToken = number | 'ellipsis'

const perPageOptions = [
  { label: '10', value: 10 },
  { label: '15', value: 15 },
  { label: '20', value: 20 },
]

const selectedPerPage = shallowRef(10)
const currentPage = shallowRef(1)
const search = shallowRef('')

const equipos = [
  'MAGNER 165',
  'SC 303',
  'SC 360',
  'MAGNER 2000',
  'KISAN K5-A',
  'NEWTON III',
  'MAGNER 915',
  'CIMA 7016',
  'MAGNER 175',
  'SC CDS9',
]

const ingACargo = [
  'Félix Manuel Galagarza Gutierrez',
  'Ricardo Alberto Zumaeta Peralta',
  'Juan Carlos Angel Asencio Méndez',
  'Jorge Luis Chavez Torres',
  'Carlos Joal Silva Salazar',
]

const asistentes1 = [
  'Juan Carlos Angel Asencio Méndez',
  'Eduardo Lopez Tanta',
  'Félix Manuel Galagarza Gutierrez',
  'Carlos Joal Silva Salazar',
  '---',
]

const asistentes2 = [
  'Nestor Erasmo Ramos Huillca',
  'Carlos Haderly Meza Baldera',
  'John Alexys Gonzales Villanueva',
  'Eduardo Lopez Tanta',
  '---',
]

const models = Array.from({ length: 60 }, (_, index): ModelRecord => ({
  equipo: equipos[index % equipos.length]!,
  ingACargo: ingACargo[index % ingACargo.length]!,
  asistente1: asistentes1[index % asistentes1.length]!,
  asistente2: asistentes2[index % asistentes2.length]!,
}))

function normalizeText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

const filteredModels = computed(() => {
  const query = normalizeText(search.value.trim())

  if (!query) {
    return models
  }

  return models.filter((model) => {
    const searchable = [
      model.equipo,
      model.ingACargo,
      model.asistente1,
      model.asistente2,
    ]

    return searchable.some(item => normalizeText(item).includes(query))
  })
})

const pageCount = computed(() =>
  Math.max(1, Math.ceil(filteredModels.value.length / selectedPerPage.value)),
)

const paginatedModels = computed(() => {
  const start = (currentPage.value - 1) * selectedPerPage.value

  return filteredModels.value.slice(start, start + selectedPerPage.value)
})

const showingFrom = computed(() => {
  if (!filteredModels.value.length) {
    return 0
  }

  return (currentPage.value - 1) * selectedPerPage.value + 1
})

const showingTo = computed(() =>
  Math.min(currentPage.value * selectedPerPage.value, filteredModels.value.length),
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
</script>

<template>
  <SupportPageShell
    panel-id="support-models"
    title="Modelos"
    subtitle="Gestion de Responsables por Modelo"
    badge="Borrador"
  >
    <section class="overflow-hidden rounded-[1.8rem] border border-gray-200/80 bg-white shadow-[0_18px_40px_-28px_rgba(15,23,42,0.28)] dark:border-gray-800 dark:bg-gray-950">
      <div class="border-b border-gray-200/80 px-5 py-5 dark:border-gray-800">
        <div class="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div class="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
            <span class="font-medium text-gray-600 dark:text-gray-400">Mostrar</span>
            <USelectMenu
              v-model="selectedPerPage"
              :items="perPageOptions"
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
              placeholder="Buscar modelo..."
              class="w-full xl:w-72"
            />

            <UButton
              color="neutral"
              variant="outline"
              class="rounded-full px-4"
            >
              Actualizar
            </UButton>
          </div>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-[1200px] w-full border-separate border-spacing-0">
          <thead>
            <tr class="bg-gray-50/90 dark:bg-gray-900/70">
              <th class="border-b border-gray-200/80 px-5 py-4 text-left text-[11px] font-bold uppercase tracking-[0.18em] text-gray-500 dark:border-gray-800 dark:text-gray-400">
                Equipo
              </th>
              <th class="border-b border-gray-200/80 px-5 py-4 text-left text-[11px] font-bold uppercase tracking-[0.18em] text-gray-500 dark:border-gray-800 dark:text-gray-400">
                Ing. a cargo
              </th>
              <th class="border-b border-gray-200/80 px-5 py-4 text-left text-[11px] font-bold uppercase tracking-[0.18em] text-gray-500 dark:border-gray-800 dark:text-gray-400">
                Asistente 1
              </th>
              <th class="border-b border-gray-200/80 px-5 py-4 text-left text-[11px] font-bold uppercase tracking-[0.18em] text-gray-500 dark:border-gray-800 dark:text-gray-400">
                Asistente 2
              </th>
              <th class="border-b border-gray-200/80 px-5 py-4 text-center text-[11px] font-bold uppercase tracking-[0.18em] text-gray-500 dark:border-gray-800 dark:text-gray-400">
                Accion
              </th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="model in paginatedModels"
              :key="`${model.equipo}-${model.ingACargo}-${model.asistente1}-${model.asistente2}`"
              class="transition-colors odd:bg-white even:bg-gray-50/50 hover:bg-blue-50/50 dark:odd:bg-gray-950 dark:even:bg-gray-900/40 dark:hover:bg-blue-950/20"
            >
              <td class="border-b border-gray-100 px-5 py-4 text-sm font-medium text-[#2d5fc0] dark:border-gray-800">
                {{ model.equipo }}
              </td>
              <td class="border-b border-gray-100 px-5 py-4 text-sm text-gray-800 dark:border-gray-800 dark:text-gray-200">
                <div class="max-w-[300px] truncate">
                  {{ model.ingACargo }}
                </div>
              </td>
              <td class="border-b border-gray-100 px-5 py-4 text-sm text-gray-800 dark:border-gray-800 dark:text-gray-200">
                <div class="max-w-[300px] truncate">
                  {{ model.asistente1 }}
                </div>
              </td>
              <td class="border-b border-gray-100 px-5 py-4 text-sm text-gray-800 dark:border-gray-800 dark:text-gray-200">
                <div class="max-w-[300px] truncate">
                  {{ model.asistente2 }}
                </div>
              </td>
              <td class="border-b border-gray-100 px-5 py-4 text-center dark:border-gray-800">
                <UButton
                  color="neutral"
                  variant="ghost"
                  icon="i-lucide-pencil"
                  class="rounded-full"
                  aria-label="Editar modelo"
                />
              </td>
            </tr>

            <tr v-if="!paginatedModels.length">
              <td colspan="5" class="px-5 py-16 text-center">
                <div class="mx-auto max-w-sm space-y-3">
                  <UIcon name="i-lucide-inbox" class="mx-auto size-10 text-gray-300 dark:text-gray-600" />
                  <p class="text-base font-semibold text-gray-800 dark:text-gray-200">
                    No se encontraron modelos para mostrar.
                  </p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="flex flex-col gap-4 border-t border-gray-200/80 px-5 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-gray-800">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Mostrando {{ showingFrom }} a {{ showingTo }} de {{ filteredModels.length }} registros
        </p>

        <div v-if="pageCount > 1" class="flex flex-wrap items-center gap-1.5">
          <UButton
            color="neutral"
            variant="outline"
            label="Previous"
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
