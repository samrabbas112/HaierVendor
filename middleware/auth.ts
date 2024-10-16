import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware(async (to, from) => {
  const authStore = useAuthStore()

  console.log(to)
    console.log(from)
  // Ensure this code runs only in the client
  if (process.client) {
    await authStore.initialize() // Initializes the auth state from localStorage or API
  }

  const isLoggedIn = authStore.isAuthenticated()

  console.log('Current route:', to.path)
  console.log('Logged in:', isLoggedIn)
  // Prevent an infinite loop: only redirect if user is not logged in
  if (!isLoggedIn && to.path !== '/login') {
    return navigateTo('/login')  // Redirect to login if user is not logged in and not already on login page
  }

  // Prevent logged-in users from accessing the login page
  if (isLoggedIn && to.path === '/login') {
    return navigateTo('/dashboard')  // Redirect to dashboard if logged in and trying to access login page
  }

  // If already on the correct page (e.g., logged in and on dashboard), no redirect is needed
})
