// src/stores/notification.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useNotificationStore = defineStore('notification', () => {
  const cookieKey = 'notifications'
  const notificationCookie = useCookie(cookieKey)
  const apiRequestObj = useApi();

  onMounted(async () => {
    const notificationObj = await apiRequestObj.makeRequest(
        'common/notifications',
        'get',
    )
    notifications.value = notificationObj.data.notification
  })

  // Reactive notifications array
  const notifications = ref([])

  // Load initial notifications from cookies
  const getNotification = async () => {
    const notificationObj = await apiRequestObj.makeRequest(
        'common/notifications',
        'get',
    )
    notifications.value = notificationObj.data.notification
  }

  // Save current notifications to cookies
  const saveNotification = (message) => {
    console.log('saveNotification', message);
    getNotification().then(r => {
        notificationCookie.value = JSON.stringify(notifications.value);
    });
  };


  // Remove a specific notification
  const removeNotification = () => {
    saveNotification('testing');
  }

  // Clear all notifications
  const clearNotifications = () => {
    notifications.value = []
    notificationCookie.value = null // Clear the cookie
  }


  return {
    notifications,
    saveNotification,
    removeNotification,
    clearNotifications,
  }
})
