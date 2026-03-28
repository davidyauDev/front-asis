<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

await navigateTo('/empleados-biotime', { redirectCode: 301 })
</script>
