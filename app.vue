<script setup lang="ts">
import { useTheme } from "vuetify";
import ScrollToTop from "@core/components/ScrollToTop.vue";
import initCore from "@core/initCore";
import { initConfigStore, useConfigStore } from "@core/stores/config";
import { hexToRgb } from "@core/utils/colorConverter";

// defineNuxtRouteMiddleware('auth')

const { global } = useTheme();

// ℹ️ Sync current theme with initial loader theme
initCore();
initConfigStore();

const configStore = useConfigStore();
const { isMobile } = useDevice();
if (isMobile) configStore.appContentLayoutNav = "vertical";

const { $firebaseMessaging } = useNuxtApp();

const requestPermission = () => {
  $firebaseMessaging.requestNotificationPermission();
};

onMounted(() => {
  console.log("function called");
  requestPermission();
});
</script>

<template>
  <VLocaleProvider :rtl="configStore.isAppRTL">
    <!-- ℹ️ This is required to set the background color of active nav link based on currently active global theme's primary -->
    <VApp
      :style="`--v-global-theme-primary: ${hexToRgb(global.current.value.colors.primary)}`"
    >
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>

      <ScrollToTop />
    </VApp>
  </VLocaleProvider>
</template>
<style lang="scss">
.v-theme--light {
  .app-text-field {
    label {
      color: rgba(
        var(--v-theme-on-surface),
        var(--v-high-emphasis-opacity)
      ) !important;
    }
  }
  .app-select {
    label {
      color: rgba(
        var(--v-theme-on-surface),
        var(--v-high-emphasis-opacity)
      ) !important;
    }
  }
}

.v-theme--dark {
  .app-text-field {
    label {
      color: rgba(
        var(--v-theme-on-surface),
        var(--v-high-emphasis-opacity)
      ) !important;
    }
  }
  .app-select {
    label {
      color: rgba(
        var(--v-theme-on-surface),
        var(--v-high-emphasis-opacity)
      ) !important;
    }
  }
}
</style>
