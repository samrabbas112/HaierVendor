export default defineNuxtRouteMiddleware((to, from) => {
  console.log('middleware/auth')
  console.log('to', to)
  console.log('from', from)

  // Check for an auth token
  const token = localStorage.getItem('token')

  console.log('=======token=========', token)

  // If there's no token, navigate to the login page
  if (!token) {
    console.log('No token found, redirecting to login...')

    return navigateTo('/login')
  }
})
