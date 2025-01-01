<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import type { VForm } from "vuetify/components/VForm";
import { useSnackbarStore } from "@/stores/snackbar";
import { useLoaderStore } from "@/stores/loader";
import {
  requiredValidator,
  minLengthValidator,
  alphabetValidator,
  numberValidator,
  exactLengthValidator,
  emailValidator,
  phoneValidator,
} from "@/utils/validators";
const loaderStore = useLoaderStore();
const router = useRouter();
const snackBarStore = useSnackbarStore();
const route = useRoute();
const isLoading = ref(false);
const vendorId = route.params.id;
const mode = route.query.mode || "edit"; // Default to 'edit' mode
const isDetailsMode = mode === "details"; // Check if it's "details" mode

// References
const refForm = ref<VForm>();
const isFormValid = ref(false);
const selectedProvinceId = ref<number | undefined>(undefined);
const selectedCityId = ref<number | undefined>(undefined);

// Form State
const form = ref({
  id:"",
  name: "",
  email: "",
  password: "",
  telephone: "",
  cnic: "",
  address: "",
  iban: "",
  ntn: "",
  province: "",
  city: "",
  status: "active",
});

const statuses = [
  { text: "Active", value: "active" },
  { text: "InActive", value: "Inactive" },
];


// Fetch Vendor Details
const fetchVendor = async () => {
  loaderStore.showLoader();
  try {
    const response = await useApi().makeRequest(
      `haier/vendor/show/${vendorId}`,
      "get",
    );
    if (response?.success) {
      Object.assign(form.value, response.data);

      form.value.status = response.data.status ? "active" : "Inactive";
      selectedProvinceId.value = response.data.provinceId;
      selectedCityId.value = response.data.cityId;
    } else {
      snackBarStore.showSnackbar("Failed to load vendor data", "error");
    }
  } catch (error) {
    console.error("Error fetching vendor:", error);
    snackBarStore.showSnackbar("An error occurred. Please try again.", "error");
  } finally {
    loaderStore.hideLoader();
  }
};

// Form Submission Handler
const submitForm = async () => {
  if (!isDetailsMode) {
    refForm.value?.validate().then(async ({ valid }) => {
      if (valid) {
        try {
          isLoading.value = true;
          console.log(selectedCityId.value);
          console.log(selectedProvinceId.value);
          const payload = {
            ...form.value,
            city: selectedCityId.value,
            province: selectedProvinceId.value,
            status: form.value.status === "active", // Convert to boolean
          };

          const response = await useApi().makeRequest(
            `haier/vendor/update/${vendorId}`,
            "put",
            payload,
          );

          if (response?.success) {
            snackBarStore.showSnackbar(
              "Vendor updated successfully!",
              "success",
            );
            router.push("/management/vendors");
          } else {
            const messages = response?.message;
            console.log(messages);

            if (Array.isArray(messages)) {
              messages.forEach((item) => {
                Object.keys(item).forEach((key) => {
                  const errorMessages = item[key];
                  if (Array.isArray(errorMessages)) {
                    errorMessages.forEach((errorMessage) => {
                      snackBarStore.showSnackbar(errorMessage, "error");
                    });
                  }
                });
              });
            } else {
              snackBarStore.showSnackbar("Failed to update vendor.", "error");
            }
          }
        } catch (error) {
          console.error("Error updating vendor:", error);
          snackBarStore.showSnackbar(
            "An error occurred. Please try again.",
            "error",
          );
        } finally {
          isLoading.value = false;
        }
      }
    });
  }
};

// Fetch the vendor details when the component is mounted
onMounted(() => {
  fetchVendor();
});

const onInputRestrictLength = (field, maxLength) => {
  // Restrict length to maxLength
  if (form.value[field].length > maxLength) {
    form.value[field] = form.value[field].slice(0, maxLength);
  }

  // For 'ntn' field (custom handling for NTN format)
  if (field === 'ntn') {
    // Remove any non-numeric characters (excluding the hyphen for formatting)
    let rawValue = form.value[field].replace(/\D/g, ''); // \D removes anything that is not a digit
    if (rawValue.length > 7) {
      form.value[field] = rawValue.slice(0, 7) + '-' + rawValue.slice(7, 8); // First 7 digits, then hyphen and the last digit
    } else {
      form.value[field] = rawValue; // Only the numeric digits (no hyphen if not enough digits)
    }
  }

  // For 'cnic' or 'number' (disable non-numeric characters)
  if (field === 'cnic' || field === 'telephone') {
    // Replace non-digit characters with an empty string
    form.value[field] = form.value[field].replace(/\D/g, ''); // \D matches anything that is not a digit
  }
};

