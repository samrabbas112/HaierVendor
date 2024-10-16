import { useAuthStore } from "~/stores/auth";

export default defineNuxtRouteMiddleware(async (to, from) => {
  const authStore = useAuthStore();
  // Ensure this code runs only in the client
  await authStore.initialize();
  const isLoggedIn = authStore.isAuthenticated();

  // Prevent an infinite loop: only redirect if user is not logged in
  if (!isLoggedIn && to.path !== "/login") {
    return navigateTo("/login"); // Redirect to login if user is not logged in and not already on login page
  }

  // Prevent logged-in users from accessing the login page
  if (isLoggedIn && to.path === "/login") {
    return navigateTo("/dashboard"); // Redirect to dashboard if logged in and trying to access login page
  }

  // If already on the correct page (e.g., logged in and on dashboard), no redirect is needed
});
