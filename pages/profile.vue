<script lang="ts" setup>
import QrCodeGenerator from '@/components/QrCodeGenerator.vue';
import { useSnackbarStore } from "@/stores/snackbar";
import { ref } from 'vue';
import type { VForm } from 'vuetify/components/VForm';
const loaderStore = useLoaderStore();
const snackbarStore = useSnackbarStore();
const authStore = useAuthStore();
console.log('authStore', authStore);
const userId = authStore.user?.uid || 'default';
const qrCodeUrl = `${useRuntimeConfig().public.qrURL}/management/customers/${userId}`;

const router = useRouter()
const requiredValidator = (value: string) => !!value || 'This field is required';
const trimPassword =  (value: string) => value.trim().length > 0 || 'This field is required';
const passwordConfirmationRule = (value: string) => (v: string) => {
  if (!v) return 'Confirm password is required';
  if (v !== value) return 'Password must match';
  return true;
};
const isCurrentPasswordVisible = ref(false);
const isNewPasswordVisible = ref(false);
const isConfirmPasswordVisible = ref(false);

const refForm = ref<VForm>();
const form = ref({
  current_password: '',
  new_password: '',
  confirm_new_password: '',
});

const isFormValid = ref(false);

watch(() => form.value.current_password, () => {
  if (form.value.current_password) {
    form.value.current_password = form.value.current_password.trimStart();
  }
}, { deep: true });

watch(() => form.value.new_password, () => {
  if (form.value.new_password) {
    form.value.new_password = form.value.new_password.trimStart();
  }
}, { deep: true });

watch(() => form.value.confirm_new_password, () => {
  if (form.value.confirm_new_password) {
    form.value.confirm_new_password = form.value.confirm_new_password.trimStart();
  }
}, { deep: true });



const updatePassword = async () => {
  // Validate the form
  const formRef = refForm.value;
  if (!formRef) return;

  const { valid } = await formRef.validate();
  if (!valid) {
    return;
  }


  try {
    loaderStore.showLoader()
    const payload = { ...form.value };
    const response = await useApi().makeRequest(
      'common/password/reset',
      'post',
      payload
    );
    if (response?.success) {
      snackbarStore.showSnackbar("Password updated successfully.", 'success');
      formRef.reset();
      formRef.resetValidation();
      authStore.logout();
      await router.push("/login");
    } else {
      snackbarStore.showSnackbar(response?.message || "An unknown error occurred.", 'error');
    }
  } catch (error) {
    // Handle exceptions
    console.error("Error updating password:", error);
    snackbarStore.showSnackbar("Failed to update password. Please try again later.", 'error');
  } finally {
    loaderStore.hideLoader()
  }
};

</script>

<template>
  <SnackBar />
  <section>
    <VCard>
      <VCardTitle>
        Profile
      </VCardTitle>

      <VCardText>
        <!-- Form -->
        <VForm ref="refForm" v-model="isFormValid" @submit.prevent="updatePassword">
          <VRow>
            <VCol cols="8" sm="8">
              <!-- Left side: Form Fields -->
              <VCol cols="12" sm="6">
                <!-- Current Password -->
                <AppTextField v-model="form.current_password" :rules="[requiredValidator,trimPassword]" label="Current Password"
                  placeholder="Enter your current password" maxlength="50"
                  :type="isCurrentPasswordVisible ? 'text' : 'password'"
                  :append-inner-icon="isCurrentPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'" autocomplete="on"
                  @click:append-inner="isCurrentPasswordVisible = !isCurrentPasswordVisible" />
              </VCol>

              <!-- New Password -->
              <VCol cols="12" sm="6">
                <AppTextField v-model="form.new_password" :rules="[requiredValidator, passwordValidator,trimPassword]"
                  label="New Password" placeholder="Enter your new password"
                  :type="isNewPasswordVisible ? 'text' : 'password'"
                  :append-inner-icon="isNewPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'" autocomplete="on"
                  @click:append-inner="isNewPasswordVisible = !isNewPasswordVisible" />
              </VCol>

              <!-- Confirm New Password -->
              <VCol cols="12" sm="6">
                <AppTextField v-model="form.confirm_new_password"
                  :rules="[requiredValidator,trimPassword, passwordConfirmationRule(form.new_password)]" label="Confirm New Password"
                  placeholder="Confirm your new password" :type="isConfirmPasswordVisible ? 'text' : 'password'"
                  :append-inner-icon="isConfirmPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'" autocomplete="on"
                  @click:append-inner="isConfirmPasswordVisible = !isConfirmPasswordVisible" />
              </VCol>
            </VCol>


            <!-- Right side: QR Code Generator -->
            <VCol cols="4" sm="4">
              <QrCodeGenerator
              :url="qrCodeUrl" />
            </VCol>
          </VRow>

          <!-- Actions (Submit and Reset buttons) -->
          <VRow>
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
