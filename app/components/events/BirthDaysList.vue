<template>
    <UCard>
        <template #header>
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Historial de Cumpleaños</h2>
        </template>

        <div class="space-y-4">


            <section>
                <div class="space-y-2">
                    <div
                        class="group flex items-center justify-between rounded-lg border border-border/50 bg-card/50 px-4 py-3 transition-all hover:border-primary/30 hover:bg-card">
                        <div class="flex items-center gap-3">
                            <div
                                class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/30 to-primary/10 text-primary ring-1 ring-primary/20">
                                <span class="text-sm font-bold">MG</span>
                            </div>
                            <div class="min-w-0">
                                <p class="truncate font-medium text-foreground">María García López</p>
                                <div class="flex items-center gap-3 text-xs text-muted-foreground"><span
                                        class="flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg"
                                            width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                            stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                                            class="lucide lucide-mail h-3 w-3">
                                            <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                                            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                                        </svg><span class="hidden sm:inline">maria.garcia@empresa.com</span></span><span
                                        class="flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg"
                                            width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                            stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                                            class="lucide lucide-calendar h-3 w-3">
                                            <path d="M8 2v4"></path>
                                            <path d="M16 2v4"></path>
                                            <rect width="18" height="18" x="3" y="4" rx="2"></rect>
                                            <path d="M3 10h18"></path>
                                        </svg>10 dic</span></div>
                            </div>
                        </div>
                        <div class="flex items-center gap-4">
                            <div class="hidden text-right text-sm md:block"><span class="text-muted-foreground">11 dic
                                    2024</span></div>
                            <div
                                class="inline-flex items-center rounded-full border px-2.5 py-0.5 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 gap-1.5 text-xs font-medium bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                    fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                    stroke-linejoin="round" class="lucide lucide-check h-3 w-3">
                                    <path d="M20 6 9 17l-5-5"></path>
                                </svg>Enviado
                            </div>
                        </div>
                    </div>
                    <div
                        class="group flex items-center justify-between rounded-lg border border-border/50 bg-card/50 px-4 py-3 transition-all hover:border-primary/30 hover:bg-card">
                        <div class="flex items-center gap-3">
                            <div
                                class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/30 to-primary/10 text-primary ring-1 ring-primary/20">
                                <span class="text-sm font-bold">CR</span>
                            </div>
                            <div class="min-w-0">
                                <p class="truncate font-medium text-foreground">Carlos Rodríguez Martínez</p>
                                <div class="flex items-center gap-3 text-xs text-muted-foreground"><span
                                        class="flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg"
                                            width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                            stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                                            class="lucide lucide-mail h-3 w-3">
                                            <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                                            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                                        </svg><span
                                            class="hidden sm:inline">carlos.rodriguez@empresa.com</span></span><span
                                        class="flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg"
                                            width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                            stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                                            class="lucide lucide-calendar h-3 w-3">
                                            <path d="M8 2v4"></path>
                                            <path d="M16 2v4"></path>
                                            <rect width="18" height="18" x="3" y="4" rx="2"></rect>
                                            <path d="M3 10h18"></path>
                                        </svg>09 dic</span></div>
                            </div>
                        </div>
                        <div class="flex items-center gap-4">
                            <div class="hidden text-right text-sm md:block"><span class="text-muted-foreground">10 dic
                                    2024</span></div>
                            <div
                                class="inline-flex items-center rounded-full border px-2.5 py-0.5 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 gap-1.5 text-xs font-medium bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                    fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                    stroke-linejoin="round" class="lucide lucide-check h-3 w-3">
                                    <path d="M20 6 9 17l-5-5"></path>
                                </svg>Enviado
                            </div>
                        </div>
                    </div>
                    <div
                        class="group flex items-center justify-between rounded-lg border border-border/50 bg-card/50 px-4 py-3 transition-all hover:border-primary/30 hover:bg-card">
                        <div class="flex items-center gap-3">
                            <div
                                class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/30 to-primary/10 text-primary ring-1 ring-primary/20">
                                <span class="text-sm font-bold">AF</span>
                            </div>
                            <div class="min-w-0">
                                <p class="truncate font-medium text-foreground">Ana Fernández Ruiz</p>
                                <div class="flex items-center gap-3 text-xs text-muted-foreground"><span
                                        class="flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg"
                                            width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                            stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                                            class="lucide lucide-mail h-3 w-3">
                                            <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                                            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                                        </svg><span
                                            class="hidden sm:inline">ana.fernandez@empresa.com</span></span><span
                                        class="flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg"
                                            width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                            stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                                            class="lucide lucide-calendar h-3 w-3">
                                            <path d="M8 2v4"></path>
                                            <path d="M16 2v4"></path>
                                            <rect width="18" height="18" x="3" y="4" rx="2"></rect>
                                            <path d="M3 10h18"></path>
                                        </svg>08 dic</span></div>
                            </div>
                        </div>
                        <div class="flex items-center gap-4">
                            <div class="hidden text-right text-sm md:block"><span class="text-muted-foreground">09 dic
                                    2024</span></div>
                            <div
                                class="inline-flex items-center rounded-full border px-2.5 py-0.5 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 gap-1.5 text-xs font-medium bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                    fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                    stroke-linejoin="round" class="lucide lucide-check h-3 w-3">
                                    <path d="M20 6 9 17l-5-5"></path>
                                </svg>Enviado
                            </div>
                        </div>
                    </div>
                    <div
                        class="group flex items-center justify-between rounded-lg border border-border/50 bg-card/50 px-4 py-3 transition-all hover:border-primary/30 hover:bg-card">
                        <div class="flex items-center gap-3">
                            <div
                                class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/30 to-primary/10 text-primary ring-1 ring-primary/20">
                                <span class="text-sm font-bold">PS</span>
                            </div>
                            <div class="min-w-0">
                                <p class="truncate font-medium text-foreground">Pedro Sánchez Torres</p>
                                <div class="flex items-center gap-3 text-xs text-muted-foreground"><span
                                        class="flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg"
                                            width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                            stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                                            class="lucide lucide-mail h-3 w-3">
                                            <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                                            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                                        </svg><span
                                            class="hidden sm:inline">pedro.sanchez@empresa.com</span></span><span
                                        class="flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg"
                                            width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                            stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                                            class="lucide lucide-calendar h-3 w-3">
                                            <path d="M8 2v4"></path>
                                            <path d="M16 2v4"></path>
                                            <rect width="18" height="18" x="3" y="4" rx="2"></rect>
                                            <path d="M3 10h18"></path>
                                        </svg>07 dic</span></div>
                            </div>
                        </div>
                        <div class="flex items-center gap-4">
                            <div class="hidden text-right text-sm md:block"><span class="text-muted-foreground">08 dic
                                    2024</span></div>
                            <div
                                class="inline-flex items-center rounded-full border px-2.5 py-0.5 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 gap-1.5 text-xs font-medium bg-red-500/20 text-red-400 border-red-500/30">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                    fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                    stroke-linejoin="round" class="lucide lucide-circle-alert h-3 w-3">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="12" x2="12" y1="8" y2="12"></line>
                                    <line x1="12" x2="12.01" y1="16" y2="16"></line>
                                </svg>Fallido
                            </div><button
                                class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                                title="Reenviar"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                                    stroke-linecap="round" stroke-linejoin="round"
                                    class="lucide lucide-rotate-ccw h-4 w-4">
                                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                                    <path d="M3 3v5h5"></path>
                                </svg></button>
                        </div>
                    </div>
                    <div
                        class="group flex items-center justify-between rounded-lg border border-border/50 bg-card/50 px-4 py-3 transition-all hover:border-primary/30 hover:bg-card">
                        <div class="flex items-center gap-3">
                            <div
                                class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/30 to-primary/10 text-primary ring-1 ring-primary/20">
                                <span class="text-sm font-bold">LJ</span>
                            </div>
                            <div class="min-w-0">
                                <p class="truncate font-medium text-foreground">Laura Jiménez Díaz</p>
                                <div class="flex items-center gap-3 text-xs text-muted-foreground"><span
                                        class="flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg"
                                            width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                            stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                                            class="lucide lucide-mail h-3 w-3">
                                            <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                                            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                                        </svg><span
                                            class="hidden sm:inline">laura.jimenez@empresa.com</span></span><span
                                        class="flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg"
                                            width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                            stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                                            class="lucide lucide-calendar h-3 w-3">
                                            <path d="M8 2v4"></path>
                                            <path d="M16 2v4"></path>
                                            <rect width="18" height="18" x="3" y="4" rx="2"></rect>
                                            <path d="M3 10h18"></path>
                                        </svg>06 dic</span></div>
                            </div>
                        </div>
                        <div class="flex items-center gap-4">
                            <div class="hidden text-right text-sm md:block"><span class="text-muted-foreground">07 dic
                                    2024</span></div>
                            <div
                                class="inline-flex items-center rounded-full border px-2.5 py-0.5 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 gap-1.5 text-xs font-medium bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                    fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                    stroke-linejoin="round" class="lucide lucide-check h-3 w-3">
                                    <path d="M20 6 9 17l-5-5"></path>
                                </svg>Enviado
                            </div>
                        </div>
                    </div>
                    <div
                        class="group flex items-center justify-between rounded-lg border border-border/50 bg-card/50 px-4 py-3 transition-all hover:border-primary/30 hover:bg-card">
                        <div class="flex items-center gap-3">
                            <div
                                class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/30 to-primary/10 text-primary ring-1 ring-primary/20">
                                <span class="text-sm font-bold">MH</span>
                            </div>
                            <div class="min-w-0">
                                <p class="truncate font-medium text-foreground">Miguel Hernández Pérez</p>
                                <div class="flex items-center gap-3 text-xs text-muted-foreground"><span
                                        class="flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg"
                                            width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                            stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                                            class="lucide lucide-mail h-3 w-3">
                                            <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                                            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                                        </svg><span
                                            class="hidden sm:inline">miguel.hernandez@empresa.com</span></span><span
                                        class="flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg"
                                            width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                            stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                                            class="lucide lucide-calendar h-3 w-3">
                                            <path d="M8 2v4"></path>
                                            <path d="M16 2v4"></path>
                                            <rect width="18" height="18" x="3" y="4" rx="2"></rect>
                                            <path d="M3 10h18"></path>
                                        </svg>11 dic</span></div>
                            </div>
                        </div>
                        <div class="flex items-center gap-4">
                            <div class="hidden text-right text-sm md:block"><span
                                    class="text-muted-foreground">Programado</span></div>
                            <div
                                class="inline-flex items-center rounded-full border px-2.5 py-0.5 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 gap-1.5 text-xs font-medium bg-amber-500/20 text-amber-400 border-amber-500/30">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                    fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                    stroke-linejoin="round" class="lucide lucide-clock h-3 w-3">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <polyline points="12 6 12 12 16 14"></polyline>
                                </svg>Pendiente
                            </div>
                        </div>
                    </div>
                </div>
            </section>




            <!-- Estado vacío -->
            <div class="text-center py-12">
                <UIcon name="i-lucide-cake" class="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">No hay cumpleaños programados</h3>
                <p class="text-gray-500 dark:text-gray-400">Parece que no hay cumpleaños programados en este momento.
                </p>
            </div>
        </div>
    </UCard>



    <div class="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <header class="mb-6">
            <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div class="flex items-center gap-4">
                    <div
                        class="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/20">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                            class="lucide lucide-cake h-5 w-5 text-primary">
                            <path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8"></path>
                            <path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1"></path>
                            <path d="M2 21h20"></path>
                            <path d="M7 8v3"></path>
                            <path d="M12 8v3"></path>
                            <path d="M17 8v3"></path>
                            <path d="M7 4h.01"></path>
                            <path d="M12 4h.01"></path>
                            <path d="M17 4h.01"></path>
                        </svg>
                    </div>
                    <div>
                        <div class="flex items-center gap-2">
                            <h1 class="text-xl font-semibold text-foreground">Historial de Cumpleaños</h1>
                            <div
                                class="inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 text-xs">
                                6 registros</div>
                        </div>
                        <p class="text-sm text-muted-foreground">Correos de felicitación enviados automáticamente</p>
                    </div>
                </div>
                <div class="flex gap-2"><button
                        class="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3 gap-2"><svg
                            xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                            class="lucide lucide-calendar h-4 w-4">
                            <path d="M8 2v4"></path>
                            <path d="M16 2v4"></path>
                            <rect width="18" height="18" x="3" y="4" rx="2"></rect>
                            <path d="M3 10h18"></path>
                        </svg><span class="hidden sm:inline">Diciembre 2024</span></button><button
                        class="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3 gap-2"><svg
                            xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                            class="lucide lucide-download h-4 w-4">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7 10 12 15 17 10"></polyline>
                            <line x1="12" x2="12" y1="15" y2="3"></line>
                        </svg><span class="hidden sm:inline">Exportar</span></button></div>
            </div>
        </header>
        <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div class="relative flex-1 max-w-sm"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                    stroke-linejoin="round"
                    class="lucide lucide-search absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.3-4.3"></path>
                </svg><input
                    class="flex h-10 w-full rounded-md border px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm pl-9 bg-card/50 border-border/50"
                    placeholder="Buscar colaborador..."></div>
            <div class="flex gap-2"><button
                    class="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3 gap-1.5 text-muted-foreground"><svg
                        xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                        class="lucide lucide-filter h-4 w-4">
                        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                    </svg>Todos</button><button
                    class="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3 gap-1.5 text-emerald-400">Enviados</button><button
                    class="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3 gap-1.5 text-amber-400">Pendientes</button><button
                    class="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3 gap-1.5 text-red-400">Fallidos</button>
            </div>
        </div>



       
        <!-- <footer class="mt-6 flex items-center justify-between text-sm text-muted-foreground"><span>Mostrando 6 de 6
                registros</span>
            <div class="flex gap-2"><button
                    class="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3"
                    disabled="">Anterior</button><button
                    class="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3"
                    disabled="">Siguiente</button></div>
        </footer> -->
    </div>

</template>