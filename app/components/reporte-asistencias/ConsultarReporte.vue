<template>
  <div class="space-y-4">
    <UFormField label="Empresa" name="company">
      <USelect placeholder="Selecciona un cliente" class="w-full" :items="company.list" :loading="company.loading"
        value-key="id" label-key="company_name" />
    </UFormField>

    <UFormField label="Departamento" name="department">
      <USelectMenu placeholder="Selecciona un departamento" class="w-full" :items="department.list"
        :loading="department.loading" label-key="dept_name" v-model="department.current" />
    </UFormField>

    <div class="grid lg:grid-cols-2 gap-2">
      <UFormField label="Fecha de inicio" name="startDate">
        <UInput type="date" class="w-full" />
      </UFormField>

      <UFormField label="Fecha de fin" name="endDate">
        <UInput type="date" class="w-full" />
      </UFormField>

    </div>

    <div class="border-t border-default  mt-8" />


    <div class="flex justify-end gap-2">

      <UButton color="primary" icon="i-lucide-search" class="cursor-pointer"
        :loading="company.loading || department.loading">Consultar Reporte</UButton>
    </div>

  </div>



</template>


<script setup lang="ts">
import { useAttendanceReportStore } from "~/store/useAttendanceReportStore";

const store = useAttendanceReportStore()

const { fetchEmployeesByDepartment } = store;
const { company, department, } = storeToRefs(store)

const currentDepartment = computed(() => department.value.current);

watch(currentDepartment, (department) => {
  if (department) fetchEmployeesByDepartment(department.id);
});
</script>