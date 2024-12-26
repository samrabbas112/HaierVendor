<script setup lang="ts">
import DemoDialogFullscreen from '@/components/dialogs/DemoDialogFullscreen.vue'
import { ability } from '@/plugins/casl/ability'
import { useSnackbarStore } from '@/stores/snackbar'
import { useGenerateImageVariant } from '@core/composable/useGenerateImageVariant'
import authV2LoginIllustrationBorderedDark from '@images/pages/auth-v2-login-illustration-bordered-dark.png'
import authV2LoginIllustrationBorderedLight from '@images/pages/auth-v2-login-illustration-bordered-light.png'
import authV2LoginIllustrationDark from '@images/pages/auth-v2-login-illustration-dark.png'
import authV2LoginIllustrationLight from '@images/pages/auth-v2-login-illustration-light.png'
import authV2MaskDark from '@images/pages/misc-mask-dark.png'
import authV2MaskLight from '@images/pages/misc-mask-light.png'
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { themeConfig } from '@themeConfig'
import { nextTick, ref } from 'vue'

definePageMeta({
  layout: 'blank',
  public: true,
  middleware: ['guest'],
})

const form = ref({
  email: 'lahore@haier.com',
  password: 'Haier@123',
  remember: false,
})


const toast = useToastStore()
const loader = useLoaderStore()
const snackbarStore = useSnackbarStore()
const termsStore = useTermsStore()
const isPasswordVisible = ref(false)
const authStore = useAuthStore()
const router = useRouter()
const apiRequestObj = useApi()

const authThemeImg = useGenerateImageVariant(
  authV2LoginIllustrationLight,
  authV2LoginIllustrationDark,
  authV2LoginIllustrationBorderedLight,
  authV2LoginIllustrationBorderedDark,
  true,
)

const isLoading = ref(false)

const authThemeMask = useGenerateImageVariant(authV2MaskLight, authV2MaskDark)

const submitForm = async () => {
  isLoading.value = true

  /**
   * Constructing the payload object for the login request
   *
   * - email: The user's email address from the form input.
   * - password: The user's password from the form input.
   * - termsConditions: Default value set to true, indicating the user agrees to the terms and conditions.
   * - firebase_token: Retrieves the Firebase token from localStorage if available, or an empty string if not.
   */
  const payload = {
    email: form.value.email,
    password: form.value.password,
    termsConditions: true,
    firebase_token: localStorage.getItem('firebaseToken') ?? '',
    remember_token: form.value.remember,
  }

  const response = await apiRequestObj.makeRequest(
    'common/authentication/login',
    'post',
    payload,
  )
  if (response && response.success) {
    console.log('response success', response.data)
    authStore.login({ user: response.data, token: response.data.authToken })

    const userAbilityRules = useCookie('userAbilityRules')
    if (response.data.user_type == 'vendor') {
      ability.update([
        { action: 'read', subject: 'Vendor' },
        { action: 'read', subject: 'Customer' },
        { action: 'read', subject: 'Management' },
        { action: 'read', subject: 'Order' },
        { action: 'read', subject: 'Dashboard' },
      ])
      userAbilityRules.value = JSON.stringify([
        { action: 'read', subject: 'Vendor' },
        { action: 'read', subject: 'Customer' },
        { action: 'read', subject: 'Management' },
        { action: 'read', subject: 'Order' },
        { action: 'read', subject: 'Dashboard' },
      ])
      console.log('Vendor cookie set:', userAbilityRules.value)
    }
    else if (response.data.user_type == 'haier') {
      userAbilityRules.value = JSON.stringify([
        { action: 'read', subject: 'Customer' },
        { action: 'read', subject: 'Management' },
        { action: 'read', subject: 'Dashboard' },
        { action: 'read', subject: 'Admin' },
        { action: 'read', subject: 'Order' },
      ])
      ability.update([
        { action: 'read', subject: 'Customer' },
        { action: 'read', subject: 'Management' },
        { action: 'read', subject: 'Dashboard' },
        { action: 'read', subject: 'Admin' },
        { action: 'read', subject: 'Order' },
      ])
      console.log('Vendor cookie set:', userAbilityRules.value)
    }
    snackbarStore.showSnackbar('Logged in successfully', 'success')
    await nextTick(() => {
      window.location.href = '/dashboard';
      // router.push('/dashboard')
    })
  } else if(response && response.message == 'Please Accept Terms and conditions.') {
    termsStore.showTerms();
  }
  else {
    if(response?.message){
      snackbarStore.showSnackbar(response.message, 'error')
    }
    else
    snackbarStore.showSnackbar('Incorrect Email or Password', 'error')
    console.error('Login failed')
  }
  isLoading.value = false
}
</script>

