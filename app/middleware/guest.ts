export default defineNuxtRouteMiddleware((to, from) => {
  const { isLoggedIn } = useAuth()
  
  // Si el usuario ya está autenticado, redirigir al dashboard
  if (isLoggedIn.value) {
    return navigateTo('/')
  }
})
