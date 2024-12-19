<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { VForm } from 'vuetify/components/VForm'
import { useSnackbarStore } from '@/stores/snackbar'
import { useLoaderStore } from '@/stores/loader'
import {
  requiredValidator,
  minLengthValidator,
  alphabetValidator,
  numberValidator,
  exactLengthValidator,
  emailValidator,
  phoneValidator
} from "@/utils/validators";
const loaderStore = useLoaderStore()
const router = useRouter()
const snackBarStore = useSnackbarStore()
const route = useRoute()
const isLoading = ref(false)
const vendorId = route.params.id
const mode = route.query.mode || 'edit' // Default to 'edit' mode
const isDetailsMode = mode === 'details' // Check if it's "details" mode

// References
const refForm = ref<VForm>()
const isFormValid = ref(false)
const selectedProvinceId = ref<number | undefined>(undefined);
const selectedCityId = ref<number | undefined>(undefined);

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
})


const statuses = [
  { text: 'Active', value: 'active' },
  { text: 'InActive', value: 'Inactive' },
]

// Fetch Vendor Details
const fetchVendor = async () => {
  loaderStore.showLoader()
  try {
    const response = await useApi().makeRequest(`haier/vendor/show/${vendorId}`, 'get')
    if (response?.success) {
      Object.assign(form.value, response.data)

      form.value.status = response.data.status ? 'active' : 'Inactive'
      selectedProvinceId.value = response.data.provinceId  
      selectedCityId.value = response.data.cityId  
     
    } else {
      snackBarStore.showSnackbar('Failed to load vendor data', 'error')
    }
  } catch (error) {
    console.error('Error fetching vendor:', error)
    snackBarStore.showSnackbar('An error occurred. Please try again.', 'error')
  } finally {
    loaderStore.hideLoader()
  }
}

// Form Submission Handler
const submitForm = async () => {
  if (!isDetailsMode) {
    refForm.value?.validate().then(async ({ valid }) => {
      if (valid) {
        try {
          isLoading.value = true
          console.log(selectedCityId.value);
          console.log(selectedProvinceId.value);
          const payload = {
            ...form.value,
            city: selectedCityId.value,
            province: selectedProvinceId.value,
            status: form.value.status === 'active', // Convert to boolean
          }

          const response = await useApi().makeRequest(
            `haier/vendor/update/${vendorId}`,
            'put',
            payload,
          )

          if (response?.success) {
            snackBarStore.showSnackbar('Vendor updated successfully!', 'success')
            router.push('/management/vendors')
          }
          else {
            snackBarStore.showSnackbar('Failed to update vendor', 'error')
          }
        }
        catch (error) {
          console.error('Error updating vendor:', error)
          snackBarStore.showSnackbar('An error occurred. Please try again.', 'error')
        }
        finally {
          isLoading.value = false
        }
      }
    })
  }
}

// Fetch the vendor details when the component is mounted
onMounted(() => {
  fetchVendor()
})
</script>

<template>
  <section>
    <VCard>
      <VCardTitle>{{ isDetailsMode ? 'Vendor Details' : 'Edit Vendor' }}</VCardTitle>
      <VCardText>
        <VForm
          ref="refForm"
          v-model="isFormValid"
          @submit.prevent="submitForm"
        >
          <VRow>
            <!-- Name -->
            <VCol
              cols="12"
              sm="6"
            >
              <AppTextField
                v-model="form.name"
                :rules="[requiredValidator, minLengthValidator(3),alphabetValidator]"
                label="Name"
                :readonly="isDetailsMode"
              />
            </VCol>

            <!-- Email -->
            <VCol
              cols="12"
              sm="6"
            >
              <AppTextField
                v-model="form.email"
                :rules="[requiredValidator, emailValidator]"
                label="Email"
                :readonly="isDetailsMode"
              />
            </VCol>

            <!-- Telephone -->
            <VCol
              cols="12"
              sm="6"
            >
              <AppTextField
                v-model="form.telephone"
                :rules="[requiredValidator,phoneValidator]"
                label="Telephone"
                :readonly="isDetailsMode"
              />
            </VCol>

            <!-- CNIC -->
            <VCol
              cols="12"
              sm="6"
            >
              <AppTextField
                v-model="form.cnic"
                :rules="[requiredValidator, exactLengthValidator(13),numberValidator]"
                label="CNIC"
                :readonly="isDetailsMode"
              />
            </VCol>

            <!-- Address -->
            <VCol
              cols="12"
              sm="6"
            >
              <AppTextField
                v-model="form.address"
                :rules="[requiredValidator, minLengthValidator(10)]"
                label="Address"
                :readonly="isDetailsMode"
              />
            </VCol>

            <!-- IBAN (Optional) -->
            <VCol
              cols="12"
              sm="6"
            >
              <AppTextField
                v-model="form.iban"
                label="IBAN"
                :readonly="isDetailsMode"
              />
            </VCol>

            <!-- NTN (Optional) -->
            <VCol
              cols="12"
              sm="6"
            >
              <AppTextField
                v-model="form.ntn"
                label="NTN"
                :readonly="isDetailsMode"
              />
            </VCol>

           

            <!-- Status -->
            <VCol
              cols="12"
              sm="6"
            >
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

            <VCol cols="12" sm="6">
              <ProvinceCitySelector
              v-model:selectedProvinceId="selectedProvinceId"
              v-model:selectedCityId="selectedCityId"
              />
            </VCol>
          </VRow>

          <!-- Actions -->
          <VRow
            v-if="!isDetailsMode"
            justify="end"
            class="mt-6"
          >
            <VCol
              cols="12"
              sm="2"
            >
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
