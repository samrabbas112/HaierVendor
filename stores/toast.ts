// src/stores/toastStore.ts
import { defineStore } from "pinia";
import { ref } from "vue";

export const useToastStore = defineStore("toast", () => {
  const message = ref("");
  const type = ref(""); // success, error, warning, info
  const show = ref(false);

  function showToast(newMessage: string, newType: string = "") {
    message.value = newMessage;
    type.value = newType;
    show.value = true;
    console.log("working show toast");

    // Automatically hide the toast after 3 seconds
    // setTimeout(() => {
    //   show.value = false
    // }, 3000)
  }

  return {
    message,
    type,
    show,
    showToast,
  };
});
