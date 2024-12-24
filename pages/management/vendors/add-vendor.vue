<script setup lang="ts">
import { inject, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import type { VForm } from 'vuetify/components/VForm'
import { useSnackbarStore } from '@/stores/snackbar'
import { useLoaderStore } from '@/stores/loader'

import {
  alphabetValidator,
  emailValidator,
  exactLengthValidator,
  minLengthValidator,
  numberValidator,
  phoneValidator,
  requiredValidator,
} from '@/utils/validators'

const selectedProvinceId = ref<number | undefined>(undefined)
const selectedCityId = ref<number | undefined>(undefined)
const loaderStore = useLoaderStore()
const router = useRouter()
const snackBarStore = useSnackbarStore()

// References
const refForm = ref<VForm>()
const isFormValid = ref(false)
const isPasswordVisible = ref(false)

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
  province: 'Select Province',
  city: 'Select City',
  status: 'active',
})

const statuses = [
  { text: 'Active', value: 'active' },
  { text: 'Inactive', value: 'inactive' },
]

// Form Submission Handler
const submitForm = async () => {
  refForm.value?.validate().then(async ({ valid }) => {
    if (valid) {
      try {
        const payload = {
          ...form.value,
          city: selectedCityId.value,
          province: selectedProvinceId.value,
          status: form.value.status === 'active', // Convert to boolean
        }

        const response = await useApi().makeRequest(
          'haier/vendor/store',
          'post',
          payload,
        )

        if (response && response.success) {
          resetForm()
          snackBarStore.showSnackbar('Vendor created successfully!', 'success')
          router.push('/management/vendors') // Navigate to the vendor list page
        }
        else {
          console.log(response)
          snackBarStore.showSnackbar(
            response.message || 'Failed to save vendor data',
            'error',
          )
        }
      }
      catch (error) {
        snackBarStore.showSnackbar('An error occurred. Please try again.', 'error')
      }
    }
  })
}

// Reset Form Handler
const resetForm = () => {
  refForm.value?.reset()
  refForm.value?.resetValidation()
}
</script>

<template>
  <section>
    <VCard>
      <VCardTitle>
        Add New Vendor
      </VCardTitle>
      <VCardText>
        <!-- Form -->
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
                :rules="[requiredValidator, minLengthValidator(3), alphabetValidator]"
                label="Name"
                placeholder="Enter Vendor Name"
                maxlength="50"
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
                placeholder="example@example.com"
              />
            </VCol>

            <!-- Password -->
            <VCol
              cols="12"
              sm="6"
            >
              <AppTextField
                v-model="form.password"
                label="Password"
                placeholder="············"
                :type="isPasswordVisible ? 'text' : 'password'"
                :append-inner-icon="
                  isPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'
                "
                :rules="[requiredValidator, passwordValidator]"
                @click:append-inner="isPasswordVisible = !isPasswordVisible"
              />
            </VCol>

            <!-- Telephone -->
            <VCol
              cols="12"
              sm="6"
            >
              <AppTextField
                v-model="form.telephone"
                :rules="[requiredValidator, phoneValidator]"
                label="Telephone"
                type="tel"
                placeholder="03xxxxxxxxx"
              />
            </VCol>

            <!-- CNIC -->
            <VCol
              cols="12"
              sm="6"
            >
              <AppTextField
                v-model="form.cnic"
                :rules="[requiredValidator, exactLengthValidator(13), numberValidator]"
                label="CNIC"
                placeholder="Enter CNIC (e.g., 12345-1234567-1)"
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
                placeholder="Enter Address"
                maxlength="200"
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
                placeholder="Enter IBAN (e.g., CountryCode + CheckDigits + BasicBankAccountNumber)"
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
                placeholder="Enter NTN (e.g., 1234567-8)"
              />
            </VCol>
            <ProvinceCitySelector
              v-model:selectedProvinceId="selectedProvinceId"
              v-model:selectedCityId="selectedCityId"
            />
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
              />
            </VCol>
          </VRow>

          <!-- Actions -->
          <VRow
            justify="end"
            class="mt-6"
          >
            <VCol
              cols="12"
              sm="3"
            >
              <VBtn
                color="primary"
                type="submit"
              >
                Submit
              </VBtn>
              <VBtn
                class="ml-2"
                variant="tonal"
                color="error"
                type="reset"
                @click="resetForm"
              >
                Reset
              </VBtn>
            </VCol>
          </VRow>
        </VForm>
      </VCardText>
    </VCard>
  </section>
</template>

<style scoped>
/* Ensure no CSS or comments interfere with the script section */
</style>
