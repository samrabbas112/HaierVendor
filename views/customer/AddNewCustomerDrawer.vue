<script setup lang="ts">
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'

import type { VForm } from 'vuetify/components/VForm'
import { useSnackbarStore } from '@/stores/snackbar'

interface Emit {
  (e: 'update:isDrawerOpen', value: boolean): void
}

interface Props {
  isDrawerOpen: boolean
  customer: Record<string, any>
}

const props = defineProps<Props>()
const emit = defineEmits<Emit>()
const snackBarStore = useSnackbarStore()
const customer = toRef(props, 'customer')

const isFormValid = ref(false)
const refForm = ref<VForm>()
const name = ref('')
const phoneNumber = ref('')
const address = ref('')
const province = ref('')
const city = ref('')
const apiRequestObj = useApi()
const isLoading = ref(false)
const selectedProvinceId = ref<number | undefined>(undefined)
const selectedCityId = ref<number | undefined>(undefined)

watch(
  customer,
  newCustomer => {
    if (newCustomer) {
      name.value = newCustomer.name || ''
      phoneNumber.value = newCustomer.phone_number || ''
      address.value = newCustomer.address || ''
      province.value = newCustomer.province || ''
      city.value = newCustomer.city || ''
      selectedProvinceId.value = newCustomer.provinceId
      selectedCityId.value = newCustomer.cityId
    }
  },
  { immediate: true, deep: true },
)

// 👉 Drawer close
const closeNavigationDrawer = () => {
  emit('update:isDrawerOpen', false)
  refForm.value?.reset()
  refForm.value?.resetValidation()
}

const onSubmit = async () => {
  if (isLoading.value)
    return
  refForm.value?.validate().then(async ({ valid }) => {
    if (valid) {
      const formData = {
        id: props.customer?.id ?? null,
        name: name.value,
        phone_number: phoneNumber.value,
        city: selectedCityId.value,
        province: selectedProvinceId.value,
        address: address.value,
      }

      try {
        isLoading.value = true
        let response
        if (props.customer?.id) {
          response = await apiRequestObj.makeRequest(
            `common/customer/update/${props.customer.uid}`,
            'put',
            formData,
          )
        }
        else {
          response = await apiRequestObj.makeRequest(
            'common/customer/store',
            'post',
            formData,
          )
        }
        if (response?.success) {
          emit('customer-updated')
          emit('update:isDrawerOpen', false)
          if (props.customer?.id) {
            snackBarStore.showSnackbar(
              'Customer Updated Successfully.',
              'success',
            )
          }
          else {
            snackBarStore.showSnackbar(
              'Customer Created Successfully.',
              'success',
            )
          }

          nextTick(() => {
            refForm.value?.reset()
            refForm.value?.resetValidation()
          })
        }
        else {
          const messages = response?.message
          let allErrors = []

          // Check if the message array exists
          if (Array.isArray(messages)) {
            allErrors = messages
              .map(msg => msg?.errors)
              .filter(error => error) // Extract 'errors' field
          }

          // Join all errors into a single string
          const errorMessage
            = allErrors.length > 0 ? allErrors.join('\n') : 'Unknown Error'

          // Show snackbar with all errors
          // snackBarStore.showSnackbar(errorMessage, "error");
          snackBarStore.showSnackbar(allErrors.length > 0 ? 'User already registered.' : errorMessage, 'error')
        }
      }
      catch (error) {
        snackBarStore.showSnackbar('Something went wrong', 'error')
      }
      finally {
        isLoading.value = false
      }
    }
  })
}

const handleDrawerModelValueUpdate = (val: boolean) => {
  emit('update:isDrawerOpen', val)
  refForm.value?.reset()
  refForm.value?.resetValidation()
}

watch(address, newValue => {
  if (newValue)
    address.value = newValue.trimStart()
})
</script>

<template>
  <VNavigationDrawer
    temporary
    :width="400"
    location="end"
    class="scrollable-content"
    :model-value="props.isDrawerOpen"
    @update:model-value="handleDrawerModelValueUpdate"
  >
    <!-- 👉 Title -->
    <AppDrawerHeaderSection
      :title="props.customer?.id ? 'Edit Customer' : 'Add New Customer'"
      @cancel="closeNavigationDrawer"
    />

    <VDivider />

    <PerfectScrollbar :options="{ wheelPropagation: false }">
      <VCard flat>
        <VCardText>
          <!-- 👉 Form -->
          <VForm
            ref="refForm"
            v-model="isFormValid"
            @submit.prevent="onSubmit"
          >
            <VRow>
              <!-- 👉 Name -->
              <VCol cols="12">
                <AppTextField
                  v-model="name"
                  :rules="[
                    requiredValidator,
                    alphabetValidator,
                    minLengthValidator(3),
                  ]"
                  label="Name"
                  placeholder="Enter name"
                />
              </VCol>

              <!-- 👉 Phone Number -->
              <VCol cols="12">
                <AppTextField
                  v-model="phoneNumber"
                  type="tel"
                  :rules="[
                    requiredValidator,
                    phoneValidator,
                    minLengthValidator(10),
                    numberValidator,
                  ]"
                  label="Phone Number"
                  placeholder="03xxxxxxxxx"
                />
              </VCol>

              <!-- 👉 Address -->
              <VCol cols="12">
                <AppTextField
                  v-model="address"
                  :rules="[requiredValidator, minLengthValidator(10)]"
                  label="Address"
                  placeholder="Enter address"
                />
              </VCol>

              <ProvinceCitySelector
                v-model:selectedProvinceId="selectedProvinceId"
                v-model:selectedCityId="selectedCityId"
                :add-class="true"
              />

              <!-- 👉 Submit and Cancel -->
              <VCol cols="12">
                <VBtn
                  type="submit"
                  class="me-3"
                >
                  <VProgressCircular
                    v-if="isLoading"
                    indeterminate
                    color="white"
                  />
                  <template v-else>
                    Submit
                  </template>
                </VBtn>
                <VBtn
                  type="reset"
                  variant="tonal"
                  color="error"
                  @click="closeNavigationDrawer"
                >
                  Cancel
                </VBtn>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </PerfectScrollbar>
  </VNavigationDrawer>
</template>
