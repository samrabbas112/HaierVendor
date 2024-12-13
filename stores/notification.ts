// src/stores/notification.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useNotificationStore = defineStore('notification', () => {
  // Reactive state for notifications
  const notifications = ref([])

  // Initialize state from local storage
  const loadFromLocalStorage = () => {
    const storedData = localStorage.getItem('notifications')
    if (storedData)
      notifications.value = JSON.parse(storedData)
  }

  // Save current state to local storage
  const saveToLocalStorage = () => {
    localStorage.setItem('notifications', JSON.stringify(notifications.value))
  }

  // Load initial data from local storage on store initialization
  loadFromLocalStorage()

  return {
    notifications,
    saveToLocalStorage,
  }
})
