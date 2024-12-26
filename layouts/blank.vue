<script lang="ts" setup>
import Alert from "@/components/alert/alert.vue";
import Loader from "@/components/loader/Loader.vue";

const { injectSkinClasses } = useSkins();

injectSkinClasses();
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
    <Loader />
    <Alert />
    <slot />
  </div>
</template>

<style>
.layout-wrapper.layout-blank {
  flex-direction: column;
}
</style>
