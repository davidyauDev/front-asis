<template>

  <div class="space-y-4">

    <UFormField label="Empresa" name="company">
      <USelect placeholder="Selecciona un cliente" class="w-full" />
    </UFormField>

    <UFormField label="Departamento" name="department">
      <USelect placeholder="Selecciona un departamento" class="w-full" />
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


    <!-- <USelect label="Turno" placeholder="Selec ciona un turno" />
    <USelect label="Usuario" placeholder="Selecciona un usuario" />
    <UInput label="Fecha" type="date" /> -->
    <div class="flex justify-end gap-2">
      <!-- <UButton color="neutral" variant="soft">Limpiar</UButton> -->
      <UButton color="primary" icon="i-lucide-search" class="cursor-pointer">Consultar Reporte</UButton>
    </div>

  </div>



</template>
