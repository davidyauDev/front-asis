<script setup lang="ts">
import { apiFetch } from '~/services/api';


const props = defineProps<{
    mesSeleccionado: number,
    añoSeleccionado: number,
    filtroUsuario: string
}>();
const datosEmpleados = ref<any[]>([]);
const cargando = ref(true);

const empleadosFiltrados = computed(() => {
    const q = props.filtroUsuario.trim().toLowerCase();
    if (!q) return datosEmpleados.value;
    return datosEmpleados.value.filter((e) => {
        const texto = `${e.dni} ${e.apellidos} ${e.nombre}`.toLowerCase();
        return texto.includes(q);
    });
});
const toast = useToast()

const convertirAMinutos = (t: string) => {
    if (!t || t === "-") return 0;
    const p = t.split(":").map(Number);
    return p.length === 3
        ? p[0] * 60 + p[1] + Math.round(p[2] / 60)
        : p[0] * 60 + p[1];
};


const esMayorAUnaHora = (hhmm: string) => {
    const minutos = convertirAMinutos(hhmm)
    return minutos > 60
}

const notificarPorCorreo = () => {
    alert("Funcionalidad de correo en desarrollo");
};


const cargarIncidencias = async () => {
    cargando.value = true;
    try {
        const response = await apiFetch(
            `/api/incidencias?mes=${props.mesSeleccionado}&anio=${props.añoSeleccionado}`,
            { method: "GET" }
        );
        datosEmpleados.value = response;
        console.log("log:", response);
        console.log("Incidencias cargadas:", datosEmpleados.value);
    } catch (error) {
        console.error("Error al cargar incidencias:", error);
        toast.add({
            title: "Error",
            description: "No se pudo cargar las incidencias",
            color: "error",
        });
    } finally {
        cargando.value = false;
    }
};


onMounted(() => {
        cargarIncidencias();
});

watch([
    () => props.mesSeleccionado,
    () => props.añoSeleccionado
], cargarIncidencias);


</script>


<template>
    <div>
        <div class="flex justify-between items-center bg-white p-4 rounded shadow border">
            <h2 class="text-lg font-bold">Cálculo de Tardanzas Netas</h2>
            <div class="flex gap-2">
                <UButton color="secondary" @click="notificarPorCorreo">
                    Notificar por correo
                    <UIcon name="i-lucide-mail" class="size-5" />

                </UButton>
                <div>
                </div>
                <UButton color="success">
                    Descargar Excel
                    <UIcon name="i-lucide-file" class="size-5" />

                </UButton>
            </div>
        </div>

        <div v-if="cargando" class="my-8">
            <div class="rounded shadow border bg-white p-4 animate-pulse">
                <div class="mb-4 flex justify-between items-center">
                    <USkeleton class="h-6 w-72 rounded" />
                    <div class="flex gap-2">
                        <USkeleton class="h-10 w-36 rounded" />
                        <USkeleton class="h-10 w-36 rounded" />
                    </div>
                </div>
                <div class="overflow-x-auto">
                    <table class="border-collapse w-full text-sm">
                        <thead>
                            <tr>
                                <th v-for="i in 6" :key="i">
                                    <USkeleton class="h-4 w-32 rounded" />
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="row in 8" :key="row">
                                <td v-for="col in 6" :key="col">
                                    <USkeleton class="h-4 w-28 rounded my-2" />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <table v-else class="border-collapse w-full text-sm rounded shadow">
            <thead>
                <tr class="bg-[#1f4e78] text-white">
                    <th class="border px-3 py-2">ID</th>
                    <th class="border px-3 py-2">DNI</th>
                    <th class="border px-4 py-2">APELLIDOS Y NOMBRES</th>
                    <th class="border px-3 py-2 bg-blue-700">BRUTO</th>
                    <th class="border px-3 py-2 bg-purple-700">INCIDENCIAS</th>
                    <th class="border px-3 py-2 bg-green-700">NETO</th>
                </tr>
            </thead>

            <tbody>
                <tr v-for="emp in empleadosFiltrados" :key="emp.id" class="hover:bg-gray-50">
                    <td class="border px-2 text-center">{{ emp.id }}</td>
                    <td class="border px-2 text-center">{{ emp.dni }}</td>
                    <td class="border px-3">
                        {{ emp.apellidos }} {{ emp.nombre }}
                    </td>

                    <td class="border px-2 text-center bg-blue-50">
                        {{ emp.bruto_hhmm }}
                    </td>

                    <td class="border px-2 text-center bg-purple-50 font-bold">
                        {{ emp.incidencias_hhmm }}
                    </td>

                    <td class="border px-2 text-center font-bold" :class="esMayorAUnaHora(emp.neto_hhmm)
                        ? 'bg-red-100 text-red-800'
                        : 'bg-green-100 text-green-800'
                        ">
                        {{ emp.neto_hhmm }}
                    </td>
                </tr>

            </tbody>
        </table>
    </div>
</template>