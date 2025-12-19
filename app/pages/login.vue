<script setup lang="ts">
definePageMeta({
  layout: false,
  middleware: 'guest'
})

const { login } = useAuth()
const router = useRouter()
const toast = useToast()

const form = ref({
  emp_code: '',
  password: ''
})

const loading = ref(false)
const showPassword = ref(false)

const handleLogin = async () => {
  if (!form.value.emp_code || !form.value.password) {
    toast.add({
      title: 'Error',
      description: 'Por favor completa todos los campos',
      color: 'error'
    })
    return
  }

  loading.value = true
  
  try {
    await login(form.value.emp_code, form.value.password)
    
    toast.add({
      title: 'Bienvenido',
      description: 'Has iniciado sesión correctamente',
      color: 'success'
    })
    
    await router.push('/')
  } catch (error) {
    toast.add({
      title: 'Error de autenticación',
      description: 'Credenciales incorrectas',
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}

const fillDemoCredentials = (credentials: { emp_code: string, password: string }) => {
  form.value.emp_code = credentials.emp_code
  form.value.password = credentials.password
}

useHead({
  title: 'Iniciar Sesión - Asisten',
  meta: [
    { name: 'description', content: 'Accede a tu dashboard de Asisten con tus credenciales' }
  ]
})

// Agregar efecto de fade-in
const isVisible = ref(false)
onMounted(() => {
  setTimeout(() => {
    isVisible.value = true
  }, 100)
})
</script>

<template>
  <div class="min-h-screen bg-linear-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
    <!-- Elementos decorativos de fondo -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute -top-40 -right-40 w-80 h-80 bg-primary-200/20 dark:bg-primary-800/10 rounded-full blur-3xl"></div>
      <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-200/20 dark:bg-secondary-800/10 rounded-full blur-3xl"></div>
    </div>

    <UCard 
      class="w-full max-w-md shadow-xl backdrop-blur-sm bg-white/95 dark:bg-gray-900/95 transition-all duration-500 transform"
      :class="isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'"
    >
      <template #header>
        <div class="text-center space-y-4">
          <!-- Logo/Icon con animación -->
          <div class="mx-auto w-16 h-16 bg-linear-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center mb-4 shadow-lg transform transition-transform hover:scale-110">
            <UIcon name="i-lucide-shield-check" class="w-8 h-8 text-white" />
          </div>
          
          <div class="space-y-2">
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
              Cechriza
            </h1>
            <p class="text-gray-600 dark:text-gray-400 text-sm">
              Sistema de Gestión y Control de Asistencia
            </p>
            <p class="text-gray-500 dark:text-gray-500 text-xs">
              Inicia sesión para acceder a tu dashboard
            </p>
          </div>
        </div>
      </template>

      <form @submit.prevent="handleLogin" class="space-y-6">
        <div class="space-y-5">
          <div class="w-full">
            <UFormGroup label="Código de empleado" required class="w-full">
              <UInput
                v-model="form.emp_code"
                type="text"
                placeholder="Ingresa tu código de empleado"
                icon="i-lucide-id-card"
                size="lg"
                :disabled="loading"
                class="w-full transition-all duration-200 focus-within:ring-2 focus-within:ring-primary-500/20"
              />
            </UFormGroup>
          </div>

          <div class="w-full">
            <UFormGroup label="Contraseña" required class="w-full">
              <UInput
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Ingresa tu contraseña"
                icon="i-lucide-lock"
                size="lg"
                :disabled="loading"
                class="w-full transition-all duration-200 focus-within:ring-2 focus-within:ring-primary-500/20"
              >
                <template #trailing>
                  <UButton
                    :icon="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                    variant="ghost"
                    color="neutral"
                    size="xs"
                    @click="showPassword = !showPassword"
                    type="button"
                    class="hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors rounded-md"
                  />
                </template>
              </UInput>
            </UFormGroup>
          </div>
        </div>

        <div class="pt-3 w-full">
          <UButton
            type="submit"
            size="lg"
            class="w-full bg-linear-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
            :loading="loading"
            :disabled="loading"
          >
            <template #leading>
              <UIcon name="i-lucide-log-in" />
            </template>
            Iniciar Sesión
          </UButton>
        </div>
      </form>

      <template #footer>
        <div class="space-y-6">
          <UDivider label="Credenciales de demostración" class="text-xs" />
          
          <div class="space-y-3">
            <p class="text-xs text-gray-500 dark:text-gray-400 text-center font-medium">
               Credenciales para prueba rápida:
            </p>
            
            <div class="grid gap-2">
              <UButton
                v-for="(cred, index) in demoCredentials"
                :key="index"
                variant="outline"
                size="sm"
                class="justify-start text-left hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:border-primary-200 dark:hover:border-primary-800 transition-all duration-200 group"
                @click="fillDemoCredentials(cred)"
              >
                <template #leading>
                  <div class="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 group-hover:bg-primary-100 dark:group-hover:bg-primary-800/50 transition-colors">
                    <UIcon name="i-lucide-user" class="w-3 h-3 shrink-0" />
                  </div>
                </template>
                <div class="flex-1 min-w-0">
                  <div class="text-xs font-medium truncate">{{ cred.emp_code }}</div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">{{ cred.password }}</div>
                </div>
                <UIcon name="i-lucide-arrow-right" class="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </UButton>
            </div>
          </div>

          <div class="text-center border-t border-gray-200 dark:border-gray-700 pt-4">
            <p class="text-xs text-gray-500 dark:text-gray-400">
              ¿Olvidaste tu contraseña? 
              <UButton variant="link" size="xs" class="p-0 h-auto text-xs hover:text-primary-600 transition-colors font-medium">
                Recuperar acceso
              </UButton>
            </p>
          </div>
        </div>
      </template>
    </UCard>

    <!-- Footer mejorado -->
    <div class="fixed bottom-6 left-0 right-0 text-center z-10">
      <div class="inline-flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm">
        <UIcon name="i-lucide-copyright" class="w-3 h-3" />
        <span>2025 Asisten Dashboard</span>
        <span class="w-1 h-1 bg-gray-400 rounded-full"></span>
        <span>Todos los derechos reservados</span>
      </div>
    </div>
  </div>
</template>