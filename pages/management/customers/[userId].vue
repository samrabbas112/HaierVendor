<script setup lang="ts">
import AuthProvider from "@/views/pages/authentication/AuthProvider.vue";
import authV1BottomShape from "@images/svg/auth-v1-bottom-shape.svg?raw";
import authV1TopShape from "@images/svg/auth-v1-top-shape.svg?raw";
import { VNodeRenderer } from "@layouts/components/VNodeRenderer";
import { themeConfig } from "@themeConfig";
import type { VForm } from "vuetify/components/VForm";
import {
  requiredValidator,
  minLengthValidator,
  numberValidator,
  phoneValidator,
} from "@/utils/validators";
import { useSnackbarStore } from "@/stores/snackbar";
import ProvinceCitySelector from "@/components/ProvinceCitySelector.vue";

const selectedProvinceId = ref<number | undefined>(undefined);
const selectedCityId = ref<number | undefined>(undefined);
const route = useRoute();
const timer = ref<number>(60); // Countdown timer in seconds
const timerInterval: Ref<NodeJS.Timer | null> = ref(null);
const isResendDisabled = computed(() => timer.value > 0);

definePageMeta({
  layout: "blank",
  public: true,
});

// Props
const props = defineProps<Props>();
interface Props {
  customer: Record<string, any>;
}

const emit = defineEmits(["customer-updated", "update:isDrawerOpen"]);

// Refs
const isFormValid = ref(false);
const isCodeLoading = ref(false);
const isSubmitLoading = ref(false);
const isCodeVerified = ref(false);
const isCodeFetched = ref(false); // Track if the code has been fetched
const refForm = ref<VForm>();


const snackBarStore = useSnackbarStore();
const apiRequestObj = useApi();

const customer = toRef(props, "customer");

const name = ref("");
const phoneNumber = ref("");
const address = ref("");
const code = ref("");


// Watch the customer object
watch(
  customer,
  (newCustomer) => {
    if (newCustomer) {
      name.value = newCustomer.name || "";
      phoneNumber.value = newCustomer.phone_number || "";
      address.value = newCustomer.address || "";
      code.value = newCustomer.code || "";
    }
  },
  { immediate: true, deep: true },
);

const startTimer = () => {
  if (timerInterval.value) clearInterval(timerInterval.value); // Clear any existing timer
  timer.value = 60; // Reset the timer
  timerInterval.value = setInterval(() => {
    if (timer.value > 0) {
      timer.value--;
    } else {
      clearInterval(timerInterval.value as NodeJS.Timer);
      timerInterval.value = null;
    }
  }, 1000);
};


// API to get code
const getCode = async () => {
  try {
    if(code.value.length >  0) {
      code.value = '';
    }
    if (!phoneValidator(phoneNumber.value)) {
      snackBarStore.showSnackbar("Invalid phone number", "error");
      return;
    }

    isCodeLoading.value = true;
    const response = await apiRequestObj.makeRequest(`common/get-otp`, "post", {
      telephone: phoneNumber.value,
    });

    if (response?.success) {
      snackBarStore.showSnackbar(
        "Code has been sent to your phone number",
        "success",
      );
      isCodeFetched.value = true;
      startTimer();
    } else {
      snackBarStore.showSnackbar(
        response?.message || "Failed to send code",
        "error",
      );
      isCodeFetched.value = false;
    }
  } catch (error) {
    snackBarStore.showSnackbar(
      "Something went wrong while sending the code",
      "error",
    );
    isCodeFetched.value = false;
  } finally {
    isCodeLoading.value = false;
  }
};

const checkCodeLength = async () => {
  try {
    if (code.value.length === 6) {
       await verifyCode();
    } 
  } catch (error) {
    console.error("An error occurred:", error);
  }
};

// API to verify OTP
const verifyCode = async () => {
  try {
    if (!code.value) {
      snackBarStore.showSnackbar("Please enter the code", "error");
      return;
    }
    
    const response = await apiRequestObj.makeRequest(
      `common/verify-otp`,
      "post",
      {
        telephone: phoneNumber.value,
        code: code.value,
      },
    );

    if (response?.success) {
      isCodeVerified.value = true;
      snackBarStore.showSnackbar("OTP verified successfully", "success");
      isCodeFetched.value = true;
      isCodeVerified.value = true;
    } else {
      snackBarStore.showSnackbar("OTP is incorrect", "error");
      isCodeVerified.value = false;
    }
  } catch (error) {
    snackBarStore.showSnackbar(
      "Something went wrong during OTP verification",
      "error",
    );
    isCodeVerified.value = false;
  } 
};

