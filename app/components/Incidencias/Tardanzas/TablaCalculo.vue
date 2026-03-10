<script setup lang="ts">
import { apiFetch } from '~/services/api';

const props = defineProps<{
    fechaInicio: string,
    fechaFin: string,
    filtroUsuario: string,
    filtroEmpresa: string,
    filtroDepartamento: string
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

    const departamento = props.filtroDepartamento?.trim().toLowerCase();
    if (departamento) {
        list = list.filter((e) => {
            const empDepto = (e.departamento ?? '').toString().trim().toLowerCase();
            return empDepto === departamento;
        });
    }

    return list;
});
const toast = useToast();
const sortField = ref<'dni' | 'nombre' | 'departamento' | 'empresa' | ''>('');
const sortDirection = ref<'asc' | 'desc'>('asc');
const sortCollator = new Intl.Collator('es', { numeric: true, sensitivity: 'base' });

const obtenerValorOrden = (emp: any, campo: string) => {
    switch (campo) {
        case 'dni':
            return String(emp.dni ?? '').trim();
        case 'nombre':
            return `${emp.apellidos ?? ''} ${emp.nombre ?? ''}`.trim();
        case 'departamento':
            return String(emp.departamento ?? '').trim();
        case 'empresa':
            return String(emp.empresa ?? '').trim();
        default:
            return '';
    }
};

const empleadosOrdenados = computed(() => {
    const list = [...empleadosFiltrados.value];
    if (!sortField.value) return list;

    list.sort((a, b) => {
        const av = obtenerValorOrden(a, sortField.value);
        const bv = obtenerValorOrden(b, sortField.value);
        const cmp = sortCollator.compare(av, bv);
        return sortDirection.value === 'asc' ? cmp : -cmp;
    });

    return list;
});

const toggleSort = (campo: 'dni' | 'nombre' | 'departamento' | 'empresa') => {
    if (sortField.value === campo) {
        sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
        return;
    }
    sortField.value = campo;
    sortDirection.value = 'asc';
};

const sortIcon = (campo: 'dni' | 'nombre' | 'departamento' | 'empresa') => {
    if (sortField.value !== campo) return 'i-heroicons-arrows-up-down';
    return sortDirection.value === 'asc'
        ? 'i-heroicons-arrow-up'
        : 'i-heroicons-arrow-down';
};
const convertirAMinutos = (t: string) => {
    if (!t || t === "-") return 0;

    const p = t.split(":").map((v) => Number.parseInt(v, 10));
    const [h = 0, m = 0, s = 0] = p;

    return p.length >= 3
        ? h * 60 + m + Math.round(s / 60)
        : h * 60 + m;
};


