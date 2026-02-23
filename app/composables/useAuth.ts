import { createSharedComposable } from '@vueuse/core'
import type { AuthUser, LoginResponse } from '~/types'

const _useAuth = () => {
  const user = ref<AuthUser | null>(null)
  const isLoggedIn = computed(() => !!user.value)
  const loading = ref(false)

  const config = useRuntimeConfig()
  const apiBaseUrl = config.public.apiBaseUrl

  const authUserCookie = useCookie<AuthUser | null>('auth_user', {
    sameSite: 'lax'
  })

  const authTokenCookie = useCookie<string | null>('auth_token', {
    sameSite: 'lax'
  })


  const login = async (emp_code: string, password: string): Promise<void> => {
    loading.value = true

    try {
      const response = await $fetch<LoginResponse>(`${apiBaseUrl}/api/login`, {
        method: 'POST',
        body: { emp_code, password },
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      })

      if (!response.success || !response.data.access_token) {
        throw new Error('Credenciales incorrectas')
      }

      const { user: u } = response.data

      const authUser: AuthUser = {
        id: u.id,
        name: u.name,
        email: u.email,
        emp_code: u.emp_code,
        role: 'user',
        avatar: {
          alt: u.name
        }
      }

      user.value = authUser
      authUserCookie.value = authUser
      authTokenCookie.value = response.data.access_token

    } catch (error) {
      console.error('Error de login:', error)
      throw new Error('Credenciales incorrectas')
    } finally {
      loading.value = false
    }
  }


  const logout = async (): Promise<void> => {
    loading.value = true

    try {
      if (authTokenCookie.value) {
        try {
          await $fetch(`${apiBaseUrl}/api/logout`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${authTokenCookie.value}`,
              Accept: 'application/json'
            }
          })
        } catch (error) {
          console.warn('Error al hacer logout en la API:', error)
        }
      }

      user.value = null
      authUserCookie.value = null
      authTokenCookie.value = null

      // Limpiar filtros persistidos de incidencias al cerrar sesión
      const incidenciasFechaInicio = useCookie<string | null>('incidencias-fecha-inicio', { sameSite: 'lax' })
      const incidenciasFechaFin = useCookie<string | null>('incidencias-fecha-fin', { sameSite: 'lax' })
      const incidenciasFiltroUsuario = useCookie<string | null>('incidencias-filtro-usuario', { sameSite: 'lax' })
      const incidenciasFiltroEmpresa = useCookie<string | null>('incidencias-filtro-empresa', { sameSite: 'lax' })
      const incidenciasFiltroDepartamento = useCookie<string | null>('incidencias-filtro-departamento', { sameSite: 'lax' })
      const incidenciasTabActivo = useCookie<string | null>('incidencias-tab-activo', { sameSite: 'lax' })

      incidenciasFechaInicio.value = null
      incidenciasFechaFin.value = null
      incidenciasFiltroUsuario.value = null
      incidenciasFiltroEmpresa.value = null
      incidenciasFiltroDepartamento.value = null
      incidenciasTabActivo.value = null

    } finally {
      loading.value = false
    }
  }

  const checkAuth = (): void => {
    if (authUserCookie.value && authTokenCookie.value) {
      user.value = authUserCookie.value
    } else {
      user.value = null
      authUserCookie.value = null
      authTokenCookie.value = null
    }
  }


  const updateProfile = async (userData: Partial<AuthUser>): Promise<void> => {
    if (!user.value) return

    loading.value = true

    try {
      await new Promise(resolve => setTimeout(resolve, 800))

      user.value = { ...user.value, ...userData }
      authUserCookie.value = user.value

    } finally {
      loading.value = false
    }
  }

  checkAuth()

  return {
    user: readonly(user),
    isLoggedIn,
    loading: readonly(loading),
    login,
    logout,
    checkAuth,
    updateProfile
  }
}

export const useAuth = createSharedComposable(_useAuth)
