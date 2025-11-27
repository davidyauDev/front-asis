<template>
  <UCard class="overflow-hidden">

    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="bg-gray-100 dark:bg-gray-800">
          <tr>
            <th v-for="h in headers" :key="h" class="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300">
              {{ h }}
            </th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="i in 5"
            :key="i"
            class="border-b hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          >
            <td v-for="h in headers" :key="h" class="px-4 py-2 text-gray-600 dark:text-gray-300">
              —
            </td>
          </tr>
        </tbody>
      </table>
    </div>

  </UCard>
</template>

<script setup>
defineProps({
  headers: {
    type: Array,
    default: () => []
  }
})
</script>
