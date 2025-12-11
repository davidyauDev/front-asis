<template>
    <UDashboardPanel id="vacations">
        <template #header>
            <UDashboardNavbar title="Vacaciones" :ui="{ right: 'gap-3' }">
                <template #leading>
                    <UDashboardSidebarCollapse />
                </template>
            </UDashboardNavbar>

        </template>

        <template #body>

            <div class="p-6">

                <!-- HEADER -->
                <div class="flex items-center justify-end mb-6">


                    <UButton icon="i-heroicons-arrow-down-tray" color="primary">
                        Exportar
                    </UButton>
                </div>

                <!-- ESTADÍSTICAS -->
                <!-- <div class="grid grid-cols-4 gap-4 mb-6">
                    <UCard>
                        <p class="text-sm opacity-70">Total Empleados</p>
                        <p class="text-xl font-bold">{{ stats.total }}</p>
                    </UCard>

                    <UCard>
                        <p class="text-sm opacity-70">Asistencia Promedio</p>
                        <p class="text-xl font-bold">{{ stats.promedio }}%</p>
                    </UCard>

                    <UCard>
                        <p class="text-sm opacity-70">En Vacaciones</p>
                        <p class="text-xl font-bold">{{ stats.vacaciones }}</p>
                    </UCard>

                    <UCard>
                        <p class="text-sm opacity-70">Descanso Médico</p>
                        <p class="text-xl font-bold">{{ stats.descansoMedico }}</p>
                    </UCard>
                </div> -->


                <!-- FILTROS -->
                <div class="flex items-center justify-between mb-4">
                    <PickMonth v-model="modelValue" />

                    <div class="flex gap-2">

                        <UInput v-model="searchTerm" icon="i-heroicons-magnifying-glass" placeholder="Buscar empleado..." class="w-64" />

                        <!-- <USelect :items="['Todos', 'Cechriza SAC', 'Otra Empresa']" class="w-48" /> -->
                        <DataState :loading="department.loading" :error="department.isError"
                            error-message="No se pudo cargar los departamentos" @retry="getDepartments(true)">
                            <template #loading>
                                <USkeleton class="h-8 w-48" />
                            </template>


                            <USelect v-model="departmentSelectedId" v-if="department.list.length" :items="departments"
                                class="w-48" placeholder="Filtrar por departamento" label-key="label"
                                value-key="value" />

                        </DataState>

                    </div>
                </div>

                <!-- LEYENDA -->
                <UCard :ui="{
                    body: 'flex w-full p-4! gap-4'
                }" class="flex gap-4 mb-3">


                    <div class="flex items-center gap-2">
                        <span class="size-6 rounded bg-green-500 flex items-center justify-center text-xs">✓</span>
                        Presente
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="size-6 rounded bg-yellow-500 flex items-center justify-center text-xs">V</span>
                        Vacaciones
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="size-6 rounded bg-red-500 flex items-center justify-center text-xs">DM</span>
                        Descanso Médico
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="size-6 rounded bg-gray-500 flex items-center justify-center text-xs">-</span>
                        Ausente
                    </div>

                    <div class="flex items-center gap-2">
                        <span class="size-6 rounded bg-blue-500 flex items-center justify-center text-xs">D</span>
                        Domingo
                    </div>

                </UCard>

                <!-- TABLA -->
                <TableReport :range-date="rangeDate" v-model:open="openDetailModal" :search-term="searchTerm" />

                <DetailModal v-model:open="openDetailModal" :range-date="modelValue" />

            </div>


        </template>



    </UDashboardPanel>



</template>

<script setup lang="ts">
import { endOfMonth, startOfMonth } from 'date-fns';
import DataState from '~/components/common/DataState.vue';
import DetailModal from '~/components/movility-report/DetailModal.vue';
import PickMonth from '~/components/movility-report/PickMonth.vue';
import TableReport from '~/components/movility-report/TableReport.vue';
import { useAttendanceReportStore } from '~/store/useAttendanceReportStore';
import { type Department } from '~/composables/useAttendanceReport';

definePageMeta({ middleware: "auth" });

const store = useAttendanceReportStore();
const { getDepartments } = store;
const { department } = storeToRefs(store);

const openDetailModal = ref(false);

const modelValue = shallowRef({
    start: toCalendarDate(startOfMonth(new Date())),
    end: toCalendarDate(endOfMonth(new Date()))
})


const searchTerm = ref('');

const departmentSelectedId = ref<number | undefined>(undefined);


const departmentSelected = computed<Department | null>(() => {
    if (!departmentSelectedId.value) return null;
    return department.value.list.find((dep) => dep.id === departmentSelectedId.value) || null;

})

const departments = computed<{
    label: string,
    value: number
}[]>(() =>
    [
        {
            label: 'Todos',
            value: 0
        },
        ...department.value.list.map((dep) => ({
            label: dep.dept_name,
            value: dep.id
        }))
    ]
);

const rangeDate = computed(() => ({
    start: fromCalToDate(modelValue.value.start),
    end: fromCalToDate(modelValue.value.end)
}))



onMounted(getDepartments)


</script>
