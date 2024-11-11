<script setup>
import { useSnackbarStore } from '@/stores/snackbar'

const snackbarStore = useSnackbarStore();
</script>

<template>
  <!-- SnackBar -->
  <VSnackbar v-model="snackbarStore.isVisible" :color="snackbarStore.color" location="top end" min-height="70px">
    {{ snackbarStore.message }}
    <template #actions>
      <VBtn
        color=""
        @click="snackbarStore.hideSnackbar"
      >
        Close
      </VBtn>
    </template>
  </VSnackbar>
</template>
