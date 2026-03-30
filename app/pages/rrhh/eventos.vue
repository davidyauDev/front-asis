<script setup lang="ts">
import type { EventoCalendario } from '~/composables/useEventos'
import BirthDaysList from '~/components/events/BirthDaysList.vue';

definePageMeta({ middleware: "auth" });

const { 
  obtenerEventosPorMes,
  transformarEventosParaCalendario,
  updateEvent,
} = useEventos()

const { user, isLoggedIn } = useAuth()

const selectedTab = ref("calendar");
const selectedDateForUpload = ref<string | null>(null);
const showAddEventModal = ref(false);

const calendarKey = ref(0);

const eventosDelMes = ref<EventoCalendario[]>([]);
const isLoading = ref(false);

const isLoadingCalendar = ref(false);
const isLoadingEvents = ref(false);
const showCalendarSkeleton = ref(false); // Solo cuando realmente cargue del servidor
const loadingProgress = ref(0);
const isInitialLoad = ref(true); // Para distinguir primera carga vs cambio de tab

// Eliminado: eventos de prueba

onMounted(async () => {

  // Si el usuario ya está logueado, cargar eventos del mes actual
  if (isLoggedIn.value) {
    // Solo mostrar skeleton en la primera carga real del servidor
    showCalendarSkeleton.value = true;
    isLoadingEvents.value = true;
    
    const hoy = new Date();
    await cargarEventosDelMes(hoy.getFullYear(), hoy.getMonth() + 1);
    
    isInitialLoad.value = false; // Ya no es la primera carga
  } else {
    isInitialLoad.value = false;
  }
  
  console.log('✅ Componente listo');
});

// Watcher para cargar eventos cuando el usuario se autentique
watch(isLoggedIn, async (newValue, oldValue) => {
  if (newValue && !oldValue) {
    console.log('🔑 Usuario autenticado, cargando eventos...');
    const hoy = new Date();
    await cargarEventosDelMes(hoy.getFullYear(), hoy.getMonth() + 1);
  }
});


watch(updateEvent, async (newValue, oldValue) => {
  console.log('👀 watch updateEvent:', { newValue, oldValue });
  if (newValue && newValue !== oldValue) {
    console.log('🔄 Evento actualizado, recargando calendario...');
    const hoy = new Date();
    await cargarEventosDelMes(hoy.getFullYear(), hoy.getMonth() + 1);
    updateEvent.value = false;
  }
});



const recargarCalendario = async (nuevoEvento?: any) => {
  console.log('🔄 [RECARGA] Iniciando recarga del calendario...');
  
  isLoading.value = true;
  isLoadingCalendar.value = true;
  loadingProgress.value = 0;
  
  // NO mostrar skeleton para recargas, solo un loading sutil
  showCalendarSkeleton.value = false;
  
  try {
    if (nuevoEvento) {
      console.log('📅 [RECARGA] Nuevo evento creado:', nuevoEvento);
      
      loadingProgress.value = 30;
      
      // Obtener fecha del evento para saber qué mes recargar
      const fechaEvento = new Date(nuevoEvento.fecha_inicio || nuevoEvento.fecha || new Date());
      const año = fechaEvento.getFullYear();
      const mes = fechaEvento.getMonth() + 1;
      
      console.log(`📅 [RECARGA] Recargando eventos para ${mes}/${año}`);
      
      loadingProgress.value = 60;
      
      // Recarga más rápida sin limpiar todo
      await cargarEventosDelMes(año, mes);
      
      loadingProgress.value = 90;
      
      // Forzar re-render del calendario
      calendarKey.value++;
      
  // Forzar actualización de los computeds
  triggerRef(eventosDelMes);
      
      loadingProgress.value = 100;
      
      console.log(`✅ [RECARGA] Calendario actualizado con ${eventosDelMes.value.length} eventos`);
      
      // Mostrar notificación de éxito
      const toast = useToast();
      toast.add({
        title: '🔄 Calendario actualizado',
        description: `El calendario se actualizó con ${eventosDelMes.value.length} eventos para ${mes}/${año}`,
        color: 'success'
      });
    } else {
      // Si no hay evento específico, recargar el mes actual
      console.log('📅 [RECARGA] Recargando mes actual...');
      loadingProgress.value = 50;
      const hoy = new Date();
      await cargarEventosDelMes(hoy.getFullYear(), hoy.getMonth() + 1);
      calendarKey.value++; // Forzar re-render
      loadingProgress.value = 100;
    }
    
    // Pausa muy breve para mostrar el 100%
    await new Promise(resolve => setTimeout(resolve, 100));
    
  } catch (error) {
    console.error('❌ [RECARGA] Error al recargar calendario:', error);
    const toast = useToast();
    toast.add({
      title: '⚠️ Error al actualizar',
      description: 'No se pudo actualizar el calendario automáticamente. Intenta recargar la página.',
      color: 'error'
    });
  } finally {
    isLoading.value = false;
    isLoadingCalendar.value = false;
    loadingProgress.value = 0;
    console.log('🏁 [RECARGA] Proceso de recarga completado');
  }
};

