<script setup lang="ts">
import loginBg from '~/assets/images/login-bg.jpg'
import logoNegro from '~/assets/images/logo-NEGRO.svg'

definePageMeta({
  layout: false,
  middleware: 'guest'
})

const { login } = useAuth()
const router = useRouter()
const toast = useToast()

const form = reactive({
  emp_code: '',
  password: '',
  remember: false
})

const loading = shallowRef(false)
const showPassword = shallowRef(false)

const handleLogin = async () => {
  if (!form.emp_code || !form.password) {
    toast.add({
      title: 'Error',
      description: 'Por favor completa todos los campos.',
      color: 'error'
    })
    return
  }

  loading.value = true

  try {
    await login(form.emp_code, form.password)

    toast.add({
      title: 'Bienvenido',
      description: 'Has iniciado sesion correctamente.',
      color: 'success'
    })

    await router.push('/')
  } catch {
    toast.add({
      title: 'Error de autenticacion',
      description: 'Credenciales incorrectas.',
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}

useHead({
  title: 'Iniciar sesion - Asisten',
  meta: [
    { name: 'description', content: 'Accede a tu dashboard de Asisten con tus credenciales.' }
  ]
})
</script>

<template>
  <div class="relative min-h-screen overflow-hidden bg-[#f6f7fb]">
    <div class="flex min-h-screen flex-col lg:flex-row">
      <section class="flex w-full items-center justify-center bg-white px-6 py-10 sm:px-10 lg:w-[52%] lg:px-16 lg:py-8 xl:px-24">
        <div class="w-full max-w-[480px] lg:-mt-12">
          <div class="mb-8 flex justify-center lg:hidden">
            <img :src="logoNegro" alt="Cechriza" class="w-full max-w-[320px]" />
          </div>

          <div class="mb-7 flex justify-center lg:justify-start">
            <img :src="logoNegro" alt="Logo Cechriza" class="w-full max-w-[250px] lg:max-w-[285px]" />
          </div>

          <div class="mb-8 border-l-4 border-[#f68122] pl-5">
            <p class="text-xs font-bold uppercase tracking-[0.24em] text-[#1f439b]">
              Portal de acceso
            </p>
            <h1 class="mt-2 text-[2.2rem] font-extrabold leading-none tracking-[-0.035em] text-[#173056] sm:text-[2.45rem]">
              Iniciar sesion
            </h1>
            <p class="mt-3 max-w-md text-[1.02rem] leading-7 text-[#6b7a97]">
              Ingresa tu usuario y contrasena para iniciar sesion.
            </p>
          </div>

          <form class="space-y-5" @submit.prevent="handleLogin">
            <div class="space-y-2">
              <label for="emp_code" class="block text-sm font-bold text-[#0e1220]">
                Correo electronico o usuario
              </label>
              <input
                id="emp_code"
                v-model="form.emp_code"
                type="text"
                autocomplete="username"
                placeholder="email@example.com"
                :disabled="loading"
                class="h-14 w-full rounded-xl border border-[#d7deea] bg-white px-4 text-base text-[#14233d] shadow-[0_10px_24px_rgba(22,41,74,0.04)] outline-none transition duration-200 placeholder:text-[#8f99ad] focus:border-[#1f439b] focus:ring-4 focus:ring-[#1f439b]/10 disabled:cursor-not-allowed disabled:bg-[#f4f6fb]"
              >
            </div>

            <div class="space-y-2">
              <div class="flex items-center justify-between gap-4">
                <label for="password" class="block text-sm font-bold text-[#0e1220]">
                  Contrasena
                </label>
                <button
                  type="button"
                  class="text-sm font-semibold text-[#1f439b] underline decoration-[#1f439b] underline-offset-2 transition hover:text-[#163777]"
                >
                  Olvido su contrasena?
                </button>
              </div>
              <div class="relative">
                <input
                  id="password"
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  autocomplete="current-password"
                  placeholder="Contrasena"
                  :disabled="loading"
                  class="h-14 w-full rounded-xl border border-[#d7deea] bg-white px-4 pr-14 text-base text-[#14233d] shadow-[0_10px_24px_rgba(22,41,74,0.04)] outline-none transition duration-200 placeholder:text-[#8f99ad] focus:border-[#1f439b] focus:ring-4 focus:ring-[#1f439b]/10 disabled:cursor-not-allowed disabled:bg-[#f4f6fb]"
                >
                <button
                  type="button"
                  class="absolute inset-y-0 right-0 flex w-14 items-center justify-center text-[#7d8699] transition hover:text-[#1f439b]"
                  @click="showPassword = !showPassword"
                >
                  <UIcon :name="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'" class="h-5 w-5" />
                </button>
              </div>
            </div>

            <label class="flex items-center gap-3 text-sm font-semibold text-[#111827]">
              <input
                v-model="form.remember"
                type="checkbox"
                class="h-4 w-4 rounded border-[#cfd8e7] text-[#1f439b] focus:ring-[#1f439b]/20"
              >
              Mantener sesion activa
            </label>

            <button
              type="submit"
              :disabled="loading"
              class="flex h-14 w-full items-center justify-center rounded-xl border border-[#1f439b] bg-[#1f439b] px-4 text-base font-bold text-white shadow-[0_16px_30px_rgba(31,67,155,0.24)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#173a87] hover:shadow-[0_20px_34px_rgba(31,67,155,0.3)] disabled:cursor-not-allowed disabled:opacity-70"
            >
              <span v-if="loading">Ingresando...</span>
              <span v-else>Iniciar sesion</span>
            </button>
          </form>

          <p class="mt-7 text-center text-sm text-[#3f4b63] lg:text-left">
            No tiene una cuenta? Comuniquese con un Administrador.
          </p>
        </div>
      </section>

      <section class="relative hidden items-center justify-center overflow-hidden bg-[#1d2064] px-12 py-12 lg:flex lg:w-[48%] xl:px-20">
        <img
          :src="loginBg"
          alt=""
          class="absolute inset-0 h-full w-full object-cover opacity-38"
        >
        <div class="absolute inset-0 bg-[#1d2064]/68" />

        <div class="relative z-10 flex w-full max-w-[620px] flex-col justify-center">
          <div class="max-w-[560px] lg:-mt-4">
            <h2 class="text-[3.2rem] font-extrabold uppercase leading-[0.95] tracking-[-0.045em] text-white">
              MAS DE <span class="text-[#ff7a1a]">25 AÑOS</span>
              <br>
              <span class="text-[#ff7a1a]">DE EXPERIENCIA</span>
            </h2>

            <div class="mt-5 h-1.5 w-24 rounded-full bg-[#ff7a1a]" />

            <p class="mt-6 max-w-[500px] text-[2.45rem] leading-[1.04] tracking-[-0.04em] text-white/92">
              Comercializando equipos y sistemas de procesamiento de dinero.
            </p>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
