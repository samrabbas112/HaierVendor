<script lang="ts" setup>
import { PerfectScrollbar } from "vue3-perfect-scrollbar";
import type { Notification } from "@layouts/types";
import { orderStatusCodes } from "@/libs/order/order-status";

const apiRequestObj = useApi();
const snackBar = useSnackbarStore();
const isConfirmDialogVisible = ref(false);
const dialogMsg = ref("Are you sure you want to clear all notifications?");
interface Props {
  notifications: Notification[];
  badgeProps?: object;
  location?: any;
}
interface Emit {
  (e: "read", value: number[]): void;
  (e: "unread", value: number[]): void;
  (e: "remove", value: number): void;
  (e: "click:notification", value: Notification): void;
}

const props = withDefaults(defineProps<Props>(), {
  location: "bottom end",
  badgeProps: undefined,
});

const emit = defineEmits<Emit>();

const isAllMarkRead = computed(() => {
  return props.notifications.some((item) => item.isSeen === false);
});

const markAllReadOrUnread = () => {
  isConfirmDialogVisible.value = true;
};

const totalUnseenNotifications = computed(() => {
  return props.notifications.filter((item) => item.isSeen === false).length;
});

const toggleReadUnread = (isSeen: boolean, Id: number) => {
  if (isSeen) emit("unread", [Id]);
  else emit("read", [Id]);
};
const markAsRead = () => {
  emit("read", [1]);
};
const handleConfirm = async (value) => {
  if (value) {
    emit("remove", 1);
  }
};
</script>

<template>
  <IconBtn id="notification-btn" class="notificationBadge">
    <VBadge
      v-bind="props.badgeProps"
      @click="markAsRead"
      :model-value="props.notifications.some((n) => !n.isSeen)"
      color="error"
      :content="totalUnseenNotifications"
      offset-x="2"
      offset-y="3"
      style="bottom: calc(100% - 10px); left: calc(100% - 14px)"
    >
      <VIcon icon="tabler-bell" />
    </VBadge>

    <VMenu
      activator="parent"
      width="380px"
      :location="props.location"
      offset="12px"
      :close-on-content-click="false"
    >
      <VCard class="d-flex flex-column">
        <!-- 👉 Header -->
        <VCardItem class="notification-section">
          <VCardTitle class="text-h6"> Notifications </VCardTitle>
          <template #append>
            <VCardTitle
              v-show="props.notifications.length"
              style="font-size: 14px; cursor: pointer"
              class="list-item-hover-class"
              @click="markAllReadOrUnread"
            >
              Clear Notifications
            </VCardTitle>
          </template>
        </VCardItem>

        <VDivider />

        <!-- 👉 Notifications list -->
        <PerfectScrollbar
          :options="{ wheelPropagation: false }"
          style="max-block-size: 23.75rem"
        >
          <VList class="notification-list rounded-0 py-0">
            <template
              v-for="(notification, index) in props.notifications"
              :key="notification.title"
            >
              <VDivider v-if="index > 0" />
              <VListItem
                link
                lines="one"
                min-height="66px"
                class="list-item-hover-class"
                @click="$emit('click:notification', notification)"
              >
                <!-- Slot: Prepend -->
                <!-- Handles Avatar: Image, Icon, Text -->
                <div class="d-flex align-start gap-3">
                  <!--                  <VAvatar-->
                  <!--                    :color="-->
                  <!--                      notification.color && !notification.img-->
                  <!--                        ? notification.color-->
                  <!--                        : undefined-->
                  <!--                    "-->
                  <!--                    :variant="notification.img ? undefined : 'tonal'"-->
                  <!--                  >-->
                  <!--                    <span v-if="notification.text">{{-->
                  <!--                      avatarText(notification.text)-->
                  <!--                    }}</span>-->
                  <!--                    <VImg v-if="notification.img" :src="notification.img" />-->
                  <!--                    <VIcon v-if="notification.icon" :icon="notification.icon" />-->
                  <!--                  </VAvatar>-->

                  <div>
                    <p class="text-sm font-weight-medium mb-1">
                      {{ notification.title }}
                    </p>
                    <p
                      class="text-body-2 mb-2"
                      style="
                        letter-spacing: 0.4px !important;
                        line-height: 18px;
                      "
                    >
                      {{ notification.subtitle }}
                    </p>
                    <p
                      class="text-sm text-disabled mb-0"
                      style="
                        letter-spacing: 0.4px !important;
                        line-height: 18px;
                      "
                    >
                      {{ notification.time }}
                    </p>
                  </div>
                  <VSpacer />

                  <div class="d-flex flex-column align-end">
                    <VIcon
                      size="10"
                      icon="tabler-circle-filled"
                      :color="!notification.isSeen ? 'primary' : '#a8aaae'"
                      :class="`${notification.isSeen ? 'visible-in-hover' : ''}`"
                      class="mb-2"
                      @click.stop="
                        toggleReadUnread(notification.isSeen, notification.id)
                      "
                    />

                    <!--                    <VIcon-->
                    <!--                      size="20"-->
                    <!--                      icon="tabler-x"-->
                    <!--                      class="visible-in-hover"-->
                    <!--                      @click="$emit('remove', notification.id)"-->
                    <!--                    />-->
                  </div>
                </div>
              </VListItem>
            </template>

            <VListItem
              v-show="!props.notifications.length"
              class="text-center text-medium-emphasis"
              style="block-size: 56px"
            >
              <VListItemTitle>No Notification Found!</VListItemTitle>
            </VListItem>
          </VList>
        </PerfectScrollbar>

        <VDivider />

        <!-- 👉 Footer -->
<!--        <VCardText v-show="props.notifications.length" class="pa-4">-->
<!--          <VBtn block size="small"> View All Notifications </VBtn>-->
<!--        </VCardText>-->
      </VCard>
    </VMenu>
  </IconBtn>

  <ConfirmDialog
    v-model:isDialogVisible="isConfirmDialogVisible"
    :confirmation-question="dialogMsg"
    cancel-msg="Request cancelled!!"
    cancel-title="Cancelled"
    confirm-msg="Your order status changed successfully."
    confirm-title="Confirmed"
    @confirm="handleConfirm"
  />
</template>

<style lang="scss">
.notification-section {
  padding-block: 0.75rem;
  padding-inline: 1rem;
}

.list-item-hover-class {
  .visible-in-hover {
    display: none;
  }

  &:hover {
    .visible-in-hover {
      display: block;
    }
  }
}

.notification-list.v-list {
  .v-list-item {
    border-radius: 0 !important;
    margin: 0 !important;
    padding-block: 0.75rem !important;
  }
}

// Badge Style Override for Notification Badge
.notification-badge {
  .v-badge__badge {
    /* stylelint-disable-next-line liberty/use-logical-spec */
    min-width: 18px;
    padding: 0;
    block-size: 18px;
  }
}
.notificationBadge {
  .v-badge {
    .v-badge__wrapper {
      .v-badge__badge {
        height: 1.2rem;
        width: auto;
        font-size: 12px;
        bottom: calc(100% - 10px) !important;
        left: calc(100% - 16px) !important;
      }
    }
  }
}
</style>
