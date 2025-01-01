<script setup lang="ts">
import AuthProvider from "@/views/pages/authentication/AuthProvider.vue";
import authV1BottomShape from "@images/svg/auth-v1-bottom-shape.svg?raw";
import authV1TopShape from "@images/svg/auth-v1-top-shape.svg?raw";
import { VNodeRenderer } from "@layouts/components/VNodeRenderer";
import { themeConfig } from "@themeConfig";
import type { VForm } from "vuetify/components/VForm";
import { useRouter } from "vue-router";
import { useSnackbarStore } from "@/stores/snackbar";
import ProvinceCitySelector from "@/components/ProvinceCitySelector.vue";
import { ref, onMounted,watchEffect } from "vue";
import ThankYouBackground from '~/components/ThankYouBackground.vue';

// Get the current route to access the query parameter
const route = useRoute();
const event = ref('success');  // Default to success

// Watch for changes in the `mode` query parameter and update the event accordingly
watchEffect(() => {
  const mode = route.query.mode;
  if (mode === 'decline') {
    event.value = 'decline'; // Set to 'decline' if mode is 'decline'
  } else {
    event.value = 'success'; // Default to success
  }
});

const selectedProvinceId = ref<number | undefined>(undefined);
const selectedCityId = ref<number | undefined>(undefined);
  const isLinkExpired = ref(false);
const props = defineProps<Props>();
interface Props {
  customer: Record<string, any>;
}
const snackBarStore = useSnackbarStore();

definePageMeta({
  layout: "blank",
  public: true,
});

</script>

<template>
    <div class="auth-wrapper d-flex align-center justify-center pa-4">
      <div class="position-relative my-sm-16">
        <!-- Shapes -->
        <VNodeRenderer 
          :nodes="h('div', { innerHTML: authV1TopShape })" 
          class="text-primary auth-v1-top-shape d-none d-sm-block" 
        />
        <VNodeRenderer 
          :nodes="h('div', { innerHTML: authV1BottomShape })" 
          class="text-primary auth-v1-bottom-shape d-none d-sm-block" 
        />
  
        <!-- Auth Card -->
        <VCard class="auth-card" max-width="460" :class="$vuetify.display.smAndUp ? 'pa-6' : 'pa-0'">
          <div class="container text-center">
            <!-- Thank You Background Component -->
            <div class="w-full text-center flex justify-center mb-24">
              <ThankYouBackground :event="event" />
            </div>
  
            <!-- Conditional Rendering Based on Event -->
            <div v-if="event === 'confirm'" class="block text-center container">
              <div class="mt-10 font-bold text-[28px]">
                <h2 class="congratulations-title text-2xl md:text-4xl lg:text-5xl">
                  Congratulations!
                </h2>
              </div>
              <div class="text-center text-2xl md:text-3xl congratulations-description">
                on your registration success.
              </div>
            </div>
  
            <div v-else class="block text-center container">
              <div class="mt-10 font-bold text-[28px]">
                <h2 class="congratulations-title text-2xl md:text-4xl lg:text-5xl">
                  Thank you!
                </h2>
              </div>
              <div class="text-center text-2xl md:text-3xl congratulations-description">
                Your response has been submitted.
              </div>
            </div>
          </div>
        </VCard>
      </div>
    </div>
  </template>
  

<style lang="scss">
@use "@core/scss/template/pages/page-auth";
</style>
<!--  -->
