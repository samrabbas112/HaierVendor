import { defineStore } from "pinia";
import { ref } from "vue";

export const useTermsStore = defineStore("terms", () => {
  const isVisible = ref(false);

  // Show snackbar with a custom message and optional color
  function showTerms() {
    isVisible.value = true;
  }

  // Hide snackbar
  function hideTerms() {
    isVisible.value = false;
  }

  return {
    showTerms,
    hideTerms,
    isVisible,
  };
});
