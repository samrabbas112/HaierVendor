<script setup lang="ts">
import AuthProvider from '@/views/pages/authentication/AuthProvider.vue'
import authV1BottomShape from '@images/svg/auth-v1-bottom-shape.svg?raw'
import authV1TopShape from '@images/svg/auth-v1-top-shape.svg?raw'
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { themeConfig } from '@themeConfig'
import type { VForm } from 'vuetify/components/VForm'
import { requiredValidator, minLengthValidator, numberValidator, phoneValidator } from '@/utils/validators'
import { useSnackbarStore } from '@/stores/snackbar'
const route = useRoute()


definePageMeta({
  layout: 'blank',
  public: true,
})

// Props
const props = defineProps<Props>()
interface Props {
  customer: Record<string, any>
}

const emit = defineEmits(['customer-updated', 'update:isDrawerOpen'])

// Refs
const isFormValid = ref(false)
const isLoading = ref(false)
const isCodeVerified = ref(false)
const refForm = ref<VForm>()

const snackBarStore = useSnackbarStore();
const apiRequestObj = useApi()

const customer = toRef(props, 'customer')

const name = ref('')
const phoneNumber = ref('')
const address = ref('')
const province = ref('')
const city = ref('')
const code = ref('')
const provinces = ref([]);
const cities = ref([]);
const selectedProvinceId = ref(null);
const selectedCityId = ref(null);


// Watch the customer object
watch([customer, selectedProvinceId], ([newCustomer, newProvinceId]) => {
  if (newCustomer) {
    name.value = newCustomer.name || ''
    phoneNumber.value = newCustomer.phone_number || ''
    address.value = newCustomer.address || ''
    province.value = newCustomer.province || ''
    city.value = newCustomer.city || ''
    code.value = newCustomer.code || ''
  }
  console.log('new province',newProvinceId);
  // Fetch cities when a new province is selected
  if (newProvinceId) {
    fetchCities(newProvinceId);
  }
}, { immediate: true, deep: true })

// API to get code
const getCode = async () => {
  try {
    isLoading.value = true
    const response = await apiRequestObj.makeRequest(`common/get-otp`, 'post', {
      telephone: phoneNumber.value,
    })
    if (response?.success) {
      snackBarStore.showSnackbar('Code has been sent to your phone number', 'success')
    } else {
      snackBarStore.showSnackbar(response?.message || 'Failed to send code', 'error')
    }
  } catch (error) {
    snackBarStore.showSnackbar('Something went wrong while sending the code', 'error')
  } finally {
    isLoading.value = false
  }
}

const fetchProvinces = async () => {
  try {
    const response = await apiRequestObj.makeRequest('common/provinces', 'get');
    console.log('samra');
    console.log(response.data);
    // provinces.value = response.data || [];
    provinces.value = response.data.map(province => ({
      value: province.id,
      title: province.name,
    }));

    if (provinces.value.length > 0) {
      selectedProvinceId.value = provinces.value[0]?.id; // Set default province
      fetchCities(selectedProvinceId.value); // Fetch cities for the default province
    }
  } catch (error) {
    snackBarStore.showSnackbar('Failed to load provinces', 'error');
  } 
};

const fetchCities = async (provinceId: number) => {
  try {
    const response = await apiRequestObj.makeRequest(`common/cities/${provinceId}`, 'get');
    cities.value = response.data.map(city => ({
      value: city.id,
      title: city.name,
    }));
  } catch (error) {
    snackBarStore.showSnackbar('Failed to load cities', 'error');
  } 
};

// Fetch provinces on component mount
onMounted(() => {
  fetchProvinces();
});


// API to verify OTP
const verifyCode = async () => {
  try {
    isLoading.value = true
    const response = await apiRequestObj.makeRequest(`common/verify-otp`, 'post', {
      telephone: phoneNumber.value,
      code: code.value,
    })

    if (response?.success) {
      snackBarStore.showSnackbar('Code verified successfully', 'success')
      isCodeVerified.value = true
    } else {
      snackBarStore.showSnackbar('OTP is incorrect', 'error')
      isCodeVerified.value = false
    }
  } catch (error) {
    snackBarStore.showSnackbar('Something went wrong during OTP verification', 'error')
  } finally {
    isLoading.value = false
  }
}

