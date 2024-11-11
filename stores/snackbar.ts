import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useSnackbarStore = defineStore('snackbar', () => {
  const isVisible = ref(false);
  const message = ref('');
  const color = ref('success'); // Default color can be success, error, info, etc.

  // Show snackbar with a custom message and optional color
  function showSnackbar(newMessage: string, newColor: string = 'success') {
    message.value = newMessage;
    color.value = newColor;
    isVisible.value = true;

    // Auto-hide after 3 seconds (or any time you prefer)
  setTimeout(() => {
    isVisible.value = false;
  }, 3000);  // 3000 ms = 3 seconds
  
  }

  // Hide snackbar
  function hideSnackbar() {
    isVisible.value = false;
  }

  return {
    isVisible,
    message,
    color,
    showSnackbar,
    hideSnackbar,
  };
});
