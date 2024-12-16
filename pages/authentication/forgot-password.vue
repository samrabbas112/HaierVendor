<script setup lang="ts">
import { useSnackbarStore } from '@/stores/snackbar'
import { useGenerateImageVariant } from '@core/composable/useGenerateImageVariant'
import authV2ForgotPasswordIllustrationDark from '@images/pages/auth-v2-forgot-password-illustration-dark.png'
import authV2ForgotPasswordIllustrationLight from '@images/pages/auth-v2-forgot-password-illustration-light.png'
import authV2MaskDark from '@images/pages/misc-mask-dark.png'
import authV2MaskLight from '@images/pages/misc-mask-light.png'
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { themeConfig } from '@themeConfig'

definePageMeta({
  layout: 'blank',
  public: true,
})

const form = ref({
  telephone: '',
  code: '',
  password: '',
  password_confirmation: '',
  is_otp_verified: false,
})

const snackbarStore = useSnackbarStore()
const isPasswordVisible = ref(false)
const isConfirmPasswordVisible = ref(false)
const formRef = ref()
const isOtpInserted = ref(false)
const isCodeSent = ref(false)
const totalSeconds = 60 // 1 minute
const secondsRemaining = ref(totalSeconds)
const progressValue = ref(100)
const isCountdownActive = ref(false)
const isLoading = ref(false)
const router = useRouter()

const apiRequestObj = useApi()

const authThemeImg = useGenerateImageVariant(
  authV2ForgotPasswordIllustrationLight,
  authV2ForgotPasswordIllustrationDark,
)

const authThemeMask = useGenerateImageVariant(authV2MaskLight, authV2MaskDark)

const onFinish = () => {
  isOtpInserted.value = true
  console.log('otp entered')

  // setTimeout(() => {
  //   isOtpInserted.value = false
  //   router.push('/')
  // }, 2000)
}

const onSubmit = async () => {
  console.log('payload', form?.value)

  const validated = await formRef.value.validate()

  isLoading.value = true
  if (validated.valid === true) {
    try {
      const response = await apiRequestObj.makeRequest(
        'common/authentication/password/forget',
        'post',
        form?.value,
      )

      if (response && response.success) {
        snackbarStore.showSnackbar(
          'Password has been changed successfully',
          'success',
        )
        await router.push('/login')
      }
      else {
        snackbarStore.showSnackbar('An error occurred. Please try again.', 'error')
      }
    }
    catch (error) {
      snackbarStore.showSnackbar('An error occurred. Please try again.', 'error')
    }
    finally {
      isLoading.value = false
    }
  }
  else {
    isLoading.value = false
  }
}

const startCountdown = () => {
  isCountdownActive.value = true

  const interval = setInterval(() => {
    if (secondsRemaining.value > 0) {
      secondsRemaining.value -= 1
      progressValue.value = (secondsRemaining.value / totalSeconds) * 100
    }
    else {
      clearInterval(interval) // Stop when time is up
      isCountdownActive.value = false
      secondsRemaining.value = totalSeconds // Reset for next use
      progressValue.value = 100
    }
  }, 1000) // Update every second
}

const getCode = async () => {
  try {
    isLoading.value = true
    console.log('getCode function invoked')

    if (phoneValidator(form?.value?.telephone)) {
      const response = await apiRequestObj.makeRequest(
        'common/authentication/get-code',
        'post',
        form?.value,
      )

      if (response?.success) {
        if (response?.data?.status !== 'error') {
          isCodeSent.value = true

          snackbarStore.showSnackbar(
            response?.message,
            'success',
          )
          startCountdown()
        }
        else if (response?.data?.status == 'error') {
          snackbarStore.showSnackbar(
            response?.data?.message,
            'error',
          )
        }
      }
      else {
        snackbarStore.showSnackbar(
          response?.message || 'Failed to get OTP',
          'error',
        )
      }
    }
    else {
      snackbarStore.showSnackbar('Please enter a valid phone number', 'error')
    }
  }
  catch (error) {
    snackbarStore.showSnackbar('An error occurred. Please try again.', 'error')
  }
  finally {
    isLoading.value = false
  }
}

const verifyCode = async () => {
  isLoading.value = true
  if (form.value.code.length === 6) {
    const response = await apiRequestObj.makeRequest('common/authentication/verify-code', 'post', form?.value)
    if (response && response.success) {
      form.value.is_otp_verified = true
      snackbarStore.showSnackbar('Code verified', 'success')
    }
  }
  else {
    snackbarStore.showSnackbar('Invalid/Expired Code', 'error')
  }
  isLoading.value = false
}
</script>