// Handle form submission
const onSubmit = async () => {
  const userId = ref(route.params.userId);
  if (!isCodeVerified.value) {
    snackBarStore.showSnackbar('Please verify your code first', 'error')
    return
  }

  refForm.value?.validate().then(async ({ valid }) => {
    if (valid) {
      const formData = {
        name: name.value,
        phone_number: phoneNumber.value,
        city: city.value,
        province: province.value,
        address: address.value,
        vendorId : userId.value,
        code : '112233'
      }

      try {
        isLoading.value = true
        const response = await apiRequestObj.makeRequest(`common/store`, 'post', formData)
        console.log(response);
        if (response?.success) {
          snackBarStore.showSnackbar('Customer registered successfully', 'success')
          emit('customer-updated')
          emit('update:isDrawerOpen', false)
          refForm.value?.reset()
        } else {
          snackBarStore.showSnackbar(response?.message || 'Failed to register customer', 'error')
        }
      } catch (error) {
        snackBarStore.showSnackbar('Something went wrong during registration', 'error')
      } finally {
        isLoading.value = false
      }
    }
  })
}
</script>

<template>
  <SnackBar />
  <div class="auth-wrapper d-flex align-center justify-center pa-4">
    <div class="position-relative my-sm-16">
      <!-- Shapes -->
      <VNodeRenderer :nodes="h('div', { innerHTML: authV1TopShape })" class="text-primary auth-v1-top-shape d-none d-sm-block" />
      <VNodeRenderer :nodes="h('div', { innerHTML: authV1BottomShape })" class="text-primary auth-v1-bottom-shape d-none d-sm-block" />

      <!-- Auth Card -->
      <VCard class="auth-card" max-width="460" :class="$vuetify.display.smAndUp ? 'pa-6' : 'pa-0'">
        <VCardText>
          <h4 class="text-h4 mb-1">Welcome to <span class="text-capitalize">Haier</span>! 👋🏻</h4>
          <p class="mb-0">Please review the information below to ensure it is accurate.</p>
        </VCardText>

        <!-- Form -->
        <VCardText>
          <VForm ref="refForm" v-model="isFormValid" @submit.prevent="onSubmit">
            <VRow>
              <!-- Name -->
              <VCol cols="12">
                <AppTextField v-model="name" :rules="[requiredValidator, minLengthValidator(3)]" label="Name" placeholder="Enter name" />
              </VCol>

              <!-- Address -->
              <VCol cols="12">
                <AppTextField v-model="address" :rules="[requiredValidator, minLengthValidator(10)]" label="Address" placeholder="Enter address" />
              </VCol>

              <!-- Province -->
              <VCol cols="12">
                <VSelect
                  v-model="selectedProvinceId"
                  :items="provinces"
                  item-text="title"
                  item-value="value"
                  label="Province"
                  placeholder="Select Province"
                  :rules="[requiredValidator]"
                  
                />
              </VCol>

              <!-- City -->
              <VCol cols="12">
                <VSelect
                  v-model="selectedCityId"
                  :items="cities"
                  item-text="title"
                  item-value="value"
                  label="City"
                  placeholder="Select City"
                  :rules="[requiredValidator]"
                  :disabled="!selectedProvinceId"
                />
              </VCol>

              <!-- Phone Number -->
              <VCol cols="12">
                <AppTextField
                  v-model="phoneNumber"
                  type="tel"
                  :rules="[requiredValidator, phoneValidator, minLengthValidator(10), numberValidator]"
                  label="Phone Number"
                  placeholder="+1234567890"
                  @blur="getCode"
                />
              </VCol>

              <!-- Code -->
              <VCol cols="12">
                <AppTextField
                  v-model="code"
                  :rules="[requiredValidator, minLengthValidator(6)]"
                  label="Code"
                  placeholder="Enter code"
                  @blur="verifyCode"
                />
              </VCol>

              <!-- Submit & Cancel -->
              <VCol cols="12">
                <VBtn type="submit" class="me-3">
                  <VProgressCircular v-if="isLoading" indeterminate color="white" />
                  <template v-else> Submit </template>
                </VBtn>
                <VBtn type="reset" variant="tonal" color="error" @click="refForm?.reset()">Cancel</VBtn>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </div>
  </div>
</template>

<style lang="scss">
@use '@core/scss/template/pages/page-auth';
</style>
