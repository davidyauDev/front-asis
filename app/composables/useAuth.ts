import { createSharedComposable } from '@vueuse/core'
import type { AuthUser, LoginResponse } from '~/types'
import { storage } from '~/utils/storage'

const _useAuth = () => {
  const user = ref<AuthUser | null>(null)
  const isLoggedIn = computed(() => !!user.value)
  const loading = ref(false)
  const config = useRuntimeConfig()
  const apiBaseUrl = config.public.apiBaseUrl

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
        role: 'user', // Puedes ajustarlo si tu API devuelve roles
        avatar: {
          alt: u.name
        }
      }

      user.value = authUser

      if (import.meta.client) {
        storage.set('auth_user', authUser)
        storage.set('auth_token', response.data.access_token)
      }

    } catch (error: unknown) {
      console.error('Error de login:', error)
      throw new Error('Credenciales incorrectas')
    } finally {
      loading.value = false
    }
  }

  const logout = async (): Promise<void> => {
    loading.value = true

    try {
      const token = import.meta.client ? storage.get<string>('auth_token') : null

      if (token && !token.startsWith('demo_token_')) {
        try {
          await $fetch(`${apiBaseUrl}/api/logout`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
            }
          })
        } catch (error) {
          console.warn('Error al hacer logout en la API:', error)
        }
      }

      user.value = null

      if (import.meta.client) {
        storage.remove('auth_user')
        storage.remove('auth_token')
      }
    } finally {
      loading.value = false
    }
  }

  const checkAuth = (): void => {
    if (!import.meta.client) return

    const savedUser = storage.get<AuthUser>('auth_user')
    const savedToken = storage.get<string>('auth_token')

    if (savedUser && savedToken) {
      user.value = savedUser
    } else {
      storage.remove('auth_user')
      storage.remove('auth_token')
      user.value = null
    }
  }

  const updateProfile = async (userData: Partial<AuthUser>): Promise<void> => {
    if (!user.value) return

    loading.value = true

    try {
      await new Promise(resolve => setTimeout(resolve, 800)) 
      user.value = { ...user.value, ...userData }

      if (import.meta.client) {
        storage.set('auth_user', user.value)
      }
    } finally {
      loading.value = false
    }
  }

  // Inicializa estado auth al crear el composable
  if (import.meta.client) {
    checkAuth()
  }

  return {
    user: readonly(user),
    isLoggedIn,
    loading: readonly(loading),
    login,
    logout,
    checkAuth,
    updateProfile,
  }
}

export const useAuth = createSharedComposable(_useAuth)
