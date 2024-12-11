<script setup lang="ts">
import AuthProvider from '@/views/pages/authentication/AuthProvider.vue'
import authV1BottomShape from '@images/svg/auth-v1-bottom-shape.svg?raw'
import authV1TopShape from '@images/svg/auth-v1-top-shape.svg?raw'
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { themeConfig } from '@themeConfig'

definePageMeta({
  layout: 'blank',
  public: true,

})

const form = ref({
  name: 'Muhammad Ahmad',
  address: 'House # 4',
  province: 'Punjab',
  city: 'Lahore',
  phone: '03XXXXXXXXX',
})

const formRef = ref()
const isLoading = ref()

const handleSubmit = async () => {
  const validated = await formRef.value.validate()
  if(validated.valid){
    isLoading.value =  true;
    console.log("form submitted")
    isLoading.value =  false;
  }
}

const handleDecline = () => {
  console.log("request decline")
}
</script>

<template>
  <div class="auth-wrapper d-flex align-center justify-center pa-4">
    <div class="position-relative my-sm-16">
      <!-- 👉 Top shape -->
      <VNodeRenderer
        :nodes="h('div', { innerHTML: authV1TopShape })"
        class="text-primary auth-v1-top-shape d-none d-sm-block"
      />

      <!-- 👉 Bottom shape -->
      <VNodeRenderer
        :nodes="h('div', { innerHTML: authV1BottomShape })"
        class="text-primary auth-v1-bottom-shape d-none d-sm-block"
      />

      <!-- 👉 Auth Card -->
      <VCard
        class="auth-card"
        max-width="460"
        :class="$vuetify.display.smAndUp ? 'pa-6' : 'pa-0'"
      >
        <!--
          <VCardItem class="justify-center">
          <VCardTitle>
          <div class="app-logo">
          <VNodeRenderer :nodes="themeConfig.app.logo" />
          <h1 class="app-logo-title">
          {{ themeConfig.app.title }}
          </h1>
          </div>
          </VCardTitle>
          </VCardItem>
        -->

        <VCardText>
          <h4 class="text-h4 mb-1">
            Welcome to <span class="text-capitalize">Haier</span>! 👋🏻
          </h4>
          <p class="mb-0">
            Thank you for joining the Haier family! Please review the information below to ensure it is accurate.
          </p>
        </VCardText>

        <VCardText>
          <VForm
            ref="formRef"
            @submit.prevent="() => { handleSubmit() }"
          >
            <VRow>
              <!-- full name -->
              <VCol cols="12">
                <AppTextField
                  v-model="form.name"
                  autofocus
                  label="Name:"
                  type="text"
                  placeholder="Muhammad Ahmad"
                  :rules="[requiredValidator]"
                />
              </VCol>

              <!-- address -->
              <VCol cols="12">
                <AppTextField
                  v-model="form.address"
                  label="Address:"
                  placeholder="chak 45"
                  type="text"
                  :rules="[requiredValidator]"
                />
              </VCol>
              <!-- province -->
              <VCol cols="12">
                <AppTextField
                  v-model="form.province"
                  label="Province:"
                  placeholder="chak 45"
                  type="text"
                  :rules="[requiredValidator]"
                />
              </VCol>
              <!-- city -->
              <VCol cols="12">
                <AppTextField
                  v-model="form.city"
                  label="City:"
                  placeholder="Lahore"
                  type="text"
                  :rules="[requiredValidator]"
                />
              </VCol>
              <!-- Phone -->
              <VCol cols="12">
                <AppTextField
                  v-model="form.phone"
                  label="Phone:"
                  placeholder="03XXXXXXXXX"
                  type="text"
                  :rules="[requiredValidator, phoneValidator]"
                />

                <!-- remember me checkbox -->
                <div class="d-flex align-center flex-wrap mt-6">
                  <!--
                    <NuxtLink
                    class="text-primary"
                    :to="{ name: 'pages-authentication-forgot-password-v1' }"
                    >
                    Forgot Password?
                    </NuxtLink>
                  -->
                  <!-- login button -->
                  <VBtn
                    class="flex-grow-1 mr-2"
                    type="submit"
                    color="success"
                  >
                  <VProgressCircular
                    v-if="isLoading"
                    indeterminate
                    color="white"
                  />
                  <template v-else>
                    Confirm
                  </template>
                  </VBtn>
                  <!-- decline -->
                  <VBtn
                    class="flex-grow-1"
                    color="error"
                    @click="handleDecline"
                  >
                    Decline
                  </VBtn>
                </div>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </div>
  </div>
</template>

<style lang="scss">
@use "@core/scss/template/pages/page-auth";
</style>
