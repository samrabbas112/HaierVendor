<script lang="ts" setup>
const toastStore = useToastStore();
</script>

<template>
  <div class="alert">
    <VAlert
      v-if="toastStore.show"
      variant="tonal"
      closable
      transition="scroll-y-transition"
      :color="toastStore.type"
    >
      {{ toastStore.message }}
    </VAlert>
  </div>
</template>

<style scoped>
.alert {
  width: 18%;
  position: sticky;
  top: 4%;
  left: 39%;
  z-index: 99;
}
</style>