const cargarEventosDelMes = async (año: number, mes: number) => {
  console.log(`🔄 Iniciando carga de eventos para ${año}/${mes} - isLoading: ${isLoading.value}`);
  
  if (isLoading.value && !isLoadingCalendar.value) {
    console.log('⚠️ Ya hay una carga en progreso, ignorando...');
    return;
  }
  
  isLoading.value = true;
  isLoadingEvents.value = true;
  
  // Solo mostrar skeleton si es la primera carga o si tardará mucho
  if (isInitialLoad.value) {
    showCalendarSkeleton.value = true;
  }
  
  console.log(`🔄 isLoading establecido a: ${isLoading.value}`);
  
  // Usar setTimeout para asegurar que la UI se actualice
  await nextTick();
  
  try {
    console.log(`🌐 Cargando eventos para ${año}-${mes} desde API...`);
    
    // Intentar cargar de la API siempre primero
    const eventosAPI = await obtenerEventosPorMes(año, mes);
    const eventosTransformados = transformarEventosParaCalendario(eventosAPI);
    
    // Asignar los nuevos eventos de manera reactiva
    eventosDelMes.value = [...eventosTransformados]; // Usar spread para crear nueva referencia
    
    // Forzar reactividad
    await nextTick();
    triggerRef(eventosDelMes);
    
    console.log(`✅ Se cargaron ${eventosTransformados.length} eventos desde la API`);
    
    // Log detallado de los eventos para debug
    eventosTransformados.forEach((evento, index) => {
      console.log(`📅 Evento ${index + 1}:`, {
        id: evento.id,
        nombre: evento.nombre,
        fecha: evento.fecha,
        categoria: evento.categoria,
        estado: evento.estado,
        // fecha_fin: evento.fecha_fin
      });
    });
    
    // Mostrar mensaje de éxito si hay eventos
    if (eventosTransformados.length > 0) {
      const toast = useToast();
      toast.add({
        title: "Eventos cargados",
        description: `Se cargaron ${eventosAPI.length} eventos (${eventosTransformados.length} días) para ${año}/${mes}`,
        color: "success"
      });
    } else {
      console.log('ℹ️ No se encontraron eventos para este mes');
    }
    
  } catch (error: any) {
    console.error('💥 Error al cargar eventos del mes:', error);
    eventosDelMes.value = []; // Limpiar en caso de error
    
    const toast = useToast();
    
    // Manejar errores específicos
    if (error.message?.includes('Token de autenticación inválido')) {
      toast.add({
        title: "🚫 Sesión expirada",
        description: "Tu sesión ha expirado. Por favor inicia sesión nuevamente.",
        color: "error"
      });
      
      // Opcional: redirigir al login
      // await navigateTo('/login');
    } else if (error.message?.includes('No hay token de autenticación')) {
      toast.add({
        title: "🚫 No autenticado",
        description: "Necesitas iniciar sesión para ver los eventos.",
        color: "warning"
      });
    } else {
      toast.add({
        title: "Error al cargar eventos",
        description: `No se pudieron cargar los eventos: ${error.message || 'Error de servidor'}`,
        color: "error"
      });
    }
  } finally {
    // Limpieza rápida de estados de loading
    isLoading.value = false;
    isLoadingEvents.value = false;
    
    // Solo mantener skeleton por un momento breve si es necesario
    if (showCalendarSkeleton.value) {
      setTimeout(() => {
        showCalendarSkeleton.value = false;
      }, 150); // Más rápido
    }
    console.log(`🔄 Carga completada - isLoading: ${isLoading.value}`);
    console.log(`📊 Total eventos disponibles: ${todosLosEventos.value.length}`);
  }
};

