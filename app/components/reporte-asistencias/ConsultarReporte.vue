<template>
  <div class="space-y-4">


    <!-- <UFormField label="Empresa" name="company">

      

      <p v-if="company.isError">Hubo un error al cargar la data</p>
      <USelect v-else  placeholder="Selecciona un cliente" class="w-full" :items="company.list" :loading="company.loading"
        value-key="id" label-key="company_name" />
    </UFormField> -->

    <UFormField label="Empresa" name="company">
      <DataState :loading="company.loading" :error="company.isError"
        error-message="Hubo un error al cargar las empresas" @retry="getCompanies(true)">

        <template #loading>
          <USelectMenu placeholder="Selecciona una empresa" class="w-full" :loading="company.loading" />
        </template>

        <USelect placeholder="Selecciona un cliente" class="w-full" :items="company.list" :loading="company.loading"
          value-key="id" label-key="company_name" />
      </DataState>
    </UFormField>


    <UFormField label="Departamento" name="department">
      <DataState :loading="department.loading" :error="department.isError"
        error-message="Hubo un error al cargar los departamentos" @retry="getDepartments(true)">

        <template #loading>
          <USelectMenu placeholder="Selecciona un departamento" class="w-full" :loading="department.loading" />
        </template>

        <USelectMenu placeholder="Selecciona un departamento" class="w-full" :items="department.list"
          :loading="department.loading" label-key="dept_name" v-model="department.current" />
      </DataState>
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
import DataState from "../common/DataState.vue";
import { useAttendanceReportStore } from "~/store/useAttendanceReportStore";

const store = useAttendanceReportStore()

const { getEmployeesByDepartment, getCompanies, getDepartments } = store;
const { company, department, } = storeToRefs(store)

const currentDepartment = computed(() => department.value.current);

watch(currentDepartment, (department) => {
  if (department) getEmployeesByDepartment(department.id);
});
</script>