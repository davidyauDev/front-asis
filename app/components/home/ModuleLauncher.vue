<script setup lang="ts">
import logoIcon from '~/assets/images/logo-icon.svg'

type ModuleCard = {
  title: string
  description: string
  icon: string
  status: 'Disponible' | 'Proximamente'
  to?: string
  accent: string
}

const { user } = useAuth()
const search = shallowRef('')

const modules = [
  {
    title: 'Usuarios',
    description: 'Administracion de cuentas y perfiles.',
    icon: 'i-lucide-users',
    status: 'Proximamente',
    accent: 'from-sky-500/15 to-indigo-500/5',
  },
  {
    title: 'RRHH',
    description: 'Ingreso al proyecto actual de asistencia y gestion.',
    icon: 'i-lucide-id-card',
    status: 'Disponible',
    to: '/rrhh',
    accent: 'from-blue-500/20 to-indigo-500/10',
  },
  {
    title: 'Mesa de ayuda',
    description: 'Tickets, llamadas, WhatsApp y configuracion de soporte.',
    icon: 'i-lucide-lifebuoy',
    status: 'Disponible',
    to: '/mesa-de-ayuda',
    accent: 'from-cyan-500/20 to-sky-500/10',
  },
  {
    title: 'Logistica',
    description: 'Despachos, rutas y coordinacion operativa.',
    icon: 'i-lucide-truck',
    status: 'Proximamente',
    accent: 'from-orange-500/15 to-amber-500/5',
  },
] satisfies ModuleCard[]

const filteredModules = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) {
    return modules
  }

  return modules.filter((module) =>
    [module.title, module.description, module.status]
      .join(' ')
      .toLowerCase()
      .includes(q),
  )
})

const availableModules = computed(() =>
  filteredModules.value.filter(module => module.status === 'Disponible'),
)

const lockedModules = computed(() =>
  filteredModules.value.filter(module => module.status !== 'Disponible'),
)

const userLabel = computed(() => user.value?.name || 'Administrador')
const hasResults = computed(() => filteredModules.value.length > 0)
</script>

