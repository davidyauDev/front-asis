<script setup lang="ts">
import { apiFetch } from '~/services/api';

const props = defineProps<{
    fechaInicio: string,
    fechaFin: string,
    filtroUsuario: string,
    filtroEmpresa: string
}>();

const datosEmpleados = ref<any[]>([]);
const cargando = ref(true);

const empleadosFiltrados = computed(() => {
    let list = datosEmpleados.value;

    const q = props.filtroUsuario.trim().toLowerCase();
    if (q) {
        list = list.filter((e) => {
            const texto = `${e.dni} ${e.apellidos} ${e.nombre}`.toLowerCase();
            return texto.includes(q);
        });
    }

    const empresa = props.filtroEmpresa?.trim().toLowerCase();
    if (empresa) {
        list = list.filter((e) => {
            const empEmpresa = (e.empresa ?? '').toString().trim().toLowerCase();
            return empEmpresa === empresa;
        });
    }

    return list;
});
const toast = useToast()
1
const convertirAMinutos = (t: string) => {
    if (!t || t === "-") return 0;
    const p = t.split(":").map(Number);
    return p.length === 3
        ? p[0] * 60 + p[1] + Math.round(p[2] / 60)
        : p[0] * 60 + p[1];
};


const loadingEmail = ref<{ [key: number]: boolean }>({});

