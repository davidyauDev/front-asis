<template>
    <UCard :ui="{
        header: 'p-2 flex items-center justify-between'
    }">
        <template #header>
            Empresa
            <UButton :disabled="selecteds.length === company.list.length" v-if="!isError" class="cursor-pointer"
                icon="i-lucide-funnel" variant="link" @click="handleResertFilter" />
        </template>


        <div class="space-y-2 max-h-48 overflow-y-auto flex flex-wrap gap-2">

            <DataState :loading="loading" :error="isError"
                error-message="No se pudo cargas las empresas" @retry="getCompanies(true)">

                <template #loading>
                    <USkeleton v-for="_ in Array.from({ length: 2 })" class="h-8 w-36" />
                </template>


                <UButton v-for="item in list" :key="item.id" class="cursor-pointer" :class="!selecteds.some(s => s.id === item.id) &&
                    'bg-gray-100 dark:bg-gray-800 dark:text-gray-100 text-gray-700 border transition'"
                    @click="handleSelectCompany(item)">
                    {{ item.company_name }}
                </UButton>

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