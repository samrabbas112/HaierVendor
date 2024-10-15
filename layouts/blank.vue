<script lang="ts" setup>
const { injectSkinClasses } = useSkins()

injectSkinClasses()
const { $firebaseMessaging } = useNuxtApp();
const requestPermission = () => {
  $firebaseMessaging.requestNotificationPermission();
};


onMounted(() => {
  requestPermission();
});
</script>

<template>
  <div class="layout-wrapper layout-blank">
    <slot />
  </div>
</template>

<style>
.layout-wrapper.layout-blank {
  flex-direction: column;
}
</style>
