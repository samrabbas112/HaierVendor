<script lang="ts" setup>
import { ref } from 'vue';
import { useSnackbarStore } from '@/stores/snackbar';
import type { VForm } from 'vuetify/components/VForm';

const snackbarStore = useSnackbarStore();
const requiredValidator = (value: string) => !!value || 'This field is required';

const passwordConfirmationRule = (value: string) => (v: string) => {
  if (!v) return 'Confirm password is required';
  if (v !== value) return 'Password must match';
  return true;
};
const showCurrentPassword = ref(false);
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);


const refForm = ref<VForm>();
const form = ref({
  current_password: '',
  new_password: '',
  confirm_new_password: '',
});

const isFormValid = ref(false);

const updatePassword = async () => {
    // Validate the form
    const formRef = refForm.value;
    if (!formRef) return;

    const { valid } = await formRef.validate();
    if (!valid) {
        snackbarStore.showSnackbar("Please fix the validation errors.", 'error');
        return;
    }


    try {
        const payload = { ...form.value };
        console.log(payload);
        const response = await useApi().makeRequest(
            'common/password/update',
            'post',
            payload
        );

        if (response?.success) {
            console.log('samra');
            console.log(response);
            snackbarStore.showSnackbar("Password updated successfully.", 'success');
            formRef.reset();
            formRef.resetValidation();
        } else {
            snackbarStore.showSnackbar(response?.message || "An unknown error occurred.", 'error');
        }
    } catch (error) {
        // Handle exceptions
        console.error("Error updating password:", error);
        snackbarStore.showSnackbar("Failed to update password. Please try again later.", 'error');
    } finally {
        // Reset loading state
    }
};

</script>
<template>
    <section>
      <VCard>
        <VCardTitle>
          Profile
        </VCardTitle>
        <VCardText>
          <!-- Form -->
          <VForm ref="refForm" v-model="isFormValid" @submit.prevent="updatePassword">
            <VRow>
              <!-- Current Password -->
              <VCol cols="12" sm="6">
                <AppTextField 
                  v-model="form.current_password" 
                  :rules="[requiredValidator]" 
                  label="Current Password" 
                  placeholder="Enter your current password" 
                  maxlength="50" 
                  type="password"
                />
                <VIcon 
                :name="showCurrentPassword ? 'mdi-eye' : 'mdi-eye-off'" 
                @click="showCurrentPassword = !showCurrentPassword" 
                class="password-eye-icon"
              />
              </VCol>
  
              <!-- New Password -->
              <VCol cols="12" sm="6">
                <AppTextField 
                  v-model="form.new_password" 
                  :rules="[requiredValidator]" 
                  label="New Password" 
                  placeholder="Enter your new password" 
                  type="password"
                />
                <VIcon 
                :name="showNewPassword ? 'mdi-eye' : 'mdi-eye-off'" 
                @click="showNewPassword = !showNewPassword" 
                class="password-eye-icon"
              />
               
              </VCol>
  
              <!-- Confirm New Password -->
              <VCol cols="12" sm="6">
                <AppTextField 
                  v-model="form.confirm_new_password" 
                  :rules="[requiredValidator, passwordConfirmationRule(form.new_password)]"
                  label="Confirm New Password" 
                  type="password" 
                  placeholder="Confirm your new password" 
                />
                <VIcon 
                :name="showConfirmPassword ? 'mdi-eye' : 'mdi-eye-off'" 
                @click="showConfirmPassword = !showConfirmPassword" 
                class="password-eye-icon"
              />
              </VCol>
            </VRow>
  
            <!-- Actions -->
            <VRow justify="end" class="mt-6">
              <VCol cols="12" sm="3">
                <VBtn color="primary" type="submit">
                  Submit
                </VBtn>
                <VBtn class="ml-2" variant="tonal" color="error" type="reset" @click="resetForm">
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

 .password-eye-icon {
  cursor: pointer;
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
}
  </style>  