const normalizarHHMM = (t?: string | null) => {
    if (!t || t === '-') return '00:00';

    const [hRaw, mRaw] = t.split(':');
    const h = Number.parseInt(hRaw ?? '', 10);
    const m = Number.parseInt(mRaw ?? '', 10);

    if (!Number.isFinite(h) || !Number.isFinite(m)) return '00:00';
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

const loadingEmail = ref<{ [key: string]: boolean }>({});

const emailKey = (emp: any) => String(emp.dni ?? emp.email ?? '');

const tardanzaNetaCero = (emp: any) => convertirAMinutos(String(emp.neto_hhmm ?? '-')) === 0;

const confirmarEnvioOpen = ref(false);
const empConfirmacion = shallowRef<any | null>(null);

const payloadConfirmacion = computed(() => {
    if (!empConfirmacion.value) return null;

    return {
        email: String(empConfirmacion.value.email ?? '').trim(),
        nombre: String(empConfirmacion.value.nombre ?? '').trim(),
        minutos_tardanza: normalizarHHMM(empConfirmacion.value.neto_hhmm),
        start_date: props.fechaInicio,
        end_date: props.fechaFin,
    };
});

function solicitarConfirmacionEnvio(emp: any) {
    if (tardanzaNetaCero(emp)) return;

    const email = String(emp.email ?? '').trim();
    if (!email) {
        toast.add({
            title: 'Error',
            description: 'El usuario no tiene email registrado',
            color: 'error',
        });
        return;
    }

    empConfirmacion.value = emp;
    confirmarEnvioOpen.value = true;
}

function handleConfirmarEnvioOpen(isOpen: boolean) {
    if (!isOpen) empConfirmacion.value = null;
}

async function confirmarEnvioCorreo() {
    if (!empConfirmacion.value) return;
    const ok = await enviarEmail(empConfirmacion.value);
    if (ok) {
        confirmarEnvioOpen.value = false;
        empConfirmacion.value = null;
    }
}

async function enviarEmail(emp: any): Promise<boolean> {
    try {
        if (tardanzaNetaCero(emp)) {
            toast.add({
                title: 'Sin tardanza neta',
                description: 'No se puede enviar correo si la tardanza neta es 00:00',
                color: 'warning',
            });
            return false;
        }

        const key = emailKey(emp);
        loadingEmail.value[key] = true;

        const payload = {
            email: String(emp.email ?? '').trim(),
            nombre: String(emp.nombre ?? '').trim(),
            minutos_tardanza: normalizarHHMM(emp.neto_hhmm),
            start_date: props.fechaInicio,
            end_date: props.fechaFin,
            nro:emp.id,
            dni:emp.dni,
            apellidos:emp.apellidos,
            departamento:emp.departamento,
            empresa:emp.empresa
        };

        if (!payload.email) {
            toast.add({
                title: 'Error',
                description: 'El usuario no tiene email registrado',
                color: 'error',
            });
            return false;
        }

        await apiFetch('/api/tardanzas/enviar-correo', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
        toast.add({
            title: 'Correo enviado',
            description: `Se envió el correo a ${payload.email}`,
            color: 'success',
        });

        return true;
    } catch (error) {
        toast.add({
            title: 'Error',
            description: 'No se pudo enviar el correo',
            color: 'error',
        });
        return false;
    } finally {
        const key = emailKey(emp);
        loadingEmail.value[key] = false;
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
            duration: 0
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
            color: 'success',
            duration: 3000
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
            color: 'error',
            duration: 8000
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
                    <th class="border px-3 py-2 dark:border-gray-700">
                        <button
                            type="button"
                            class="inline-flex items-center gap-2 font-semibold hover:text-blue-100 transition-colors"
                            @click="toggleSort('dni')"
                        >
                            DNI
                            <UIcon :name="sortIcon('dni')" class="w-4 h-4" />
                        </button>
                    </th>
                    <th class="border px-4 py-2 dark:border-gray-700">
                        <button
                            type="button"
                            class="inline-flex items-center gap-2 font-semibold hover:text-blue-100 transition-colors"
                            @click="toggleSort('nombre')"
                        >
                            APELLIDOS Y NOMBRES
                            <UIcon :name="sortIcon('nombre')" class="w-4 h-4" />
                        </button>
                    </th>
                    <th class="border px-4 py-2 dark:border-gray-700">
                        <button
                            type="button"
                            class="inline-flex items-center gap-2 font-semibold hover:text-blue-100 transition-colors"
                            @click="toggleSort('departamento')"
                        >
                            DEPARTAMENTO
                            <UIcon :name="sortIcon('departamento')" class="w-4 h-4" />
                        </button>
                    </th>
                    <th class="border px-4 py-2 dark:border-gray-700">
                        <button
                            type="button"
                            class="inline-flex items-center gap-2 font-semibold hover:text-blue-100 transition-colors"
                            @click="toggleSort('empresa')"
                        >
                            EMPRESA
                            <UIcon :name="sortIcon('empresa')" class="w-4 h-4" />
                        </button>
                    </th>
                    <th class="border px-3 py-2 bg-blue-700 dark:bg-blue-800 dark:text-blue-200 dark:border-gray-700">Tardanza Acumulada</th>
                    <th class="border px-3 py-2 bg-purple-700 dark:bg-purple-800 dark:text-purple-200 dark:border-gray-700">Descuentos por Incidencia</th>
                    <th class="border px-3 py-2 bg-green-700 dark:bg-green-800 dark:text-green-200 dark:border-gray-700">Tardanza Neta</th>
                    <th class="border px-3 py-2 bg-green-700 dark:bg-green-800 dark:text-green-200 dark:border-gray-700">Acciones</th>
                </tr>
            </thead>

            <tbody>
                <tr v-for="emp in empleadosOrdenados" :key="emp.dni" class="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td class="border px-2 text-center dark:border-gray-700">{{ emp.dni }}</td>
                    <td class="border px-3 dark:border-gray-700">
                        {{ emp.apellidos }} {{ emp.nombre }}
                    </td>
                    <td class="border px-3 dark:border-gray-700">
                        {{ emp.departamento || '' }}
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
                            :disabled="loadingEmail[emailKey(emp)] || tardanzaNetaCero(emp)"
                            @click="solicitarConfirmacionEnvio(emp)"
                        >
                            <template v-if="loadingEmail[emailKey(emp)]">
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

    <UModal
        v-model:open="confirmarEnvioOpen"
        title="Confirmar envío de correo"
        description="Revisa la información antes de enviar."
        @update:open="handleConfirmarEnvioOpen"
    >
        <template #body>
            <div class="space-y-3 text-sm">
                <div class="grid grid-cols-[140px_1fr] gap-x-3 gap-y-2">
                    <div class="font-semibold text-gray-700 dark:text-gray-200">Email</div>
                    <div class="text-gray-900 dark:text-gray-100">{{ payloadConfirmacion?.email }}</div>

                    <div class="font-semibold text-gray-700 dark:text-gray-200">Nombre</div>
                    <div class="text-gray-900 dark:text-gray-100">{{ payloadConfirmacion?.nombre }}</div>

                    <div class="font-semibold text-gray-700 dark:text-gray-200">Tardanza</div>
                    <div class="text-gray-900 dark:text-gray-100">{{ payloadConfirmacion?.minutos_tardanza }}</div>

                    <div class="font-semibold text-gray-700 dark:text-gray-200">Desde</div>
                    <div class="text-gray-900 dark:text-gray-100">{{ payloadConfirmacion?.start_date }}</div>

                    <div class="font-semibold text-gray-700 dark:text-gray-200">Hasta</div>
                    <div class="text-gray-900 dark:text-gray-100">{{ payloadConfirmacion?.end_date }}</div>
                </div>

                <div class="flex justify-end gap-2 pt-2">
                    <UButton
                        label="Cancelar"
                        color="neutral"
                        variant="subtle"
                        @click="confirmarEnvioOpen = false"
                    />
                    <UButton
                        label="Enviar correo"
                        color="info"
                        variant="solid"
                        :disabled="!empConfirmacion || loadingEmail[emailKey(empConfirmacion)]"
                        :loading="!!empConfirmacion && loadingEmail[emailKey(empConfirmacion)]"
                        @click="confirmarEnvioCorreo"
                    />
                </div>
            </div>
        </template>
    </UModal>
</template>
