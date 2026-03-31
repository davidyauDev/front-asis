<script setup lang="ts">
definePageMeta({
  layout: 'support',
  middleware: 'auth',
})

useHead({
  title: 'Mesa de ayuda - WhatsApp',
})

type FeatureCard = {
  title: string
  description: string
  icon: string
  tone: 'success' | 'primary' | 'purple'
}

const sessionId = 'mi-sesion-IMG518eJ'

const sessionStats = [
  {
    label: 'Session ID:',
    value: sessionId,
    tone: 'neutral',
  },
  {
    label: 'Estado:',
    value: 'Conectado',
    tone: 'success',
  },
  {
    label: 'Base de Datos:',
    value: 'Guardado',
    tone: 'primary',
  },
] as const

const features = [
  {
    title: 'Conexion Segura',
    description: 'Encriptado de extremo a extremo',
    icon: 'i-lucide-badge-check',
    tone: 'success',
  },
  {
    title: 'API Lista',
    description: 'Envio de mensajes disponible',
    icon: 'i-lucide-layout-grid',
    tone: 'primary',
  },
  {
    title: 'Persistente',
    description: 'Guardado en base de datos',
    icon: 'i-lucide-download',
    tone: 'purple',
  },
] satisfies FeatureCard[]
</script>

<template>
  <UDashboardPanel id="support-whatsapp">
    <template #header>
      <AppDashboardHeader
        title="WhatsApp"
        mobile-title="WhatsApp"
        subtitle="Dashboard / WhatsApp"
        subtitle-icon="i-simple-icons-whatsapp"
        icon="i-simple-icons-whatsapp"
        :show-notifications="false"
        :show-user-name="false"
        :show-live-badge="false"
        tone="neutral"
      />
    </template>

    <template #body>
      <div class="mx-auto flex w-full max-w-[1360px] flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8">
        <UInput
          model-value=""
          disabled
          placeholder=""
          class="w-full"
          :ui="{
            base: 'rounded-md border border-gray-200 bg-white/80 shadow-none px-4 py-2.5 dark:border-gray-800 dark:bg-gray-950/80',
          }"
        />

        <UCard
          class="overflow-hidden border-0 bg-gradient-to-r from-[#e4faf0] via-[#eef8ff] to-[#ecfff1] shadow-[0_18px_38px_-28px_rgba(15,23,42,0.2)]"
          :ui="{ body: 'p-0' }"
        >
          <div class="flex items-center gap-3 border-l-4 border-emerald-500 px-5 py-4">
            <div class="flex size-8 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
              <UIcon name="i-lucide-circle-check-big" class="size-5" />
            </div>
            <p class="text-sm font-semibold text-gray-900 dark:text-white">
              Sesion activa encontrada: {{ sessionId }}
            </p>
          </div>
        </UCard>

        <section class="relative flex flex-col items-center justify-center px-4 py-4 text-center">
          <div class="absolute left-8 top-10 hidden size-2 rounded-full bg-emerald-500 md:block" />
          <div class="absolute left-10 top-36 hidden size-2 rounded-full bg-cyan-400 md:block" />
          <div class="absolute right-10 top-16 hidden size-3 rounded-full bg-emerald-400 md:block" />
          <div class="absolute right-14 top-40 hidden size-2 rounded-full bg-emerald-500 md:block" />

          <div class="relative mb-8">
            <div class="absolute inset-0 scale-125 rounded-full bg-emerald-400/15 blur-2xl" />
            <div class="relative flex size-32 items-center justify-center rounded-full border-8 border-emerald-500/95 bg-emerald-100 text-emerald-500 shadow-[0_24px_48px_-24px_rgba(16,185,129,0.6)]">
              <UIcon name="i-lucide-check" class="size-16" />
            </div>
          </div>

          <div class="mb-2 flex items-center gap-3">
            <UIcon name="i-lucide-party-popper" class="size-10 text-emerald-600" />
            <h2 class="text-4xl font-black tracking-[-0.05em] text-emerald-600 sm:text-5xl">
              !Sesion Activa!
            </h2>
          </div>

          <p class="max-w-xl text-lg text-gray-700 dark:text-gray-300">
            Tu WhatsApp esta conectado y listo para usar
          </p>
        </section>

        <section class="mx-auto w-full max-w-[420px]">
          <UCard class="rounded-[1.5rem] border-0 bg-white shadow-[0_18px_36px_-24px_rgba(15,23,42,0.28)] dark:bg-gray-950" :ui="{ body: 'p-6' }">
            <div class="mb-5 flex items-center justify-center gap-3">
              <div class="flex size-8 items-center justify-center rounded-full bg-emerald-500 text-white">
                <UIcon name="i-lucide-info" class="size-5" />
              </div>
              <h3 class="text-lg font-bold text-gray-900 dark:text-white">
                Informacion de Sesion
              </h3>
            </div>

            <div class="space-y-4">
              <div
                v-for="item in sessionStats"
                :key="item.label"
                class="grid grid-cols-[120px_1fr] items-center gap-3 text-sm"
              >
                <span class="font-medium text-gray-600 dark:text-gray-400">
                  {{ item.label }}
                </span>
                <div class="flex justify-end">
                  <UBadge
                    v-if="item.tone !== 'neutral'"
                    :color="item.tone as 'success' | 'primary'"
                    variant="soft"
                    class="rounded-full px-3 py-1 font-semibold"
                  >
                    {{ item.value }}
                  </UBadge>
                  <span
                    v-else
                    class="inline-flex rounded-full bg-gray-100 px-3 py-1 font-semibold text-gray-500 dark:bg-gray-800 dark:text-gray-300"
                  >
                    {{ item.value }}
                  </span>
                </div>
              </div>
            </div>
          </UCard>
        </section>

        <section class="flex flex-wrap items-center justify-center gap-4">
          <UButton
            color="success"
            variant="solid"
            icon="i-lucide-mail"
            class="rounded-2xl px-8 py-4 text-base font-bold shadow-[0_18px_34px_-22px_rgba(16,185,129,0.7)]"
          >
            Enviar Mensaje de Prueba
          </UButton>

          <UButton
            color="neutral"
            variant="solid"
            icon="i-lucide-refresh-cw"
            class="rounded-2xl bg-slate-600 px-8 py-4 text-base font-bold shadow-[0_18px_34px_-22px_rgba(15,23,42,0.45)] hover:bg-slate-700"
          >
            Crear Nueva Sesion
          </UButton>
        </section>

        <section class="grid gap-4 md:grid-cols-3">
          <UCard
            v-for="feature in features"
            :key="feature.title"
            class="rounded-[1.35rem] border-0 bg-white shadow-[0_16px_28px_-22px_rgba(15,23,42,0.22)] dark:bg-gray-950"
            :ui="{ body: 'p-5' }"
          >
            <div class="flex flex-col items-center gap-3 text-center">
              <div
                class="flex size-10 items-center justify-center rounded-2xl"
                :class="feature.tone === 'success'
                  ? 'bg-emerald-500/10 text-emerald-500'
                  : feature.tone === 'primary'
                    ? 'bg-blue-500/10 text-blue-500'
                    : 'bg-purple-500/10 text-purple-500'"
              >
                <UIcon :name="feature.icon" class="size-6" />
              </div>

              <div>
                <p class="text-sm font-bold text-gray-900 dark:text-white">
                  {{ feature.title }}
                </p>
                <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {{ feature.description }}
                </p>
              </div>
            </div>
          </UCard>
        </section>
      </div>
    </template>
  </UDashboardPanel>
</template>
