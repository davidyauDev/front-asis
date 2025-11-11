import { createSharedComposable } from '@vueuse/core'
import type { AuthUser, LoginCredentials, LoginResponse } from '~/types'

const _useAuth = () => {
  const user = ref<AuthUser | null>(null)
  const isLoggedIn = computed(() => !!user.value)
  const loading = ref(false)
  
  // Configuración de la API
  const config = useRuntimeConfig()
  const apiBaseUrl = config.public.apiBaseUrl || 'http://127.0.0.1:8000'

  // Credenciales de demostración (solo para desarrollo)
  const demoCredentials = [
    { emp_code: '70994384', password: '12345678' },
    { emp_code: 'admin001', password: 'admin123' }
  ]

  const login = async (emp_code: string, password: string): Promise<void> => {
    loading.value = true
    
    try {
      // Hacer petición a la API real
      const response = await $fetch<LoginResponse>(`${apiBaseUrl}/api/login`, {
        method: 'POST',
        body: {
          emp_code,
          password
        },
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      })
      
      // Crear el usuario con la respuesta de la API
      const authUser: AuthUser = {
        id: response.user.id,
        name: response.user.name,
        email: response.user.email,
        emp_code: response.user.emp_code,
        role: 'user', // Por defecto, puedes ajustar según tu lógica
        avatar: {
          // Sin imagen, solo iniciales
          alt: response.user.name
        }
      }
      
      user.value = authUser
      
      // Guardar en localStorage para persistencia
      if (import.meta.client) {
        localStorage.setItem('auth_user', JSON.stringify(authUser))
        localStorage.setItem('auth_token', response.access_token)
      }
    } catch (error: any) {
      console.error('Error de login:', error)
      
      // Si es desarrollo y falla la API, usar credenciales demo
      if (import.meta.dev) {
        const isDemoCredential = demoCredentials.some(
          cred => cred.emp_code === emp_code && cred.password === password
        )
        
        if (isDemoCredential) {
          // Simular usuario demo
          const demoUser: AuthUser = {
            id: 999,
            name: emp_code === '70994384' ? 'David Yauri Lapa' : 'Usuario Demo',
            email: `${emp_code}@cechriza.com`,
            emp_code: emp_code,
            role: 'user',
            avatar: {
              // Sin imagen, solo iniciales
              alt: emp_code === '70994384' ? 'David Yauri Lapa' : 'Usuario Demo'
            }
          }
          
          user.value = demoUser
          
          if (import.meta.client) {
            localStorage.setItem('auth_user', JSON.stringify(demoUser))
            localStorage.setItem('auth_token', `demo_token_${Date.now()}`)
          }
          return
        }
      }
      
      throw new Error('Credenciales incorrectas')
    } finally {
      loading.value = false
    }
  }

  const logout = async (): Promise<void> => {
    loading.value = true
    
    try {
      const token = import.meta.client ? localStorage.getItem('auth_token') : null
      
      // Solo intentar logout en la API si tenemos un token real (no demo)
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
      
      // Limpiar localStorage
      if (import.meta.client) {
        localStorage.removeItem('auth_user')
        localStorage.removeItem('auth_token')
      }
    } finally {
      loading.value = false
    }
  }

  const checkAuth = (): void => {
    if (import.meta.client) {
      const savedUser = localStorage.getItem('auth_user')
      const savedToken = localStorage.getItem('auth_token')
      
      if (savedUser && savedToken) {
        try {
          user.value = JSON.parse(savedUser)
        } catch (error) {
          // Si hay error parseando, limpiar localStorage
          localStorage.removeItem('auth_user')
          localStorage.removeItem('auth_token')
        }
      }
    }
  }

  const updateProfile = async (userData: Partial<AuthUser>): Promise<void> => {
    if (!user.value) return
    
    loading.value = true
    
    try {
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 800))
      
      user.value = { ...user.value, ...userData }
      
      // Actualizar en localStorage
      if (import.meta.client) {
        localStorage.setItem('auth_user', JSON.stringify(user.value))
      }
    } finally {
      loading.value = false
    }
  }

  // Inicializar auth al crear el composable
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
    demoCredentials // Exportar para usar en la UI
  }
}

export const useAuth = createSharedComposable(_useAuth)