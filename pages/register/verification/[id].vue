<script setup lang="ts">
import AuthProvider from "@/views/pages/authentication/AuthProvider.vue";
import authV1BottomShape from "@images/svg/auth-v1-bottom-shape.svg?raw";
import authV1TopShape from "@images/svg/auth-v1-top-shape.svg?raw";
import { VNodeRenderer } from "@layouts/components/VNodeRenderer";
import { themeConfig } from "@themeConfig";
import type { VForm } from "vuetify/components/VForm";
import { useRouter } from "vue-router";

import {
  requiredValidator,
  minLengthValidator,
  numberValidator,
  phoneValidator,
} from "@/utils/validators";
import { useSnackbarStore } from "@/stores/snackbar";
import ProvinceCitySelector from "@/components/ProvinceCitySelector.vue";
import { useRoute } from "vue-router";
import { ref, onMounted } from "vue";

const router = useRouter();
const selectedProvinceId = ref<number | undefined>(undefined);
const selectedCityId = ref<number | undefined>(undefined);
  const isLinkExpired = ref(false);
const route = useRoute();
const props = defineProps<Props>();
interface Props {
  customer: Record<string, any>;
}
const snackBarStore = useSnackbarStore();

definePageMeta({
  layout: "blank",
  public: true,
});

// Refs
const isFormValid = ref(false);
const isConfirmLoading = ref(false);
const isDeclineLoading = ref(false);
const refForm = ref<VForm>();
const apiRequestObj = useApi();

const userData = ref({
  name: "",
  address: "",
  city: "",
  province: "",
  phone_number: "",
});

const validateLinkExpiration = async (id: string) => {
  try {
    const fullUrl = window.location.href;
    const requestData = {
      'id' : id,
      'link' : fullUrl,
    };
    const response = await apiRequestObj.makeRequest(`common/customer/linkVerify`, "post",requestData);
    if (response.data) {
      snackBarStore.showSnackbar(response.message, "error");
      isLinkExpired.value = true;
      console.log('samr',isLinkExpired.value);
    }
  } catch (error) {
    console.error("Error verifying customer Link:", error);
    snackBarStore.showSnackbar("Failed to fetch data.", "error");
  }

  
};


const fetchCustomerData = async (id: string) => {
  try {
    const response = await apiRequestObj.makeRequest(`common/show/${id}`, "get");
    if (response.data) {
      userData.value = {
        ...response.data,
        city: response.data.cityId,
        province: response.data.provinceId,
      };
      selectedProvinceId.value = response.data.provinceId;
      selectedCityId.value = response.data.cityId;
    }
  } catch (error) {
    console.error("Error fetching customer data:", error);
    snackBarStore.showSnackbar("Failed to fetch customer data.", "error");
  }
};

const handleFormAction = async (action: boolean) => {
  if (!action) {
    isDeclineLoading.value = true;
  } else {
    isConfirmLoading.value = true;
  }

  try {
    const customerId = route.params.id as string;
    const payload = {
      ...userData.value,
      city: selectedCityId.value,
      province: selectedProvinceId.value,
    };

    const data = {
      action,
      customerId,
      updatedFields: payload,
    };

    const response = await apiRequestObj.makeRequest("common/customer/verify", "post", data);
    if (response.success) {
      if (!action) {
        snackBarStore.showSnackbar("Customer Registration Declined!", "success");

        router.push({
          path: `/Thankyou`,
          query: { mode: "decline" },
        });
      } else {
        snackBarStore.showSnackbar("Customer verified successfully!", "success");

        router.push({
          path: `/Thankyou`,
          query: { mode: "confirm" },
        });
      }
    } 
    else {
      snackBarStore.showSnackbar("Action failed, please try again.", "error");
    }
  }
   catch (error) {
    snackBarStore.showSnackbar("An error occurred: " + error.message, "error");
  } finally {
    if (!action) {
      isDeclineLoading.value = false;
    } else {
      isConfirmLoading.value = false;
    }
  }
};


onMounted(() => {
  const customerId = route.params.id as string;

  validateLinkExpiration(customerId);

  if (customerId) {
    fetchCustomerData(customerId);
  }

});
</script>

<template>
  <SnackBar />
  <div v-if="isLinkExpired" class="auth-wrapper d-flex align-center justify-center pa-4">
    <div class="position-relative my-sm-16">
      <h4 class="text-h4">Link Expired</h4>
      <p>This link has expired. Please contact support for assistance.</p>
    </div>
  </div>
  <div v-else class="auth-wrapper d-flex align-center justify-center pa-4">
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
            Customer Registration <br /> Verification
          </h4>
          <p class="mb-0">
            Please review the information below to ensure it is accurate.
          </p>
        </VCardText>
        <VCardText>
          <VForm ref="refForm" v-model="isFormValid">
            <VRow>
              <!-- Name -->
              <VCol cols="12">
                <AppTextField v-model="userData.name" :rules="[requiredValidator, minLengthValidator(3)]" label="Name"
                  placeholder="Enter name" />
              </VCol>

              <!-- Address -->
              <VCol cols="12">
                <AppTextField v-model="userData.address" :rules="[requiredValidator, minLengthValidator(10)]"
                  label="Address" placeholder="Enter address" />
              </VCol>
              <VCol cols="12" style="padding: 0;">
                <ProvinceCitySelector v-model:selectedProvinceId="selectedProvinceId"
                  v-model:selectedCityId="selectedCityId" :add-class="true"/>
              </VCol>

              <!-- Phone Number -->
              <VCol cols="12">
                <AppTextField v-model="userData.phone_number" type="tel"
                  :rules="[requiredValidator, phoneValidator, minLengthValidator(10), numberValidator]"
                  label="Phone Number" placeholder="+1234567890" />
              </VCol>

              <!-- Submit & Cancel -->
              <VCol cols="12" class="d-flex justify-center align-center">
                <VBtn type="submit" class="me-3" @click.prevent="handleFormAction(true)">
                  <VProgressCircular v-if="isConfirmLoading" indeterminate color="white" />
                  <template v-else> Confirm </template>
                </VBtn>
                <VBtn type="submit" variant="tonal" color="error" @click.prevent="handleFormAction(false)">
                  <VProgressCircular v-if="isDeclineLoading" indeterminate color="white" />
                  <template v-else> Decline </template>
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
<!--  -->
