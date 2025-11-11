export default defineNuxtRouteMiddleware((to, from) => {
  const { isLoggedIn } = useAuth()
  
  // Si el usuario no está autenticado, redirigir al login
  if (!isLoggedIn.value) {
    return navigateTo('/login')
  }
})