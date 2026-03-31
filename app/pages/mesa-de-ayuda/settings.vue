<script setup lang="ts">
definePageMeta({
  layout: 'support',
  middleware: 'auth',
})

useHead({
  title: 'Mesa de ayuda - Settings',
})
</script>

<template>
  <SupportPageShell
    panel-id="support-settings"
    title="Settings"
    subtitle="Configuracion general de la mesa de ayuda. Esta pagina dejara listo el espacio para reglas, permisos y canales."
    badge="Config"
  >
    <UCard class="border-default/70 bg-white/85 dark:bg-gray-950/80" :ui="{ body: 'p-6' }">
      <div class="grid gap-4 sm:grid-cols-2">
        <div class="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/60">
          <p class="text-sm font-medium text-muted">
            Canales
          </p>
          <p class="mt-2 text-base font-semibold text-gray-950 dark:text-white">
            Tickets, llamadas y WhatsApp
          </p>
        </div>
        <div class="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/60">
          <p class="text-sm font-medium text-muted">
            Estado
          </p>
          <p class="mt-2 text-base font-semibold text-gray-950 dark:text-white">
            Estructura inicial creada
          </p>
        </div>
      </div>
    </UCard>
  </SupportPageShell>
</template>
