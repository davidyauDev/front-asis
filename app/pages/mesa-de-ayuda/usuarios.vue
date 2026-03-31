<script setup lang="ts">
definePageMeta({
  layout: 'support',
  middleware: 'auth',
})

useHead({
  title: 'Mesa de ayuda - Usuarios',
})
</script>

<template>
  <SupportPageShell
    panel-id="support-users"
    title="Usuarios"
    subtitle="Administracion de agentes y responsables de la mesa de ayuda. Este apartado quedara listo para permisos y asignaciones."
    badge="Borrador"
  >
    <UCard class="border-default/70 bg-white/85 dark:bg-gray-950/80" :ui="{ body: 'p-6' }">
      <div class="grid gap-4 sm:grid-cols-3">
        <div class="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/60">
          <p class="text-sm font-medium text-muted">
            Agentes activos
          </p>
          <p class="mt-2 text-3xl font-black tracking-[-0.04em] text-gray-950 dark:text-white">
            06
          </p>
        </div>
        <div class="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/60">
          <p class="text-sm font-medium text-muted">
            Supervisores
          </p>
          <p class="mt-2 text-3xl font-black tracking-[-0.04em] text-gray-950 dark:text-white">
            02
          </p>
        </div>
        <div class="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/60">
          <p class="text-sm font-medium text-muted">
            Sin asignar
          </p>
          <p class="mt-2 text-3xl font-black tracking-[-0.04em] text-gray-950 dark:text-white">
            03
          </p>
        </div>
      </div>
    </UCard>
  </SupportPageShell>
</template>
