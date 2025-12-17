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

        <USelectMenu placeholder="Selecciona un departamento" class="w-full" :items="departmentOptions" label-key="dept_name"
          value-key="id" multiple v-model="attendance.params.departamento_ids" />
      </DataState>
    </UFormField>



    <div class="grid lg:grid-cols-2 gap-2">
      <UFormField label="Fecha de inicio" name="fecha_inicio">
        <UInput type="date" class="w-full" v-model="attendance.params.fecha_inicio" />
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
import DataState from "~/components/common/DataState.vue";
import { ReportType, useAttendanceReportStore } from "~/store/useAttendanceReportStore";

const store = useAttendanceReportStore()

const { getEmployeesByDepartment, getCompanies, getDepartments, getAttendanceSummary, getAttendanceDetails } = store;
const { company, department, attendance } = storeToRefs(store)

const SELECT_ALL_ID = -1


const departmentOptions = computed(() => {
  if (!departments.value.length) return []

  return [
    { id: SELECT_ALL_ID, dept_name: 'Seleccionar todos' },
    ...departments.value
  ]
})
const departments = computed(() => {
  console.log(department.value.loading)
  let list = department.value.list;
  if (!department.value.list.length) return [];

  const companiesSelected = attendance.value.params.empresa_ids;


  if (companiesSelected.length) {
    const idSet = new Set(companiesSelected);

    // Filtrar departamentos por las empresas seleccionadas
    list = list.filter(dep => idSet.has(dep.company_id));
  }

  return list;
});

watch(
  () => attendance.value.params.empresa_ids,
  (newCompanies) => {
    const departments = department.value.list;
    if (!newCompanies.length || !departments.length) return;

    const idSet = new Set(newCompanies);
    const newDepartments = departments.filter(dep => idSet.has(dep.company_id));


    // Remover departamentos seleccionados que no existen en la empresa nueva
    const validDepartmentIds = new Set(newDepartments.map(d => d.id));
    const selectedDepartmentIds = attendance.value.params.departamento_ids;

    const cleanedSelection = selectedDepartmentIds.filter(id =>
      validDepartmentIds.has(id)
    );

    // Guardar la lista limpia
    attendance.value.params.departamento_ids = cleanedSelection;



  },
  { immediate: true }
);

watch(
  () => attendance.value.params.departamento_ids,
  (ids) => {
    if (!ids.includes(SELECT_ALL_ID)) return

    // Quitar el marcador "Seleccionar todos"
    attendance.value.params.departamento_ids = departments.value.map(
      d => d.id
    )
  }
)




const handleSubmit = async () => {

  await Promise.all([
    getEmployeesByDepartment(),
    getAttendanceSummary(),
    getAttendanceDetails()
  ])


}

</script>