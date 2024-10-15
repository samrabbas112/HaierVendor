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

    const savedUser = localStorage.getItem('user')
    const savedToken = localStorage.getItem('token')

    if (savedUser && savedToken) {
      user.value = JSON.parse(savedUser)
      token.value = savedToken
    }
  }

  /**
   * Log in the user and store the token and user data.
   *
   * @param {Object} loginData - Contains user info and token.
   */
  const login = (loginData: { user: any, token: string }) => {
    user.value = loginData.user
    token.value = loginData.token

    // Save to localStorage
    localStorage.setItem('user', JSON.stringify(loginData.user))
    localStorage.setItem('token', loginData.token)
  }

  /**
   * Log out the user, clear the token and user, and remove data from localStorage.
   */
  const logout = () => {
    user.value = null
    token.value = null
    // Remove from localStorage
    localStorage.removeItem('user')
    localStorage.removeItem('token')
  }

  /**
   * Check if the user is authenticated based on token existence.
   *
   * @returns {boolean} - True if authenticated, false otherwise.
   */
  const isAuthenticated = () => {
    return token.value !== null
  }


  return { user, token, login, logout, isAuthenticated }
})