<template>
  <main class="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(29,33,101,0.08),_transparent_42%),linear-gradient(180deg,_#f9fafc_0%,_#eef1f7_100%)] text-slate-900 dark:bg-[radial-gradient(circle_at_top,_rgba(96,109,255,0.08),_transparent_42%),linear-gradient(180deg,_#0f172a_0%,_#111827_100%)] dark:text-slate-100">
    <div class="mx-auto flex min-h-screen max-w-[1500px] flex-col px-4 pb-10 pt-4 sm:px-6 lg:px-10">
      <header class="sticky top-0 z-20 -mx-4 mb-8 border-b border-white/60 bg-white/75 px-4 py-4 backdrop-blur-xl dark:border-slate-800/60 dark:bg-slate-950/70 sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-3">
            <div class="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <img :src="logoIcon" alt="Cechriza" class="h-full w-full object-cover">
            </div>
            <div class="hidden sm:block">
              <p class="text-xl font-black uppercase tracking-[-0.04em] text-slate-950 dark:text-white">
                Cechriza
              </p>
              <p class="text-xs font-medium uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">
                Selector de modulos
              </p>
            </div>
          </div>

          <UInput
            v-model="search"
            icon="i-lucide-search"
            size="lg"
            placeholder="Buscar modulo..."
            class="mx-auto hidden max-w-[720px] flex-1 md:block"
            :ui="{ base: 'rounded-full border-slate-200/80 bg-white/90 shadow-sm dark:border-slate-700/80 dark:bg-slate-900/80' }"
          />

          <div class="ml-auto flex items-center gap-3">
            <div class="rounded-full border border-slate-200 bg-white/90 px-3 py-2 shadow-sm dark:border-slate-700 dark:bg-slate-900/90">
              <UserMenu />
            </div>
          </div>
        </div>

        <div class="mt-4 md:hidden">
          <UInput
            v-model="search"
            icon="i-lucide-search"
            size="lg"
            placeholder="Buscar modulo..."
            class="w-full"
            :ui="{ base: 'rounded-full border-slate-200/80 bg-white/90 shadow-sm dark:border-slate-700/80 dark:bg-slate-900/80' }"
          />
        </div>
      </header>

      <section class="mb-8 grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
       

      
      </section>

      <section v-if="hasResults" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        <template v-for="module in availableModules" :key="module.title">
          <NuxtLink :to="module.to" class="group">
            <UCard class="h-full overflow-hidden border-slate-200/70 bg-white/85 shadow-lg shadow-slate-200/30 transition duration-200 group-hover:-translate-y-1 group-hover:shadow-xl dark:border-slate-700/70 dark:bg-slate-900/85" :ui="{ body: 'p-0' }">
              <div class="flex h-full flex-col justify-between p-5">
                <div class="flex items-start justify-between gap-3">
                  <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-sm">
                    <UIcon :name="module.icon" class="h-5 w-5" />
                  </div>
                  <UBadge color="success" variant="soft" class="rounded-full px-3 py-1">
                    {{ module.status }}
                  </UBadge>
                </div>

                <div class="mt-5 space-y-2">
                  <p class="text-[11px] font-bold uppercase tracking-[0.32em] text-slate-500 dark:text-slate-400">
                    Modulo
                  </p>
                  <h3 class="text-2xl font-black tracking-[-0.04em] text-slate-950 dark:text-white">
                    {{ module.title }}
                  </h3>
                  <p class="max-w-xs text-sm leading-6 text-slate-600 dark:text-slate-300">
                    {{ module.description }}
                  </p>
                </div>

                <div class="mt-6 flex items-center justify-between text-sm font-semibold text-slate-700 dark:text-slate-300">
                  <span>Entrar al sistema</span>
                  <UIcon name="i-lucide-arrow-up-right" class="h-4 w-4 text-orange-500 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </div>
            </UCard>
          </NuxtLink>
        </template>

        <UCard
          v-for="module in lockedModules"
          :key="module.title"
          class="h-full overflow-hidden border-slate-200/70 bg-white/70 shadow-lg shadow-slate-200/20 dark:border-slate-700/70 dark:bg-slate-900/70"
          :ui="{ body: 'p-0' }"
        >
          <div class="flex h-full flex-col justify-between p-5 opacity-85">
            <div class="flex items-start justify-between gap-3">
              <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br" :class="module.accent">
                <UIcon :name="module.icon" class="h-5 w-5 text-slate-700 dark:text-slate-200" />
              </div>
              <UBadge color="neutral" variant="soft" class="rounded-full px-3 py-1">
                {{ module.status }}
              </UBadge>
            </div>

            <div class="mt-5 space-y-2">
              <p class="text-[11px] font-bold uppercase tracking-[0.32em] text-slate-500 dark:text-slate-400">
                Modulo
              </p>
              <h3 class="text-2xl font-black tracking-[-0.04em] text-slate-950 dark:text-white">
                {{ module.title }}
              </h3>
              <p class="max-w-xs text-sm leading-6 text-slate-600 dark:text-slate-300">
                {{ module.description }}
              </p>
            </div>

            <div class="mt-6 flex items-center justify-between text-sm font-semibold text-slate-500 dark:text-slate-400">
              <span>Maqueta de referencia</span>
              <UIcon name="i-lucide-lock" class="h-4 w-4 text-orange-400" />
            </div>
          </div>
        </UCard>
      </section>

      <UCard
        v-else
        class="border-slate-200/70 bg-white/80 shadow-lg shadow-slate-200/30 dark:border-slate-700/70 dark:bg-slate-900/80"
        :ui="{ body: 'p-0' }"
      >
        <div class="flex flex-col items-center justify-center gap-4 px-6 py-14 text-center">
          <div class="flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
            <UIcon name="i-lucide-search-x" class="h-7 w-7" />
          </div>
          <div class="space-y-2">
            <h3 class="text-xl font-black tracking-[-0.03em] text-slate-950 dark:text-white">
              No encontramos modulos
            </h3>
            <p class="max-w-md text-sm leading-6 text-slate-600 dark:text-slate-300">
              Intenta con otro texto o limpia la busqueda para volver a ver el catalogo de modulos.
            </p>
          </div>
          <UButton
            color="neutral"
            variant="soft"
            icon="i-lucide-eraser"
            class="rounded-full"
            @click="search = ''"
          >
            Limpiar busqueda
          </UButton>
        </div>
      </UCard>
    </div>
  </main>
</template>