async function enviarEmail(emp: any) {
    loadingEmail.value[emp.id] = true;
    const payload = {
        email: emp.email ?? 'yauridavid00@gmail.com',
        nombre: emp.nombre,
        scheduled_time: emp.neto_hhmm,
        check_in: emp.check_in ?? emp.hora_ingreso ?? '',
        fecha: emp.fecha ?? '',
    };
    try {
        await apiFetch('/api/tardanzas/enviar-correo', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
        toast.add({
            title: 'Correo enviado',
            description: `Se envió el correo a ${payload.email}`,
            color: 'success',
        });
    } catch (error) {
        toast.add({
            title: 'Error',
            description: 'No se pudo enviar el correo',
            color: 'error',
        });
    } finally {
        loadingEmail.value[emp.id] = false;
    }
}

const esMayorAUnaHora = (hhmm: string) => {
    const minutos = convertirAMinutos(hhmm)
    return minutos > 60
}

const cargarIncidencias = async () => {
    cargando.value = true;
    try {
        const response = await apiFetch('/api/incidencias', {
            method: 'POST',
            body: JSON.stringify({
                fecha_desde: props.fechaInicio,
                fecha_hasta: props.fechaFin
            })
        });
        datosEmpleados.value = response;
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

const descargarExcel = async (filtros?: { fechaInicio?: string, fechaFin?: string, filtroUsuario?: string }) => {
    try {
        const config = useRuntimeConfig();
        const token = useCookie<string | null>('auth_token');

        if (!token.value) {
            toast.add({
                title: 'Error',
                description: 'No hay token de autenticación',
                color: 'error'
            });
            return;
        }

        toast.add({
            id: 'exportando-calculo',
            title: 'Preparando exportación',
            description: 'Generando archivo Excel...',
            icon: 'i-lucide-loader-2',
            timeout: 0
        });

        const body: any = {
            fecha_desde: filtros?.fechaInicio || props.fechaInicio,
            fecha_hasta: filtros?.fechaFin || props.fechaFin,
            descargar: true
        };
        if (filtros?.filtroUsuario) {
            body.filtro_usuario = filtros.filtroUsuario;
        }

        const response = await fetch(
            `${config.public.apiBaseUrl}/api/incidencias`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token.value}`,
                    'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                },
                body: JSON.stringify(body)
            }
        );

        if (!response.ok) {
            throw new Error(`Error HTTP ${response.status}`);
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `calculo_tardanzas_${body.fecha_desde}_${body.fecha_hasta}.xlsx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);

        toast.remove('exportando-calculo');
        toast.add({
            title: 'Descarga completa',
            description: 'El archivo se descargó correctamente',
            icon: 'i-lucide-check-circle',
            color: 'green',
            timeout: 3000
        });
    } catch (error: any) {
        console.error('Error al descargar Excel:', error);
        toast.remove('exportando-calculo');

        let errorTitle = 'Error al exportar';
        let errorDescription = 'No se pudo generar el archivo Excel';

        if (error instanceof TypeError && error.message === 'Failed to fetch') {
            errorTitle = '🔌 Servidor no disponible';
            errorDescription = 'No se puede conectar con el backend. Verifica que esté corriendo.';
        } else if (error.message.includes('HTTP')) {
            errorTitle = 'Error del servidor';
            errorDescription = error.message;
        }

        toast.add({
            title: errorTitle,
            description: errorDescription,
            icon: 'i-lucide-alert-circle',
            color: 'red',
            timeout: 8000
        });
    }
};

onMounted(() => {
    cargarIncidencias();
});

watch([
    () => props.fechaInicio,
    () => props.fechaFin
], cargarIncidencias);

defineExpose({
    descargarExcel
});
</script>

<template>
    <div>
        <div v-if="cargando" class="my-8">
            <div class="rounded shadow border bg-white dark:bg-gray-900 dark:border-gray-700 p-4 animate-pulse">
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
                                <th v-for="i in 7" :key="i">
                                    <USkeleton class="h-4 w-32 rounded" />
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="row in 8" :key="row">
                                <td v-for="col in 7" :key="col">
                                    <USkeleton class="h-4 w-28 rounded my-2" />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <table v-else class="border-collapse w-full text-sm rounded shadow dark:bg-gray-900 dark:text-gray-200">
            <thead>
                <tr class="bg-[#1f4e78] text-white dark:bg-blue-900">
                    <th class="border px-3 py-2 dark:border-gray-700">ID</th>
                    <th class="border px-3 py-2 dark:border-gray-700">DNI</th>
                    <th class="border px-4 py-2 dark:border-gray-700">APELLIDOS Y NOMBRES</th>
                    <th class="border px-4 py-2 dark:border-gray-700">EMPRESA</th>
                    <th class="border px-3 py-2 bg-blue-700 dark:bg-blue-800 dark:text-blue-200 dark:border-gray-700">BRUTO</th>
                    <th class="border px-3 py-2 bg-purple-700 dark:bg-purple-800 dark:text-purple-200 dark:border-gray-700">INCIDENCIAS</th>
                    <th class="border px-3 py-2 bg-green-700 dark:bg-green-800 dark:text-green-200 dark:border-gray-700">NETO</th>
                    <th class="border px-3 py-2 bg-green-700 dark:bg-green-800 dark:text-green-200 dark:border-gray-700">Acciones</th>
                </tr>
            </thead>

            <tbody>
                <tr v-for="emp in empleadosFiltrados" :key="emp.id" class="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td class="border px-2 text-center dark:border-gray-700">{{ emp.id }}</td>
                    <td class="border px-2 text-center dark:border-gray-700">{{ emp.dni }}</td>
                    <td class="border px-3 dark:border-gray-700">
                        {{ emp.apellidos }} {{ emp.nombre }}
                    </td>
                    <td class="border px-3 dark:border-gray-700">
                        {{ emp.empresa || '' }}
                    </td>

                    <td class="border px-2 text-center bg-blue-50 dark:bg-blue-900 dark:text-blue-200 dark:border-gray-700">
                        {{ emp.bruto_hhmm }}
                    </td>

                    <td class="border px-2 text-center bg-purple-50 font-bold dark:bg-purple-900 dark:text-purple-200 dark:border-gray-700">
                        {{ emp.incidencias_hhmm }}
                    </td>

                    <td class="border px-2 text-center font-bold dark:border-gray-700" :class="esMayorAUnaHora(emp.neto_hhmm)
                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        ">
                        {{ emp.neto_hhmm }}
                    </td>
                    <td class="border px-2 text-center dark:border-gray-700">
                        <UButton
                            size="sm"
                            color="info"
                            variant="soft"
                            :disabled="loadingEmail[emp.id]"
                            @click="enviarEmail(emp)"
                        >
                            <template v-if="loadingEmail[emp.id]">
                                <svg class="animate-spin h-4 w-4 mr-2 inline-block text-blue-500 dark:text-blue-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                                </svg>
                                <span class="ml-1">Enviando...</span>
                            </template>
                            <template v-else>
                                <UIcon name="i-heroicons-envelope" class="size-4 dark:text-blue-300" />
                            </template>
                        </UButton>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>
