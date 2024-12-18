import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(null) // Store the current user
  const token = ref(null) // Store the authentication token

  /**
   * Initialize the store by loading data from localStorage if available.
   */
  const initialize = () => {
    const authUser = useCookie('auth')

    if (authUser.value) {
      user.value = authUser.value.user
      token.value = authUser.value.token
    }
  }

  /**
   * Log in the user and store the token and user data.
   *
   * @param {object} loginData - Contains user info and token.
   */
  const login = (loginData: { user: any; token: string }) => {
    console.log('==============Login form =======================================')
    user.value = loginData.user
    token.value = loginData.token
    console.log(user, login)
    console.log('=====================================================')

    const authUser = useCookie('auth') // useCookie new hook in nuxt 3

    authUser.value = {
      user: loginData.user,
      token: loginData.token,
    }
  }

  /**
   * Log out the user, clear the token and user, and remove data from localStorage.
   */
  const logout = () => {
    user.value = null
    token.value = null

    const authUser = useCookie('auth')
    authUser.value = null
    const userAbilityRules = useCookie('userAbilityRules')
    userAbilityRules.value = null
  }

  /**
   * Check if the user is authenticated based on token existence.
   *
   * @returns {boolean} - True if authenticated, false otherwise.
   */
  const isAuthenticated = () => {
    return token.value !== null
  }

  initialize();

  // Return state and functions that should be accessible
  return { user, token, initialize, login, logout, isAuthenticated }
})
