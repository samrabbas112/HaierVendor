import { useAuthStore } from "~/stores/auth";

export default defineNuxtRouteMiddleware(async (to, from) => {
  const authStore = useAuthStore();
  // Ensure this code runs only in the client
  await authStore.initialize();
  const isLoggedIn = authStore.isAuthenticated(); // Check if the user is authenticated

  if (isLoggedIn) {
      return navigateTo("/dashboard");
  }
  return navigateTo(to);
});
