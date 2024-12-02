<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useSnackbarStore } from '@/stores/snackbar';
import type { VForm } from 'vuetify/components/VForm';
import { useLoaderStore } from '@/stores/loader'

const loaderStore = useLoaderStore()
const router = useRouter();
const snackBarStore = useSnackbarStore();
const route = useRoute();
const vendorId = route.params.id;
const mode = route.query.mode || 'edit'; // Default to 'edit' mode
const isDetailsMode = mode === 'details'; // Check if it's "details" mode

// References
const refForm = ref<VForm>();
const isFormValid = ref(false);

// Form State
const form = ref({
  name: '',
  email: '',
  password: '',
  telephone: '',
  cnic: '',
  address: '',
  iban: '',
  ntn: '',
  province: '',
  city: '',
  status: 'active',
});

// Validation Rules
const requiredValidator = (value: string): boolean | string => {
  console.log(value);
  return !!value || 'This field is required';
};
const emailValidator = (value: string) =>
  /^\S+@\S+\.\S+$/.test(value) || 'Invalid email address';

const phoneValidator = (value: string) => {
  const phoneRegex = /^[0-9]{11}$/;
  return phoneRegex.test(value) || 'Invalid phone number. Must be be valid phone number.';
};

// Dropdown Options
const provinces = ['Sindh', 'Punjab', 'KPK', 'Balochistan', 'Islamabad'];
const cities = ['Karachi', 'Lahore', 'Peshawar', 'Quetta', 'Islamabad'];
const statuses = [
  { text: 'Active', value: 'active' },
  { text: 'InActive', value: 'Inactive' },
];



// Fetch Vendor Details
const fetchVendor = async () => {
  loaderStore.showLoader();
  try {
    const response = await useApi().makeRequest(`haier/vendor/show/${vendorId}`, 'get');
    if (response?.success) {
      Object.assign(form.value, response.data);
      form.value.status = response.data.status ? 'active' : 'Inactive';

    } else {
      snackBarStore.showSnackbar('Failed to load vendor data', 'error');
    }
  } catch (error) {
    console.error('Error fetching vendor:', error);
    snackBarStore.showSnackbar('An error occurred. Please try again.', 'error');
  }
  loaderStore.hideLoader();

};

// Form Submission Handler
const submitForm = async () => {
  if (!isDetailsMode) {
    refForm.value?.validate().then(async ({ valid }) => {
    if (valid) {
      try {
        const payload = {
            ...form.value,
            status: form.value.status === 'active', // Convert to boolean
          };

        const response = await useApi().makeRequest(
          `haier/vendor/update/${vendorId}`,
          'put',
          payload
        );

        if (response?.success) {
          snackBarStore.showSnackbar('Vendor updated successfully!', 'success');
        } else {
          snackBarStore.showSnackbar('Failed to update vendor', 'error');
        }
      } catch (error) {
        console.error('Error updating vendor:', error);
        snackBarStore.showSnackbar('An error occurred. Please try again.', 'error');
      }
    }
  });
  }
 
};

// Fetch the vendor details when the component is mounted
onMounted(() => {
  fetchVendor();
});
</script>

<template>
  <section>
    <VCard>
      <VCardTitle>{{ isDetailsMode ? 'Vendor Details' : 'Edit Vendor' }}</VCardTitle>
      <VCardText>
        <VForm ref="refForm" v-model="isFormValid" @submit.prevent="submitForm">
          <VRow>
            <!-- Name -->
            <VCol cols="12" sm="6">
              <AppTextField
                v-model="form.name"
                :rules="[requiredValidator]"
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
              />
            </VCol>

            <!-- Telephone -->
            <VCol cols="12" sm="6">
              <AppTextField
                v-model="form.telephone"
                :rules="[requiredValidator,phoneValidator]"
                label="Telephone"
                :readonly="isDetailsMode"
              />
            </VCol>

            <!-- CNIC -->
            <VCol cols="12" sm="6">
              <AppTextField
                v-model="form.cnic"
                :rules="[requiredValidator]"
                label="CNIC"
                :readonly="isDetailsMode"
              />
            </VCol>

            <!-- Address -->
            <VCol cols="12" sm="6">
              <AppTextField
                v-model="form.address"
                :rules="[requiredValidator]"
                label="Address"
                :readonly="isDetailsMode"
              />
            </VCol>

            <!-- IBAN (Optional) -->
            <VCol cols="12" sm="6">
              <AppTextField v-model="form.iban" label="IBAN" :readonly="isDetailsMode" />
            </VCol>

            <!-- NTN (Optional) -->
            <VCol cols="12" sm="6">
              <AppTextField v-model="form.ntn" label="NTN" :readonly="isDetailsMode" />
            </VCol>

            <!-- Province -->
            <VCol cols="12" sm="6">
              <AppSelect
                v-model="form.province"
                :items="provinces"
                :rules="[requiredValidator]"
                label="Province"
                :disabled="isDetailsMode"
              />
            </VCol>

            <!-- City -->
            <VCol cols="12" sm="6">
              <AppSelect
                v-model="form.city"
                :items="cities"
                :rules="[requiredValidator]"
                label="City"
                :disabled="isDetailsMode"
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
          </VRow>

          <!-- Actions -->
          <VRow justify="end" class="mt-6" v-if="!isDetailsMode">
            <VCol cols="12" sm="3">
              <VBtn color="primary" type="submit">
                Save Changes
              </VBtn>
              <VBtn
                class="ml-2"
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