<template>
  <SnackBar />
  <NuxtLink to="/">
    <div class="auth-logo d-flex align-center gap-x-3">
      <VNodeRenderer :nodes="themeConfig.app.logo" />
      <h1 class="auth-title">
        {{ themeConfig.app.title }}
      </h1>
    </div>
  </NuxtLink>

  <VRow
    class="auth-wrapper bg-surface"
    no-gutters
  >
    <VCol
      md="8"
      class="d-none d-md-flex"
    >
      <div class="position-relative bg-background w-100 me-0">
        <div
          class="d-flex align-center justify-center w-100 h-100"
          style="padding-inline: 150px"
        >
          <VImg
            max-width="468"
            :src="authThemeImg"
            class="auth-illustration mt-16 mb-2 flip-in-rtl"
          />
        </div>

        <img
          class="auth-footer-mask flip-in-rtl"
          :src="authThemeMask"
          alt="auth-footer-mask"
          height="280"
          width="100"
        >
      </div>
    </VCol>

    <VCol
      cols="12"
      md="4"
      class="auth-card-v2 d-flex align-center justify-center"
    >
      <VCard
        flat
        :max-width="500"
        class="mt-12 mt-sm-0 pa-6"
      >
        <VCardText>
          <h4 class="text-h4 mb-1">
            Forgot Password? 🔒
          </h4>
          <p class="mb-0">
            Enter your phone number and we'll send you code to reset your
            password
          </p>
        </VCardText>

        <VCardText>
          <VForm
            ref="formRef"
            lazy-validation
          >
            <VRow>
              <!-- phone number -->
              <VCol cols="12">
                <AppTextField
                  v-model="form.telephone"
                  :rules="[phoneValidator, requiredValidator]"
                  label="Phone Number*"
                  placeholder="03XXXXXXXXX"
                  required
                  type="text"
                  :disabled="form.is_otp_verified"
                />
              </VCol>
              <!-- otp -->
              <VCol
                v-if="isCodeSent"
                cols="12"
              >
                <div class="d-flex align-center flex-wrap justify-space-between">
                  <h6 class="text-body-1">
                    Type your 6 digit security code
                  </h6>
                  <h6
                    v-if="!form.is_otp_verified"
                    :class="{
                      'text-body-1 fw-lighter cursor-wait': isCountdownActive,
                      'text-body-1 text-decoration-underline text-primary cursor-pointer':
                        !isCountdownActive,
                    }"
                    @click="!isCountdownActive && getCode()"
                  >
                    Resend Code
                    <VProgressCircular
                      v-if="isCountdownActive"
                      :rotate="-90"
                      :size="35"
                      :width="4"
                      :model-value="progressValue"
                      color="primary"
                    >
                      {{ secondsRemaining }}
                    </VProgressCircular>
                  </h6>
                </div>
                <VOtpInput
                  v-model="form.code"
                  :disabled="form.is_otp_verified"
                  type="number"
                  class="pa-0"
                />
                <!-- @finish="onFinish" -->
              </VCol>
              <!-- new password -->
              <VCol
                v-if="form?.is_otp_verified"
                cols="12"
              >
                <AppTextField
                  v-model="form.password"
                  label="Password"
                  placeholder="············"
                  :type="isPasswordVisible ? 'text' : 'password'"
                  :append-inner-icon="isPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'
                  "
                  :rules="[requiredValidator, passwordValidator]"
                  @click:append-inner="isPasswordVisible = !isPasswordVisible"
                />
              </VCol>
              <!-- confirm password -->
              <VCol
                v-if="form?.is_otp_verified"
                cols="12"
              >
                <AppTextField
                  v-model="form.password_confirmation"
                  label="Confirm Password"
                  :type="isConfirmPasswordVisible ? 'text' : 'password'"
                  placeholder="Confirm Password"
                  :append-inner-icon="isConfirmPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'
                  "
                  :rules="[
                    requiredValidator,
                    confirmedValidator(
                      form.password_confirmation,
                      form.password,
                    ),
                  ]"
                  autocomplete="on"
                  @click:append-inner="
                    isConfirmPasswordVisible = !isConfirmPasswordVisible
                  "
                />
              </VCol>

              <!-- Reset link -->
              <VCol cols="12">
                <VBtn
                  block
                  @click="
                    isCodeSent
                      ? form.is_otp_verified
                        ? onSubmit()
                        : verifyCode()
                      : getCode()
                  "
                >
                  <VProgressCircular
                    v-if="isLoading"
                    indeterminate
                    color="white"
                  />
                  <template v-else>
                    {{
                      isCodeSent
                        ? form.is_otp_verified
                          ? "Reset Password"
                          : "Verify Code"
                        : "Get Code"
                    }}
                  </template>
                </VBtn>
              </VCol>

              <!-- back to login -->
              <VCol cols="12">
                <NuxtLink
                  class="d-flex align-center justify-center"
                  :to="{ name: 'login' }"
                >
                  <VIcon
                    icon="tabler-chevron-left"
                    size="20"
                    class="me-1 flip-in-rtl"
                  />
                  <span>Back to login</span>
                </NuxtLink>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>

<style lang="scss">
@use "@core/scss/template/pages/page-auth";
</style>
