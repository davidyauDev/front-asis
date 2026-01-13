<template>
  <UCard
    :ui="{
      header: 'px-3 py-2 flex items-center justify-between border-b'
    }"
  >
    <!-- HEADER -->
    <template #header>
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-building-2" class="size-4 text-primary" />
        <span class="font-semibold text-sm">Empresa</span>
      </div>

      <UButton
        v-if="!isError && selecteds.length !== company.list.length"
        icon="i-lucide-rotate-ccw"
        size="xs"
        variant="ghost"
        color="gray"
        class="cursor-pointer"
        @click="handleResertFilter"
      >
        Limpiar
      </UButton>
    </template>

    <!-- BODY -->
    <div class="space-y-2 max-h-48 overflow-y-auto pr-1">
      <DataState
        :loading="loading"
        :error="isError"
        error-message="No se pudo cargar las empresas"
        @retry="getCompanies(true)"
      >
        <!-- LOADING -->
        <template #loading>
          <div class="flex flex-wrap gap-2">
            <USkeleton
              v-for="_ in 4"
              :key="_"
              class="h-8 w-32 rounded-full"
            />
          </div>
        </template>

        <!-- LIST -->
        <div class="flex flex-wrap gap-2">
          <button
            v-for="item in list"
            :key="item.id"
            @click="handleSelectCompany(item)"
            :class="[
              'px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200 cursor-pointer',
              'flex items-center gap-1.5',
              selecteds.some(s => s.id === item.id) 
                ? 'bg-primary text-white shadow-md hover:shadow-lg hover:scale-105 ring-2 ring-primary/20' 
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:scale-105'
            ]"
          >
            <UIcon
              v-if="selecteds.some(s => s.id === item.id)"
              name="i-lucide-check"
              class="size-3.5"
            />
            {{ item.company_name }}
          </button>
        </div>
      </DataState>
    </div>
  </UCard>
</template>



<script setup lang="ts">
import DataState from '~/components/common/DataState.vue';
import { type Company } from '~/composables/useAttendanceReport';
import { useAttendanceReportStore } from '~/store/useAttendanceReportStore';

const store = useAttendanceReportStore();
const { getCompanies } = store;
const { company } = storeToRefs(store);

const { loading, isError, list } = defineProps<{
    loading: boolean,
    isError: boolean,
    list: Company[],
}>()

const storeSelecteds = defineModel<Company[]>('company', {
    required: true
});

const param = defineModel<number | undefined>('param');



const selecteds = computed<Company[]>({
    get() {
        return storeSelecteds.value.length ? storeSelecteds.value : company.value.list
    },

    set(newSelecteds) {
        storeSelecteds.value = newSelecteds
    }
})

const handleSelectCompany = (company: Company) => {
    param.value = company.id;
    selecteds.value = selecteds.value.some(s => s.id === company.id)
        ? selecteds.value.filter(s => s.id === company.id) // remover
        : [company]
}

const handleResertFilter = () => {
    selecteds.value = company.value.list
    param.value = undefined;
}



</script>