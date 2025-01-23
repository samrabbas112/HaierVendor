<script lang="ts" setup>
import type { Notification } from "@layouts/types";
import { useNotificationStore } from "@/stores/notification";
const apiRequestObj = useApi();
const snackBar = useSnackbarStore();
const notificationStore = useNotificationStore();
const notificationsObj = computed(() => notificationStore.notifications);
const router = useRouter();
const verifyLoading = ref(false);

const removeNotification = (notificationId: number) => {
  apiRequestObj
    .makeRequest("common/notifications/delete-all", "delete")
    .then((response) => {
      if (response.success === true) {
        snackBar.showSnackbar("Successfully cleared all notifications");
        notificationStore.saveNotification([]);
      } else {
        snackBar.showSnackbar("Failed to mark all as read", "error");
      }
    });
};

const markRead = (notificationId: number[]) => {
  apiRequestObj
    .makeRequest(`common/notifications/mark-read`, "get")
    .then((response) => {
      if (response.success === true) {
        notificationStore.saveNotification([]);
      }
    });
};

const markUnRead = (notificationId: number[]) => {};

const handleNotificationClick = (notification: Notification) => {
  verifyLoading.value = true
  apiRequestObj
    .makeRequest(`common/dashboard/verify/order/${notification.link}`, "get")
    .then((response) => {
      if (response.code == 404 || response.code == 403 ) {
        snackBar.showSnackbar("This order is not available to view", "error");
      } else {
        console.log("response", response);
        router.push(`/order/notification/${response.data.uid}`);
      }
      verifyLoading.value = false
    });
};
</script>

<template>
  <Notifications
    :notifications="notificationsObj"
    @remove="removeNotification"
    @read="markRead"
    @unread="markUnRead"
    @click:notification="handleNotificationClick"
    :isLoading="verifyLoading"
  />
</template>
