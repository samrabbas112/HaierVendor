// src/stores/notification.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useNotificationStore = defineStore('notification', () => {
  const cookieKey = 'notifications'
  const notificationCookie = useCookie(cookieKey)

  // Reactive notifications array
  const notifications = ref([])

  // Load initial notifications from cookies
  const getNotification = () => {
    const cookieValue = notificationCookie.value
    // if (cookieValue)
    //   notifications.value = JSON.parse(cookieValue)
  }

  // Save current notifications to cookies
  const saveNotification = (newNotification) => {
    notifications.value.push(newNotification); // Update the reactive notifications array
    notificationCookie.value = JSON.stringify(notifications.value); // Store updated notifications as a string
  };


  // Remove a specific notification
  const removeNotification = id => {
    notifications.value = notifications.value.filter(n => n.id !== id)
    saveNotification()
  }

  // Clear all notifications
  const clearNotifications = () => {
    notifications.value = []
    notificationCookie.value = null // Clear the cookie
  }

  // Load initial notifications when the store initializes
  getNotification()

  return {
    notifications,
    saveNotification,
    removeNotification,
    clearNotifications,
  }
})