const restrictSpaces = () => {
  form.value.email = form.value.email.replace(/\s/g, '');
}

const ibanRegex = /^[A-Z]{2}\d{2}[A-Z\d]{1,30}$/;
const ntnRegex = /^\d{7}-\d$/;
</script>

<template>
  <section>
    <VCard>
      <VCardTitle>{{
        isDetailsMode ? "Vendor Details" : "Edit Vendor"
      }}</VCardTitle>
      <VCardText>
        <VForm ref="refForm" v-model="isFormValid" @submit.prevent="submitForm">
          <VRow>
            <!-- Name -->
            <VCol cols="12" sm="6">
              <AppTextField
                v-model="form.name"
                :rules="[
                  alphabetValidator,
                  requiredValidator,
                  minLengthValidator(3),
                ]"
                label="Name"
                :readonly="isDetailsMode"
              />
            </VCol>

            <!-- Email -->
            <VCol cols="12" sm="6">
              <AppTextField
                v-model="form.email"
                :rules="[requiredValidator, emailValidator]"
                label="Email"
                :readonly="isDetailsMode"
                 @input="restrictSpaces"
              />
            </VCol>

            <!-- Telephone -->
            <VCol cols="12" sm="6">
              <AppTextField
                v-model="form.telephone"
                :rules="[requiredValidator, phoneValidator]"
                label="Telephone"
                :readonly="isDetailsMode"
                 @input="() => onInputRestrictLength('telephone', 11)"
              />
            </VCol>

            <!-- CNIC -->
            <VCol cols="12" sm="6">
              <AppTextField
                v-model="form.cnic"
                :rules="[
                  requiredValidator,
                  exactLengthValidator(13),
                  numberValidator,
                ]"
                label="CNIC"
                :readonly="isDetailsMode"
                @input="() => onInputRestrictLength('cnic', 13)"
              />
            </VCol>

            <!-- Address -->
            <VCol cols="12" sm="6">
              <AppTextField
                v-model="form.address"
                :rules="[requiredValidator, minLengthValidator(10)]"
                label="Address"
                :readonly="isDetailsMode"
              />
            </VCol>

            <!-- IBAN (Optional) -->
            <VCol cols="12" sm="6">
              <AppTextField
                v-model="form.iban"
                label="IBAN"
                :readonly="isDetailsMode"
                :rules="[regexValidator(form.iban, ibanRegex, 'Invalid IBAN')]"
                @input="onInputRestrictLength('iban', 24)"
              />
            </VCol>

            <!-- NTN (Optional) -->
            <VCol cols="12" sm="6">
              <AppTextField
                v-model="form.ntn"
                label="NTN"
                :readonly="isDetailsMode"
                :rules="[
                  regexValidator(
                    form.ntn,
                    ntnRegex,
                    'Invalid NTN format. Correct format: 1234567-8',
                  ),
                ]"
                @input="onInputRestrictLength('ntn', 9)"
              />
            </VCol>

            <!-- Status -->
            <VCol cols="12" sm="6">
              <AppSelect
                v-model="form.status"
                :items="statuses"
                :rules="[requiredValidator]"
                label="Status"
                item-title="text"
                item-value="value"
                :disabled="isDetailsMode"
              />
            </VCol>

            <ProvinceCitySelector
              v-model:selectedProvinceId="selectedProvinceId"
              v-model:selectedCityId="selectedCityId"
            />
          </VRow>

          <!-- Actions -->
          <VRow v-if="!isDetailsMode" justify="end" class="mt-6">
            <VCol cols="12" sm="2">
              <!--
                <VBtn color="primary" type="submit">
                Save Changes
                </VBtn>
              -->
              <Custombutton
                btn-text="save"
                type="submit"
                :is-loading="isLoading"
              />
              <VBtn
                class="ml-1"
                variant="tonal"
                color="error"
                @click="router.push('/management/vendors')"
              >
                Cancel
              </VBtn>
            </VCol>
          </VRow>
        </VForm>
      </VCardText>
    </VCard>
  </section>
</template>

<style scoped>
/* Scoped styles */
</style>