// Eliminado: fechas especiales predefinidas de ejemplo

// 🔄 Lista de eventos provenientes solo de API
const todosLosEventos = computed(() => {
  const combinados = [...eventosDelMes.value];
  console.log(`📊 [COMPUTED] todosLosEventos recalculado: ${combinados.length} eventos totales`);
  console.log(`   - eventosDelMes: ${eventosDelMes.value.length}`);
  return combinados;
});

// �🗓️ Eventos programados
const eventosProgramados = computed(() => 
  todosLosEventos.value.filter(evento => evento.programado)
);

// 📊 Próximos eventos
const proximosEventos = computed(() => {
  const hoy = new Date();
  return todosLosEventos.value
    .filter(evento => new Date(evento.fecha) >= hoy)
    .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
    .slice(0, 5);
});

// 🎯 Funciones
const getCategoriaColor = (categoria: string) => {
  const colores = {
    feriado: "error",
    celebracion: "success",
    cumpleanos: "warning",
    aniversario: "primary",
    especial: "info"
  } as const;
  return colores[categoria as keyof typeof colores] || "neutral";
};

const getCategoriaIcon = (categoria: string) => {
  const iconos = {
    feriado: "i-lucide-calendar-x",
    celebracion: "i-lucide-party-popper",
    cumpleanos: "i-lucide-cake",
    aniversario: "i-lucide-heart",
    especial: "i-lucide-star"
  };
  return iconos[categoria as keyof typeof iconos] || "i-lucide-calendar";
};

