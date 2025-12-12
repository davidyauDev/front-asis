<template>
    <UCard>
        <template #header>

            <div class="mx-auto ">
                <header class="mb-6">
                    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div class="flex items-center gap-4">
                            <div
                                class="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/20">

                                <UIcon name="i-lucide-cake" class="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <div class="flex items-center gap-2">
                                    <h2 class="text-xl font-semibold text-foreground">Historial de Cumpleaños</h2>

                                    <UBadge variant="solid" class="text-xs font-semibold">{{ data.length }}
                                        {{ data.length === 1 ? 'registro' : 'registros' }}
                                    </UBadge>
                                </div>
                                <p class="text-sm text-muted-foreground">Correos de felicitación enviados
                                    automáticamente</p>
                            </div>
                        </div>
                        <div class="flex gap-2">

                            <USelectMenu v-model="selectedYear" :items="years" class="w-32"
                                placeholder="Seleccionar año">
                                <template #empty>

                                    No hay años disponibles

                                </template>
                            </USelectMenu>


                            <UButton variant="outline" size="md" class="h-9 px-3 gap-2" icon="i-lucide-download">
                                Exportar
                            </UButton>

                        </div>
                    </div>
                </header>


                <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">



                    <UInput v-model="searchTerm" placeholder="Buscar colaborador..." icon="i-lucide-search"
                        class="flex-1 max-w-sm bg-card/50 border-border/50" size="md" clearable />




                    <UTabs class="space-x-2" :items="tabs" v-model="selectedTab" size="md" />

                </div>





            </div>
        </template>

        <div class="space-y-4">
            <DataState :loading="loading" :error="!!error" @retry="refresh">




                <section v-if="list.length > 0">
                    <div class="space-y-2">



                        <div v-for="(history, i) in list"
                            class="group flex items-center justify-between  bg-card/50 px-4 py-3 transition-all  hover:bg-card"
                            :key="i" :class="{
                                'border-t border-default': i > 0
                            }">
                            <div class="flex items-center gap-3">

                                <UAvatar :alt="history.first_name + ' ' + history.last_name" size="xl" />
                                <div class="min-w-0">
                                    <p class="truncate font-medium text-foreground">{{ history.first_name }} {{
                                        history.last_name }}
                                    </p>
                                    <div class="flex items-center gap-3 text-xs text-muted-foreground">
                                        <span class="flex items-center gap-1">


                                            <UIcon name="i-lucide-mail" class="h-3 w-3" />

                                            <span class="hidden sm:inline">{{ history.email }}</span>
                                        </span>

                                        <span class="flex items-center gap-1">
                                            <UIcon name="i-lucide-calendar" class="h-3 w-3" />

                                            {{ format(parseISO(history.birthday), 'dd MMM', {
                                                locale: es
                                            }) }}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div class="flex items-center gap-4">
                                <div class="hidden text-right text-sm md:block"><span class="text-muted-foreground">{{
                                    format(parseISO(history.sent_at), 'dd MMM yyyy hh:mm a', { locale: es })
                                        }}</span>
                                </div>

                                <UTooltip :text="history.error_message">
                                    <UBadge icon="i-lucide-check"
                                        :color="birthdayGreetingsStatusOp[history.status].severity" variant="soft"
                                        class="text-xs">{{ birthdayGreetingsStatusOp[history.status].label }}
                                    </UBadge>

                                </UTooltip>

                                <UTooltip v-if="history.status === BirthdayGreetingsStatus.FAILED"
                                    text="Reintentar envío">
                                    <UButton :loading="loadingRetry" variant="ghost" size="xs"
                                        icon="i-lucide-rotate-ccw" class="cursor-pointer"
                                        @click="retrySendingGreeting(history)">

                                    </UButton>
                                </UTooltip>

                            </div>
                        </div>

                    </div>
                </section>




                <!-- Estado vacío -->
                <div v-else class="text-center py-12">
                    <UIcon name="i-lucide-cake" class="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">No hay cumpleaños programados
                    </h3>
                    <p class="text-gray-500 dark:text-gray-400">Parece que no hay cumpleaños programados en este
                        momento.
                    </p>
                </div>

            </DataState>
        </div>
    </UCard>


</template>



<script setup lang="ts">
import type { TabsItem } from '@nuxt/ui';
import { type BirthdayGreetingsHistory, BirthdayGreetingsStatus, birthdayGreetingsStatusOp } from '~/interfaces/birthday-greetings-history';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

const currentYear = new Date().getFullYear();
const firstYear = 1990;
const years = Array.from({ length: currentYear - firstYear + 1 }, (_, index) => firstYear + index).reverse();

const selectedYear = ref(currentYear);

const searchTerm = ref('');

const selectedTab = ref('all');

const loadingRetry = ref(false);

const {
    data, pending: loading, error, refresh } = await useFetch<BirthdayGreetingsHistory[]>('/birthday-greetings-history', {
        $fetch: useNuxtApp().$api,
        default: () => [],
    });


const list = computed(() => {
    let filteredData = data.value;

    if (selectedYear.value) {
        filteredData = filteredData.filter(item => {
            const sentDate = item.sent_at ? new Date(item.sent_at) : null;
            return sentDate && sentDate.getFullYear() === selectedYear.value;
        });
    }

    if (searchTerm.value) {
        const term = searchTerm.value.toLowerCase();
        filteredData = filteredData.filter(item =>
            item.first_name.toLowerCase().includes(term) ||
            item.last_name.toLowerCase().includes(term) ||
            item.email.toLowerCase().includes(term)
        );
    }

    if (selectedTab.value === 'sent') {
        filteredData = filteredData.filter(item => item.status === BirthdayGreetingsStatus.SENT);
    } else if (selectedTab.value === 'failed') {
        filteredData = filteredData.filter(item => item.status === BirthdayGreetingsStatus.FAILED);
    }

    return filteredData;
});


const retrySendingGreeting = async (history: BirthdayGreetingsHistory) => {
    const toast = useToast();
    loadingRetry.value = true;
    try {
        const token = localStorage.getItem('auth_token') || '';
        const config = useRuntimeConfig();
        await $fetch(config.public.apiBaseUrl + '/api/birthday-greetings-history/retry-failed', {
            method: 'POST',

            body: {
                id: history.id
            },
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                // 'Content-Type': 'application/json'
            }

        });


        toast.add({
            title: 'Reintento exitoso',
            description: 'El correo de felicitación se ha reenviado correctamente.',
            color: 'success'
        });



        await refresh();
    } catch (error) {
        console.error('Error al reintentar el envío:', error);
        toast.add({
            title: 'Error',
            description: 'No se pudo reenviar el correo de felicitación. Por favor, inténtalo de nuevo más tarde.',
            color: 'error'
        });
    } finally {
        loadingRetry.value = false;
    }
};

const tabs: TabsItem[] = [
    {
        label: 'Todos', value: 'all',

        icon: 'i-lucide-filter'

    },
    {
        label: 'Enviados', value: 'sent',
        icon: 'i-lucide-check'

    },

    { label: 'Fallidos', value: 'failed', icon: 'i-lucide-x' },
];

</script>