// Handle form submission
const onSubmit = async () => {

  refForm.value?.validate().then(async ({ valid }) => {
    if (valid) {
      const formData = {
        name: name.value,
        phone_number: phoneNumber.value,
        city: selectedCityId.value,
        province: selectedProvinceId.value,
        address: address.value,
        vendorId: route.params.userId,
        code: "112233",
      };

      try {
        isSubmitLoading.value = true;
        const response = await apiRequestObj.makeRequest(
          `common/store`,
          "post",
          formData,
        );

        if (response?.success) {
          snackBarStore.showSnackbar(
            "Customer registered successfully",
            "success",
          );
          emit("customer-updated");
          emit("update:isDrawerOpen", false);
          refForm.value?.reset();
        } else {
          const messages = response?.message;
          let allErrors = [];

          // Check if the message array exists
          if (Array.isArray(messages)) {
            allErrors = messages
              .map((msg) => msg?.errors)
              .filter((error) => error); // Extract 'errors' field
          }

          // Join all errors into a single string
          const errorMessage =
            allErrors.length > 0 ? allErrors.join("\n") : "Unknown Error";

          // Show snackbar with all errors
          snackBarStore.showSnackbar(errorMessage, "error");
        }
      } catch (error) {
        snackBarStore.showSnackbar(
          "Something went wrong during registration",
          "error",
        );
      } finally {
        isSubmitLoading.value = false;
      }
    }
  });
};
</script>

<template>
  <SnackBar />
  <div class="auth-wrapper d-flex align-center justify-center pa-4">
    <div class="position-relative my-sm-16">
      <!-- Shapes -->
      <VNodeRenderer :nodes="h('div', { innerHTML: authV1TopShape })"
        class="text-primary auth-v1-top-shape d-none d-sm-block" />
      <VNodeRenderer :nodes="h('div', { innerHTML: authV1BottomShape })"
        class="text-primary auth-v1-bottom-shape d-none d-sm-block" />

      <!-- Auth Card -->
      <VCard class="auth-card" max-width="460" :class="$vuetify.display.smAndUp ? 'pa-6' : 'pa-0'">
        <VCardText>
          <h4 class="text-h4 mb-1">
            Welcome to <span class="text-capitalize">Haier</span>! 👋🏻
          </h4>
          <p class="mb-0">
            Please review the information below to ensure it is accurate.
          </p>
        </VCardText>

        <!-- Form -->
        <VCardText>
          <VForm ref="refForm" v-model="isFormValid" @submit.prevent="onSubmit">
            <VRow>
              <!-- Name -->
              <VCol cols="12">
                <AppTextField v-model="name" :rules="[requiredValidator, minLengthValidator(3)]" label="Name"
                  placeholder="Enter name" />
              </VCol>

              <!-- Address -->
              <VCol cols="12">
                <AppTextField v-model="address" :rules="[requiredValidator, minLengthValidator(10)]" label="Address"
                  placeholder="Enter address" />
              </VCol>

              <!-- Province and City Selector -->
              <ProvinceCitySelector v-model:selectedProvinceId="selectedProvinceId"
                v-model:selectedCityId="selectedCityId" />

              <!-- Phone Number -->
              <VCol cols="12">
                <AppTextField v-model="phoneNumber" type="tel" :rules="[
                  requiredValidator,
                  phoneValidator,
                  minLengthValidator(10),
                  numberValidator,
                ]" label="Phone Number" placeholder="+1234567890" />
              </VCol>

              <!-- Code -->
              <VCol cols="12">
                <AppTextField v-model="code" :rules="[requiredValidator, minLengthValidator(6)]" label="Code"
                  placeholder="Enter code"  @input="checkCodeLength"  />
              </VCol>

              <!-- Action Buttons -->
              <VCol cols="12">
                <VBtn type="button" class="me-3" v-if="!isCodeFetched"
                  :disabled="!phoneValidator(phoneNumber.value) || phoneNumber.length < 10" @click="getCode" full-width>
                  <VProgressCircular v-if="isCodeLoading" indeterminate color="white" />
                  <template v-else> Get Code </template>
                </VBtn>
                <VBtn type="button" class="me-3" v-if="isCodeFetched"
                  :disabled="isResendDisabled || !phoneValidator(phoneNumber.value) || phoneNumber.length < 10"
                  @click="getCode" full-width>
                  <VProgressCircular v-if="isCodeLoading" indeterminate color="white" />
                  <template v-else>
                    <span style="text-transform: none;">{{ isResendDisabled ? `${timer} sec` : "Resend Code" }}</span>
                  </template>
                </VBtn>

                <VBtn type="submit" class="me-3" :disabled="!isCodeFetched || !isCodeVerified" full-width>
                  <VProgressCircular v-if="isSubmitLoading" indeterminate color="white" />
                  <template v-else> Submit </template>
                </VBtn>

                <VBtn type="reset" variant="tonal" color="error" @click="refForm?.reset()" full-width>
                  Cancel
                </VBtn>

              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </div>
  </div>
</template>

<style lang="scss">
@use "@core/scss/template/pages/page-auth";
</style>