const formatearFecha = (fecha: string) => {
  return new Date(fecha).toLocaleDateString('es-PE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const diasHastaEvento = (fecha: string) => {
  const hoy = new Date();
  const fechaEvento = new Date(fecha);
  const diferencia = fechaEvento.getTime() - hoy.getTime();
  const dias = Math.ceil(diferencia / (1000 * 3600 * 24));
  
  if (dias < 0) return "Pasado";
  if (dias === 0) return "Hoy";
  if (dias === 1) return "Mañana";
  return `En ${dias} días`;
};

const abrirModalParaFecha = (fecha: string) => {
  console.log('📅 Fecha seleccionada:', fecha);
  
  // Buscar eventos para esta fecha
  const eventosEnFecha = todosLosEventos.value.filter(evento => evento.fecha === fecha);
  
  if (eventosEnFecha.length > 0) {
    // Mostrar información del primer evento en un toast detallado
    const evento = eventosEnFecha[0];
    if (!evento) return; // Verificación adicional de seguridad
    
    const toast = useToast();
    
    let descripcion = `📅 ${evento.fecha}`;
    if (evento.descripcion) {
      descripcion += `\n📝 ${evento.descripcion}`;
    }
    
    // Verificar si tiene imágenes (puede estar en diferentes formatos)
    const tieneImagenes = (evento as any).imagenes || (evento as any).imagen;
    if (tieneImagenes) {
      if (Array.isArray((evento as any).imagenes)) {
        descripcion += `\n🖼️ ${(evento as any).imagenes.length} imagen${(evento as any).imagenes.length !== 1 ? 'es' : ''}`;
      } else {
        descripcion += `\n🖼️ 1 imagen`;
      }
    }
    
    // Verificar estado del evento
    const estado = (evento as any).estado || ((evento as any).programado ? 'programado' : 'activo');
    descripcion += `\n⚡ Estado: ${estado}`;
    
    toast.add({
      title: `📋 ${evento.nombre || 'Sin título'}`,
      description: descripcion,
      color: 'primary'
    });
    
    console.log('📋 Detalles del evento:', evento);
  }
  
  console.log(`📅 Día seleccionado: ${fecha} con ${eventosEnFecha.length} evento(s)`);
};

const handleAddEventFromCalendar = (fecha: string) => {
  selectedDateForUpload.value = fecha;
  showAddEventModal.value = true;
};


let loadingTimeout: ReturnType<typeof setTimeout> | null = null;

const handleMonthChanged = async (year: number, month: number) => {
  console.log(`📅 Mes cambiado a: ${year}-${month}`);
  
  if (isLoading.value) {
    console.log('⚠️ Ya hay una carga en progreso, ignorando...');
    return;
  }
  
  // Para cambios de mes, usar un loading más sutil (no skeleton)
  isLoadingEvents.value = true;
  
  // Debounce para evitar múltiples llamadas rápidas
  if (loadingTimeout) {
    clearTimeout(loadingTimeout);
  }
  
  loadingTimeout = setTimeout(async () => {
    await cargarEventosDelMes(year, month);
  }, 100); // Reducir delay para que sea más rápido
};

// 🔍 Funciones para el modal de detalles
const abrirImagenCompleta = (imagen: any) => {
  const url = imagen.url || imagen.archivo || imagen;
  if (typeof url === 'string') {
    window.open(url, '_blank');
  }
};

const descargarImagen = async (imagen: any) => {
  const url = imagen.url || imagen.archivo || imagen;
  if (typeof url === 'string') {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = imagen.descripcion ? `${imagen.descripcion}.jpg` : `evento-imagen.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
      const toast = useToast();
      toast.add({
        title: '📥 Imagen descargada',
        description: 'La imagen se descargó exitosamente',
        color: 'success'
      });
    } catch (error) {
      console.error('Error al descargar imagen:', error);
      const toast = useToast();
      toast.add({
        title: '❌ Error al descargar',
        description: 'No se pudo descargar la imagen',
        color: 'error'
      });
    }
  }
};

// Eliminado: edición local de eventos

const compartirEvento = async (evento: any) => {
  const textoCompartir = `🎉 ${evento.nombre}\n📅 ${new Date(evento.fecha).toLocaleDateString('es-ES')}\n${evento.descripcion || ''}`;
  
  if (navigator.share) {
    try {
      await navigator.share({
        title: evento.nombre,
        text: textoCompartir,
        url: window.location.href
      });
    } catch (error) {
      console.log('Error al compartir:', error);
    }
  } else {
    // Fallback: copiar al clipboard
    try {
      await navigator.clipboard.writeText(textoCompartir);
      const toast = useToast();
      toast.add({
        title: '📋 Copiado',
        description: 'El evento se copió al portapapeles',
        color: 'success'
      });
    } catch (error) {
      console.error('Error al copiar:', error);
    }
  }
};

const programarEvento = (evento: any) => {
  evento.programado = !evento.programado;
  const toast = useToast();
  toast.add({
    title: evento.programado ? "Evento programado" : "Programación cancelada",
    description: `${evento.nombre} ${evento.programado ? 'se publicará automáticamente' : 'ya no se publicará'}`,
    color: evento.programado ? "success" : "warning"
  });
};

// Eliminado: creación/actualización de eventos locales desde el modal

// Manejar evento creado exitosamente
const handleEventCreated = (eventData: any) => {
  console.log('Evento creado exitosamente:', eventData);
  
  // Aquí puedes agregar lógica para actualizar la lista de eventos
  // Por ejemplo, recargar los eventos del mes actual
  const hoy = new Date();
  cargarEventosDelMes(hoy.getFullYear(), hoy.getMonth() + 1);
  
  const toast = useToast();
  toast.add({
    title: "✅ Evento creado",
    description: `Se creó el evento "${eventData.titulo || eventData.nombre}" exitosamente`,
    color: "success"
  });
};

// 🧭 Meta de página
useHead({ title: "Eventos Especiales - Asisten" });
</script>

<template>
  <UDashboardPanel id="eventos">
    <!-- 🧭 Header -->
    <template #header>
      <UDashboardNavbar>
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <!-- Título -->
        <template #title>
          <div class="flex items-center gap-4">
            <div class="flex-1">
              <div class="flex items-center gap-3">
                <h1 class="text-xl font-bold text-gray-900 dark:text-white">Eventos Especiales</h1>
                <!-- Indicador de carga sutil -->
                <div v-if="isLoadingEvents || isLoadingCalendar" class="flex items-center gap-2">
                  <div class="h-2 w-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span class="text-xs text-blue-600 dark:text-blue-400">
                    {{ isLoadingCalendar ? 'Actualizando...' : 'Cargando...' }}
                  </span>
                </div>
              </div>
              <div class="space-y-1">
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  Programa y gestiona imágenes para fechas especiales
                </p>
                <!-- Barra de progreso sutil -->
                <div v-if="(isLoadingEvents || isLoadingCalendar) && loadingProgress > 0" class="w-48 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    class="h-full bg-blue-500 transition-all duration-300 ease-out loading-bar"
                    :style="`width: ${loadingProgress}%`"
                  ></div>
                </div>
              </div>
            </div>
            <UBadge 
              :label="`${eventosProgramados.length} programados`" 
              color="success" 
              variant="soft" 
              size="lg"
            />
          </div>
        </template>

        <template #right>
          <div class="flex items-center gap-3">
            <!-- Botón para agregar evento -->
            <UButton
              color="primary"
              icon="i-lucide-plus"
              @click="showAddEventModal = true"
            >
              Agregar Evento
            </UButton>
            <!-- Botón de limpiar locales eliminado -->
          </div>
        </template>
      </UDashboardNavbar>
    </template>
    <template #body>
      <div class="space-y-6">
        <!-- 📑 Pestañas de navegación -->
        <div class="border-b border-gray-200 dark:border-gray-700">
          <nav class="flex space-x-8">
            <button
              @click="selectedTab = 'calendar'"
              :class="[
                'py-2 px-1 border-b-2 font-medium text-sm',
                selectedTab === 'calendar' 
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'
              ]"
            >
              <UIcon name="i-lucide-calendar" class="w-4 h-4 mr-2 inline" />
              Vista Calendario
            </button>
            <button
              @click="selectedTab = 'upcoming'"
              :class="[
                'py-2 px-1 border-b-2 font-medium text-sm',
                selectedTab === 'upcoming' 
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'
              ]"
            >
              <UIcon name="i-lucide-clock" class="w-4 h-4 mr-2 inline" />
              Próximos Eventos
              <UBadge 
                v-if="proximosEventos.length > 0"
                :label="proximosEventos.length" 
                color="primary" 
                variant="soft" 
                size="xs" 
                class="ml-2"
              />
            </button>
            <button
              @click="selectedTab = 'scheduled'"
              :class="[
                'py-2 px-1 border-b-2 font-medium text-sm',
                selectedTab === 'scheduled' 
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'
              ]"
            >
              <UIcon name="i-lucide-calendar-check" class="w-4 h-4 mr-2 inline" />
              Programados
              <UBadge 
                v-if="eventosProgramados.length > 0"
                :label="eventosProgramados.length" 
                color="success" 
                variant="soft" 
                size="xs" 
                class="ml-2"
              />
            </button>


            <button
              @click="selectedTab = 'birthdays'"
              :class="[
                'py-2 px-1 border-b-2 font-medium text-sm',
                selectedTab === 'birthdays' 
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'
              ]"
            >
              <UIcon name="i-lucide-calendar-check" class="w-4 h-4 mr-2 inline" />
              Cumpleaños
              <UBadge 
                v-if="eventosProgramados.length > 0"
                :label="eventosProgramados.length" 
                color="success" 
                variant="soft" 
                size="xs" 
                class="ml-2"
              />
            </button>
          </nav>
        </div>

        <div v-if="selectedTab === 'upcoming'">
          <!-- 📅 Próximos Eventos -->
          <UCard>
            <template #header>
              <div class="flex items-center justify-between">
                <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Próximos Eventos</h2>
                <UBadge :label="`${proximosEventos.length} eventos`" color="primary" variant="soft" />
              </div>
            </template>

            <div class="space-y-4">
              <div 
                v-for="evento in proximosEventos" 
                :key="evento.id"
                class="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div class="flex items-center gap-4">
                  <!-- Icono y categoría -->
                  <div class="flex flex-col items-center">
                    <div class="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <UIcon :name="getCategoriaIcon(evento.categoria)" class="w-6 h-6 text-gray-600 dark:text-gray-400" />
                    </div>
                    <UBadge 
                      :label="evento.categoria" 
                      :color="getCategoriaColor(evento.categoria)" 
                      variant="soft" 
                      size="xs" 
                      class="mt-1"
                    />
                  </div>

                  <!-- Información del evento -->
                  <div>
                    <h3 class="font-semibold text-gray-900 dark:text-white">{{ evento.nombre }}</h3>
                    <p class="text-sm text-gray-500 dark:text-gray-400">{{ evento.descripcion }}</p>
                    <div class="flex items-center gap-4 mt-2 text-sm">
                      <div class="flex items-center gap-1 text-gray-600 dark:text-gray-300">
                        <UIcon name="i-lucide-calendar" class="w-4 h-4" />
                        {{ formatearFecha(evento.fecha) }}
                      </div>
                      <div class="flex items-center gap-1">
                        <UIcon name="i-lucide-clock" class="w-4 h-4 text-blue-500" />
                        <span class="text-blue-600 dark:text-blue-400 font-medium">{{ diasHastaEvento(evento.fecha) }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Acciones -->
                <div class="flex items-center gap-2">
                  <!-- Estado de programación -->
                  <div v-if="evento.programado" class="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <UIcon name="i-lucide-check-circle" class="w-4 h-4" />
                    <span class="text-xs font-medium">Programado</span>
                  </div>

                  <!-- Botones de acción -->
                  <UTooltip :text="evento.programado ? 'Cancelar programación' : 'Programar evento'">
                    <UButton
                      :icon="evento.programado ? 'i-lucide-calendar-x' : 'i-lucide-calendar-plus'"
                      size="sm"
                      variant="ghost"
                      :color="evento.programado ? 'warning' : 'success'"
                      @click="programarEvento(evento)"
                    />
                  </UTooltip>

                  <UDropdownMenu :items="[
                    [{ label: 'Editar evento', icon: 'i-lucide-edit' }],
                    [{ label: 'Duplicar evento', icon: 'i-lucide-copy' }],
                    [{ label: 'Eliminar evento', icon: 'i-lucide-trash-2', color: 'red' }]
                  ]">
                    <UButton
                      icon="i-lucide-more-horizontal"
                      size="sm"
                      variant="ghost"
                    />
                  </UDropdownMenu>
                </div>
              </div>

              <!-- Estado vacío -->
              <div v-if="proximosEventos.length === 0" class="text-center py-12">
                <UIcon name="i-lucide-calendar-x" class="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">No hay eventos próximos</h3>
                <p class="text-gray-500 dark:text-gray-400">Los eventos se cargan automáticamente desde el servidor</p>
              </div>
            </div>
          </UCard>
        </div>
        <!-- Eventos Programados -->
        <div v-else-if="selectedTab === 'scheduled'">
          <UCard>
            <template #header>
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Eventos Programados</h2>
            </template>

            <div class="space-y-4">
              <div 
                v-for="evento in eventosProgramados" 
                :key="evento.id"
                class="flex items-center justify-between p-4 border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20 rounded-lg"
              >
                <div class="flex items-center gap-4">
                  <div class="w-12 h-12 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center">
                    <UIcon :name="getCategoriaIcon(evento.categoria)" class="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 class="font-semibold text-gray-900 dark:text-white">{{ evento.nombre }}</h3>
                    <p class="text-sm text-gray-500 dark:text-gray-400">Se publicará automáticamente</p>
                    <div class="flex items-center gap-2 mt-1 text-sm text-green-600 dark:text-green-400">
                      <UIcon name="i-lucide-calendar-check" class="w-4 h-4" />
                      {{ formatearFecha(evento.fecha) }}
                    </div>
                  </div>
                </div>

                <div class="flex items-center gap-2">
                  <UBadge label="Programado" color="success" variant="soft" />
                  <UButton
                    icon="i-lucide-settings"
                    size="sm"
                    variant="ghost"
                  />
                </div>
              </div>

              <!-- Estado vacío -->
              <div v-if="eventosProgramados.length === 0" class="text-center py-12">
                <UIcon name="i-lucide-calendar-plus" class="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">No hay eventos programados</h3>
                <p class="text-gray-500 dark:text-gray-400">Programa eventos para que se publiquen automáticamente</p>
              </div>
            </div>
          </UCard>
        </div>

        <!-- Cumpleaños -->
        <BirthDaysList v-else-if="selectedTab === 'birthdays'"  />
        
        <!-- Vista Calendario -->
        <div v-else-if="selectedTab === 'calendar'" class="space-y-6">
          
          <!-- Barra de estado de carga (solo para actualizaciones importantes) -->
          <div v-if="isLoadingCalendar && loadingProgress > 0" class="space-y-4">
            <UCard>
              <div class="flex items-center gap-4">
                <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                  <UIcon name="i-lucide-calendar-clock" class="h-5 w-5 text-blue-600 dark:text-blue-400 animate-pulse" />
                </div>
                <div class="flex-1">
                  <div class="flex items-center justify-between mb-2">
                    <h3 class="text-sm font-semibold text-gray-900 dark:text-white">
                      Actualizando calendario...
                    </h3>
                    <span class="text-xs text-gray-500 dark:text-gray-400">
                      {{ loadingProgress }}%
                    </span>
                  </div>
                  <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      class="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                      :style="`width: ${loadingProgress}%`"
                    ></div>
                  </div>
                </div>
              </div>
            </UCard>
          </div>

          <!-- Skeleton del Calendario (solo para primera carga o cargas lentas) -->
          <div v-if="showCalendarSkeleton" class="animate-pulse">
            <UCard>
              <div class="space-y-6">
                <!-- Header del calendario skeleton -->
                <div class="flex items-center justify-between">
                  <div class="h-8 bg-gray-200 dark:bg-gray-700 rounded-md w-48"></div>
                  <div class="flex gap-2">
                    <div class="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div class="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                </div>
                
                <!-- Días de la semana skeleton -->
                <div class="grid grid-cols-7 gap-2">
                  <div v-for="i in 7" :key="i" class="h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
                
                <!-- Grid del calendario skeleton -->
                <div class="grid grid-cols-7 gap-2">
                  <div v-for="i in 42" :key="i" class="aspect-square">
                    <div class="h-full bg-gray-100 dark:bg-gray-800 rounded-lg p-2 space-y-1">
                      <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-6"></div>
                      <div v-if="Math.random() > 0.7" class="h-2 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
                      <div v-if="Math.random() > 0.8" class="h-2 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                    </div>
                  </div>
                </div>
              </div>
            </UCard>
            
            <!-- Shimmer effect overlay -->
            <div class="absolute inset-0 -skew-x-12 bg-linear-to-r from-transparent via-white/20 dark:via-white/5 to-transparent animate-shimmer"></div>
          </div>
          
          <!-- Calendario real (mostrar inmediatamente si ya hay datos) -->
          <div 
            v-show="!showCalendarSkeleton" 
            class="transition-all duration-300 ease-out"
            :class="{
              'opacity-75': isLoadingEvents && !showCalendarSkeleton, // Loading sutil si ya hay contenido
              'opacity-100': !isLoadingEvents
            }"
          >
          <!-- @date-selected="abrirModalParaFecha" -->
            <LazyEventsCalendar 
              :key="calendarKey"
              :eventos="todosLosEventos" 
              @month-changed="handleMonthChanged"
              @add-event-click="handleAddEventFromCalendar"
            />
          </div>
        </div>

        
      </div>
    </template>
  </UDashboardPanel>

  <!-- Modal para agregar evento con imágenes - Versión Simple -->
  <LazyEventsSimpleUploadModal
    :is-open="showAddEventModal"
    :pre-selected-date="selectedDateForUpload || undefined"
    @close="showAddEventModal = false; selectedDateForUpload = null"
    @event-created="recargarCalendario"
  />

</template>

<style scoped>
/* Transiciones suaves */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* Hover effects para cards de eventos */
.evento-card {
  transition: all 0.2s ease;
}

.evento-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

/* Animación de shimmer para loading */
@keyframes shimmer {
  0% {
    transform: translateX(-100%) skewX(-12deg);
  }
  100% {
    transform: translateX(200%) skewX(-12deg);
  }
}

.animate-shimmer {
  animation: shimmer 2s infinite;
}

/* Animación de pulso para elementos loading */
.animate-pulse-slow {
  animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Transición suave para el calendario */
.calendar-transition {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Loading bar animation */
@keyframes loading-bar {
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
}

.loading-bar {
  background-image: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.4),
    transparent
  );
  background-size: 200px 100%;
  animation: loading-bar 2s infinite;
}

.evento-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}
</style>