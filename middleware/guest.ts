import { useAuthStore } from "~/stores/auth";

export default defineNuxtRouteMiddleware(async (to, from) => {
  const authStore = useAuthStore();
  // Ensure this code runs only in the client
  await authStore.initialize();
  const isLoggedIn = authStore.isAuthenticated(); // Check if the user is authenticated

  if (isLoggedIn) {
    if (to.path === "/login") {
      return navigateTo("/dashboard"); // Redirect to dashboard if already logged in
    }
  } else {
    // If not authenticated, allow access to login page but redirect if accessing other pages
    if (to.path !== "/login") {
      return navigateTo("/login"); // Redirect to login if not logged in and trying to access a different page
    }
  }
});
