<template>
  <UForm class="space-y-4" @submit="handleSubmit">


    <UFormField label="Empresa" name="empresa_ids">
      <DataState :loading="company.loading" :error="company.isError"
        error-message="Hubo un error al cargar las empresas" @retry="getCompanies(true)">

        <template #loading>
          <USelect placeholder="Selecciona una empresa" class="w-full" :loading="company.loading" />
        </template>

        <USelect placeholder="Selecciona un cliente" multiple class="w-full" :items="company.list" value-key="id"
          label-key="company_name" v-model="attendance.params.empresa_ids" />
      </DataState>
    </UFormField>


    <UFormField label="Departamento" name="departamento_ids">
      <DataState :loading="department.loading" :error="department.isError"
        error-message="Hubo un error al cargar los departamentos" @retry="getDepartments(true)">

        <template #loading>
          <USelectMenu placeholder="Selecciona un departamento" class="w-full" :loading="department.loading" />
        </template>

        <USelectMenu placeholder="Selecciona un departamento" class="w-full" :items="department.list"
          label-key="dept_name" value-key="id" multiple v-model="attendance.params.departamento_ids" />
      </DataState>
    </UFormField>



    <div class="grid lg:grid-cols-2 gap-2">
      <UFormField label="Fecha de inicio" name="fecha_inicio">
        <UInput type="date" class="w-full" v-model="startDate" />
      </UFormField>

      <UFormField v-if="attendance.type === ReportType.DAYLY" label="Fecha de fin" name="fecha_fin">
        <UInput type="date" class="w-full" v-model="attendance.params.fecha_fin" />
      </UFormField>

    </div>

    <div class="border-t border-default  mt-8" />


    <div class="flex justify-end gap-2">

      <UButton type="submit" color="primary" icon="i-lucide-search" class="cursor-pointer"
        :loading="company.loading || department.loading">Consultar Reporte</UButton>
    </div>

  </UForm>



</template>


<script setup lang="ts">
import DataState from "../common/DataState.vue";
import { ReportType, useAttendanceReportStore } from "~/store/useAttendanceReportStore";

const store = useAttendanceReportStore()

const { getEmployeesByDepartment, getCompanies, getDepartments, getAttendanceSummary } = store;
const { company, department, attendance } = storeToRefs(store)

const startDate = computed({
  get() {
    const date = attendance.value.params.fecha_inicio
      ? new Date(attendance.value.params.fecha_inicio)
      : new Date();

    return date.toISOString().split("T")[0]; // → "2025-12-01"
  },
  set(val) {
    attendance.value.params.fecha_inicio = val!;
  }
});


const handleSubmit = async () => {
  await getEmployeesByDepartment();
  await getAttendanceSummary();


}

</script>