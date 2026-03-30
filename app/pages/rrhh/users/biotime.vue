<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

await navigateTo('/rrhh/empleados-biotime', { redirectCode: 301 })
</script>

