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
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center p-4">
    <!-- Elementos decorativos de fondo -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute top-20 left-1/4 w-96 h-96 bg-primary-200/40 dark:bg-primary-800/20 rounded-full blur-3xl animate-pulse"></div>
      <div class="absolute bottom-20 right-1/4 w-96 h-96 bg-blue-200/40 dark:bg-blue-800/20 rounded-full blur-3xl animate-pulse" style="animation-delay: 1s;"></div>
      <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-100/20 dark:bg-purple-900/10 rounded-full blur-3xl"></div>
    </div>

    <UCard 
      class="w-full max-w-md shadow-xl border border-gray-200/80 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl transition-all duration-300 relative z-10"
      :class="isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'"
      :ui="{ body: { padding: 'px-8 py-8 sm:p-10' }, header: { padding: 'px-8 pt-8 pb-4 sm:px-10 sm:pt-10 sm:pb-6' }, footer: { padding: 'px-8 pb-8 sm:px-10 sm:pb-10' } }"
    >
      <template #header>
        <div class="text-center space-y-4">
          <!-- Logo/Icon con borde decorativo -->
          <div class="relative mx-auto w-16 h-16">
            <div class="absolute inset-0 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl rotate-6 opacity-20"></div>
            <div class="relative bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl flex items-center justify-center w-full h-full shadow-lg">
              <UIcon name="i-heroicons-clock" class="w-8 h-8 text-white" />
            </div>
          </div>
          
          <div class="space-y-2">
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
              Cechriza
            </h1>
            <p class="text-sm text-gray-600 dark:text-gray-400 font-medium">
              Control de Asistencia
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-500">
              Ingresa tus credenciales para continuar
            </p>
          </div>
        </div>
      </template>

      <form @submit.prevent="handleLogin" class="space-y-5">
        <div class="space-y-4">
          <div class="w-full">
            <UFormGroup label="Código de empleado" required class="w-full">
              <UInput
                v-model="form.emp_code"
                type="text"
                placeholder="Ej: EMP001"
                icon="i-heroicons-user"
                size="lg"
                :disabled="loading"
                class="w-full"
                :ui="{ icon: { trailing: { pointer: '' } } }"
              />
            </UFormGroup>
          </div>

          <div class="w-full">
            <UFormGroup label="Contraseña" required class="w-full">
              <UInput
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Ingresa tu contraseña"
                icon="i-heroicons-lock-closed"
                size="lg"
                :disabled="loading"
                class="w-full"
              >
                <template #trailing>
                  <UButton
                    :icon="showPassword ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'"
                    variant="ghost"
                    color="gray"
                    size="xs"
                    @click="showPassword = !showPassword"
                    type="button"
                  />
                </template>
              </UInput>
            </UFormGroup>
          </div>
        </div>

        <div class="pt-2 w-full">
          <UButton
            type="submit"
            size="lg"
            color="primary"
            block
            :loading="loading"
            :disabled="loading"
            class="shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <template #leading v-if="!loading">
              <UIcon name="i-heroicons-arrow-right-on-rectangle" />
            </template>
            Iniciar Sesión
          </UButton>
        </div>
      </form>

      <template #footer>
        <div class="space-y-5">
          <UDivider label="Credenciales de prueba" class="text-xs" />
          
          <div class="space-y-2">
            <div class="grid gap-2">
              <UButton
                v-for="(cred, index) in demoCredentials"
                :key="index"
                variant="outline"
                size="sm"
                color="gray"
                block
                class="justify-start text-left hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-primary-300 dark:hover:border-primary-700 transition-all group"
                @click="fillDemoCredentials(cred)"
              >
                <template #leading>
                  <div class="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 group-hover:from-primary-50 group-hover:to-primary-100 dark:group-hover:from-primary-900/30 dark:group-hover:to-primary-800/30 transition-all">
                    <UIcon name="i-heroicons-user-circle" class="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400" />
                  </div>
                </template>
                <div class="flex-1 min-w-0">
                  <div class="text-xs font-semibold text-gray-700 dark:text-gray-300">{{ cred.emp_code }}</div>
                  <div class="text-xs text-gray-500 dark:text-gray-500">{{ cred.password }}</div>
                </div>
                <UIcon name="i-heroicons-arrow-right" class="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-all" />
              </UButton>
            </div>
          </div>

          <div class="text-center pt-3 border-t border-gray-200 dark:border-gray-800">
            <p class="text-xs text-gray-600 dark:text-gray-400 flex items-center justify-center gap-1">
              <UIcon name="i-heroicons-question-mark-circle" class="w-4 h-4" />
              ¿Olvidaste tu contraseña? 
              <button class="text-primary-600 hover:text-primary-700 dark:hover:text-primary-400 font-semibold hover:underline transition-colors">
                Contactar admin
              </button>
            </p>
          </div>
        </div>
      </template>
    </UCard>

  
  </div>
</template>