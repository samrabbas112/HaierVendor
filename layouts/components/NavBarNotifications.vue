<script lang="ts" setup>
import type { Notification } from '@layouts/types'
import { useNotificationStore } from '@/stores/notification'

const notificationStore = useNotificationStore()

const notifications = ref<Notification[]>([])

const handleServiceWorkerMessage = (e: MessageEvent) => {
  // if (e.data && e.data.type === 'NEW_NOTIFICATION') {
  //   const payload = e.data.payload
  //
  //   console.log('Received notification from service worker: ', payload)
  //
  //   const newNotification: Notification = {
  //     id: Date.now(), // Generate unique ID
  //     title: payload.notification.title || 'No Title',
  //     subtitle: payload.notification.body || 'No Body',
  //     time: new Date().toLocaleTimeString(),
  //     isSeen: false,
  //     img: '/firebase-logo.png', // Use the notification icon if available
  //   }
  //
  //   notifications.value.push(newNotification)
  // }
}

// Listen for messages from the service worker
onMounted(() => {
  notifications.value = notificationStore.notifications
})


const removeNotification = (notificationId: number) => {
  notifications.value.forEach((item, index) => {
    if (notificationId === item.id)
      notifications.value.splice(index, 1)
  })
}

const markRead = (notificationId: number[]) => {
  notifications.value.forEach(item => {
    notificationId.forEach(id => {
      if (id === item.id)
        item.isSeen = true
    })
  })
}

const markUnRead = (notificationId: number[]) => {
  notifications.value.forEach(item => {
    notificationId.forEach(id => {
      if (id === item.id)
        item.isSeen = false
    })
  })
}

const handleNotificationClick = (notification: Notification) => {
  if (!notification.isSeen)
    markRead([notification.id])
}
</script>

<template>
  <Notifications
    :notifications="notifications"
    @remove="removeNotification"
    @read="markRead"
    @unread="markUnRead"
    @click:notification="handleNotificationClick"
  />
</template>
