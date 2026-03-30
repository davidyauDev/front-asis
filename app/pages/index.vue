<script setup lang="ts">
import HomeModuleLauncher from '~/components/home/ModuleLauncher.vue'

definePageMeta({
  layout: false,
  middleware: 'auth',
})

useHead({
  title: 'Modulos - Cechriza',
  meta: [
    {
      name: 'description',
      content: 'Selector de modulos principal del sistema.',
    },
  ],
})
</script>

<template>
  <HomeModuleLauncher />
</template>
