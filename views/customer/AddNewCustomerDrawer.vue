<script setup lang="ts">
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'

import type { VForm } from 'vuetify/components/VForm'
import { useSnackbarStore } from '@/stores/snackbar'


interface Emit {
  (e: 'update:isDrawerOpen', value: boolean): void;
}

interface Props {
  isDrawerOpen: boolean;
  customer: Record<string, any>;
}

const snackbarStore = useSnackbarStore();
const props = defineProps<Props>();
const emit = defineEmits<Emit>();
const customer = toRef(props, 'customer');

const isFormValid = ref(false);
const refForm = ref<VForm>();
const name = ref('');
const phoneNumber = ref('');
const address = ref('');
const province = ref('');
const city = ref('');
const code = ref('');
const customerNote = ref('');
const apiRequestObj = useApi();

watch(customer, (newCustomer) => {
  if (newCustomer) {
    name.value = newCustomer.name || '';
    phoneNumber.value = newCustomer.phone_number || '';
    address.value = newCustomer.address || '';
    customerNote.value = newCustomer.customer_note || '';
    province.value = newCustomer.province || '';
    city.value = newCustomer.city || '';
    code.value = newCustomer.code || '';
  }
}, { immediate: true, deep: true });

// 👉 Drawer close
const closeNavigationDrawer = () => {
  emit('update:isDrawerOpen', false);
  nextTick(() => {
    refForm.value?.reset();
    refForm.value?.resetValidation();
  });
};

const onSubmit = async () => {
  refForm.value?.validate().then(async ({ valid }) => {
    if (valid) {
      const formData = {
        name: name.value,
        phone_number: phoneNumber.value,
        customer_note: customerNote.value,
        city: city.value,
        code: code.value,
        province: province.value,
        address: address.value,
      };

      try {
        let response;
        if (props.customer?.id) {
          response = await apiRequestObj.makeRequest(
            `common/customer/update/${props.customer.uid}`,
            'put',
            formData
          );
        } else {
          response = await apiRequestObj.makeRequest(
            'common/customer/store',
            'post',
            formData
          );
        }

        if (response?.success) {
          emit('customer-updated');
          emit('update:isDrawerOpen', false);

          nextTick(() => {
            refForm.value?.reset();
            refForm.value?.resetValidation();
          });
        } else {
          alert(`Error: ${response?.message || 'Unknown error'}`);
        }
      } catch (error) {
        alert('Failed to save customer data. Please try again later.');
      }
    }
  });
};

const handleDrawerModelValueUpdate = (val: boolean) => {
  emit('update:isDrawerOpen', val);
};
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
      title="Add New Customer"
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
                  :rules="[requiredValidator]"
                  label="Name"
                  placeholder="Enter name"
                />
              </VCol>

              <!-- 👉 Phone Number -->
              <VCol cols="12">
                <AppTextField
                  v-model="phoneNumber"
                  type="tel"
                  :rules="[requiredValidator]"
                  label="Phone Number"
                  placeholder="+1234567890"
                />
              </VCol>

              <!-- 👉 Address -->
              <VCol cols="12">
                <AppTextField
                  v-model="address"
                  :rules="[requiredValidator]"
                  label="Address"
                  placeholder="Enter address"
                />
              </VCol>

              <!-- 👉 Province -->
              <VCol cols="12">
                <AppTextField
                  v-model="province"
                  :rules="[requiredValidator]"
                  label="Province"
                  placeholder="Enter province"
                />
              </VCol>

              <!-- 👉 City -->
              <VCol cols="12">
                <AppTextField
                  v-model="city"
                  :rules="[requiredValidator]"
                  label="City"
                  placeholder="Enter city"
                />
              </VCol>

              <!-- 👉 Code -->
              <VCol cols="12">
                <AppTextField
                  v-model="code"
                  type="text"
                  :rules="[requiredValidator]"
                  label="Code"
                  placeholder="Enter code"
                />
              </VCol>

              <!-- 👉 Customer Note -->
              <VCol cols="12">
                <AppTextField
                  v-model="customerNote"
                  label="Customer Note"
                  placeholder="Enter note"
                  multiline
                />
              </VCol>

              <!-- 👉 Submit and Cancel -->
              <VCol cols="12">
                <VBtn
                  type="submit"
                  class="me-3"
                >
                  Submit
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
