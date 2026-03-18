<template>
  <PersonnelEmployeesAdmin />
</template>

<script setup lang="ts">
import PersonnelEmployeesAdmin from '~/components/biotime/PersonnelEmployeesAdmin.vue'

definePageMeta({ middleware: 'auth' })
</script>
