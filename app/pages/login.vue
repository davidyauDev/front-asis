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
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
    <!-- Elementos decorativos de fondo minimalistas -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute top-0 left-1/4 w-96 h-96 bg-primary-100/30 dark:bg-primary-900/10 rounded-full blur-3xl"></div>
      <div class="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-100/30 dark:bg-blue-900/10 rounded-full blur-3xl"></div>
    </div>

    <UCard 
      class="w-full max-w-md shadow-sm border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 transition-all duration-300"
      :class="isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'"
      :ui="{ body: { padding: 'px-6 py-6 sm:p-8' } }"
    >
      <template #header>
        <div class="text-center space-y-3 pb-2">
          <!-- Logo/Icon minimalista -->
          <div class="mx-auto w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center">
            <UIcon name="i-heroicons-clock" class="w-6 h-6 text-white" />
          </div>
          
          <div class="space-y-1">
            <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">
              Cechriza
            </h1>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Control de Asistencia
            </p>
          </div>
        </div>
      </template>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div class="space-y-4">
          <div class="w-full">
            <UFormGroup label="Código de empleado" required class="w-full">
              <UInput
                v-model="form.emp_code"
                type="text"
                placeholder="Ingresa tu código"
                icon="i-heroicons-user"
                size="lg"
                :disabled="loading"
                class="w-full"
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
          >
            Iniciar Sesión
          </UButton>
        </div>
      </form>

      <template #footer>
        <div class="space-y-4">
          <UDivider label="Demo" class="text-xs" />
          
          <div class="space-y-2">
            <div class="grid gap-2">
              <UButton
                v-for="(cred, index) in demoCredentials"
                :key="index"
                variant="outline"
                size="sm"
                color="gray"
                block
                class="justify-start text-left"
                @click="fillDemoCredentials(cred)"
              >
                <template #leading>
                  <div class="flex items-center justify-center w-6 h-6 rounded bg-gray-100 dark:bg-gray-800">
                    <UIcon name="i-heroicons-user" class="w-3 h-3" />
                  </div>
                </template>
                <div class="flex-1 min-w-0">
                  <div class="text-xs font-medium">{{ cred.emp_code }}</div>
                  <div class="text-xs text-gray-500">{{ cred.password }}</div>
                </div>
              </UButton>
            </div>
          </div>

          <div class="text-center pt-2 border-t border-gray-100 dark:border-gray-800">
            <p class="text-xs text-gray-500">
              ¿Olvidaste tu contraseña? 
              <button class="text-primary-600 hover:text-primary-700 font-medium">
                Contactar administrador
              </button>
            </p>
          </div>
        </div>
      </template>
    </UCard>

  
  </div>
</template>