<template>
  <SnackBar />
  <a href="javascript:void(0)">
    <div class="auth-logo d-flex align-center gap-x-3">
      <VNodeRenderer :nodes="themeConfig.app.logo" />
      <h1 class="auth-title">
        {{ themeConfig.app.title }}
      </h1>
    </div>
  </a>

  <VRow
    no-gutters
    class="auth-wrapper bg-surface"
  >
    <VCol
      md="8"
      class="d-none d-md-flex"
    >
      <div class="position-relative bg-background w-100 me-0">
        <div
          class="d-flex align-center justify-center w-100 h-100"
          style="padding-inline: 6.25rem"
        >
          <VImg
            max-width="613"
            :src="authThemeImg"
            class="auth-illustration mt-16 mb-2"
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
            Welcome to
            <span class="text-capitalize"> Haier Portal </span>! 👋🏻
          </h4>
          <p class="mb-0">
            Please sign-in to your account and start the adventure
          </p>
        </VCardText>
        <VCardText>
          <VForm @submit.prevent="() => {}">
            <VRow>
              <!-- email -->
              <VCol cols="12">
                <AppTextField
                  v-model="form.email"
                  autofocus
                  label="Email or Username"
                  type="email"
                  placeholder="johndoe@email.com"
                />
              </VCol>

              <!-- password -->
              <VCol cols="12">
                <AppTextField
                  v-model="form.password"
                  label="Password"
                  placeholder="············"
                  :type="isPasswordVisible ? 'text' : 'password'"
                  :append-inner-icon="
                    isPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'
                  "
                  @click:append-inner="isPasswordVisible = !isPasswordVisible"
                />

                <div class="d-flex align-center flex-wrap justify-space-between my-6">
                  <VCheckbox
                    v-model="form.remember"
                    label="Remember me"
                  />
                  <NuxtLink
                    class="text-primary"
                    :to="{ name: 'authentication-forgot-password' }"
                  >
                    Forgot Password?
                  </NuxtLink>
                </div>

                <VBtn
                  block
                  @click="!isLoading && submitForm()"
                >
                  <VProgressCircular
                    v-if="isLoading"
                    indeterminate
                    color="white"
                  />
                  <template v-else>
                    Login
                  </template>
                </VBtn>
              </VCol>
             
              <!--
                <VCol
                cols="12"
                class="d-flex align-center"
                >
                <VDivider />
                <span class="mx-4">or</span>
                <VDivider />
                </VCol>
              -->

              <!-- create account -->
              <!--
                <VCol
                cols="12"
                class="text-body-1 text-center"
                >
                <span class="d-inline-block"> New on our platform? </span>
                <NuxtLink
                class="text-primary ms-1 d-inline-block text-body-1"
                :to="{ name: 'authentication-register' }"
                >
                Create an account
                </NuxtLink>
                </VCol>
              -->
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
  <DemoDialogFullscreen :userEmail="form.email" :password="form.password" :remember="true"/>
</template>

<style lang="scss">
@use "@core/scss/template/pages/page-auth.scss";
</style>
