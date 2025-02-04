<script lang="ts" setup>
import { useSnackbarStore } from '@/stores/snackbar';
import { useTermsStore } from '@/stores/terms';
import { defineProps, ref, nextTick } from 'vue';
import { ability } from '@/plugins/casl/ability';
import { useAuthStore } from '@/stores/auth';
import { useRoute } from 'vue-router';

const authStore = useAuthStore();
const isLoading = ref(false)


// Stores and props
const termsStore = useTermsStore();
const snackbarStore = useSnackbarStore();
const apiRequestObj = useApi();

const props = defineProps({
  userEmail: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  remember: {
    type: Boolean,
    required: true
  },
 
});


// Get the current route
const route = useRoute();

// Check if the current route's name or path matches 'dashboard'
const isLoginRoute = computed(() => route.name === 'login' || route.path === '/login');


// Reactive state
const acceptTerm = ref(false);

// Handle submit
const handleSubmit = async () => {
  isLoading.value = true
  try {
    // Step 1: Check if terms are accepted
    if (!acceptTerm.value) {
      snackbarStore.showSnackbar('Please accept the terms and conditions.', 'error');
      return;
    }

    const termsPayload = {
      accepted: acceptTerm.value, // Send the actual value
      email: props.userEmail,
    };

    // Step 2: Send API request for terms acceptance
    const termsResponse = await apiRequestObj.makeRequest(
      'common/authentication/terms',
      'post',
      termsPayload
    );

    if (!termsResponse || !termsResponse.success) {
      snackbarStore.showSnackbar(
        termsResponse?.message || 'Failed to accept terms.',
        'error'
      );
      console.error('API Response Error:', termsResponse);
      return;
    } 
    else if (termsResponse?.code === 401 || termsResponse?.message === "Unauthenticated.") {
      snackbarStore.showSnackbar("Login session expired", "error");

    }


    // Step 3: Send login request after terms are accepted
    const loginPayload = {
      email: props.userEmail,
      password: props.password,
      termsConditions: true,
      firebase_token: localStorage.getItem('firebaseToken') ?? '',
      remember_token: props.remember,
    };

    const loginResponse = await apiRequestObj.makeRequest(
      'common/authentication/login',
      'post',
      loginPayload
    );

    if (loginResponse && loginResponse.success) {
    console.log('response success', loginResponse.data)
    authStore.login({ user: loginResponse.data, token: loginResponse.data.authToken })

    const userAbilityRules = useCookie('userAbilityRules')
    if (loginResponse.data.user_type == 'vendor') {
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
    else if (loginResponse.data.user_type == 'haier') {
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
  } else if (loginResponse?.code === 401 || loginResponse?.message === "Unauthenticated.") {
      snackbarStore.showSnackbar("Login session expired", "error");

    } else {
      snackbarStore.showSnackbar(
        loginResponse?.message || 'Incorrect Email or Password',
        'error'
      );
      console.error('Login failed');
    }
  } catch (error) {
    // Log and notify error
    snackbarStore.showSnackbar(
      'An error occurred. Please try again.',
      'error'
    );
    console.error('Handle Submit Error:', error);
  }
  isLoading.value = false
};

</script>



<template>
  <SnackBar />
  <VDialog v-model="termsStore.isVisible" fullscreen :scrim="false" transition="dialog-bottom-transition">

    <!-- Dialog Content -->
    <VCard>
      <!-- Toolbar -->
      <VToolbar color="primary">
        <VBtn icon variant="plain" @click="termsStore.hideTerms()">
          <VIcon color="white" icon="tabler-x" />
        </VBtn>

        <VToolbarTitle>Terms & Conditions for the Online Dealers</VToolbarTitle>

        <VSpacer />

        
      </VToolbar>

      <!-- Terms Content -->
      <div class="terms-content">
        <p class="note">
          <strong>Note:</strong> Please read the instruction carefully
        </p>
        <ul>
          <li>Maintain a minimum inventory of maximum models.</li>
          <li>Ensure quality assurance of their stock.</li>
          <li>After picking the order, the dealer is bound to deliver the stock.</li>
          <li>Cancellation of an order requires a proper reason.</li>
          <li>
            The dealer will manage the shipping delivery cost included in the
            on-screen pricing or on the orders that have been placed.
          </li>
          <li>
            For registration on the Haier online website, individual shops will
            be registered as dealers.
          </li>
          <li>
            The dealer will be responsible in case of damaged items if delivery
            is done by the dealer.
          </li>
          <li>
            Damaged products will be dealt with according to Haier’s SOP; for
            instance, if the packing is damaged.
          </li>
          <li>
            2% charges of the total order amount will be deducted in prepaid
            orders.
          </li>
          <li>
            All onboarded dealers are required to conduct social media marketing
            from their social media pages, and Haier may also support them in providing of the material and a percentage of the budget time to time or as decided which will be adjusted in their ledgers.
          </li>
          <li>
            The Haier ECommerce representative will inform the dealers about the campaign dates, budget, when to start the campaigns, and all other relevant details.
          </li>
          <li>
            After the campaign ends, dealers will share all relevant details and evidence in the form of screenshots, along with traffic data and actual spending or as asked by Haier during the campaign.
          </li>
          <li>
            Prepaid order amounts will be adjusted into the dealer's ledger on a weekly basis.
          </li>
          <li>
            In case of a return, the product will be returned to the dealer. Training and support will be provided to dealers by Haier Teams. In case of misconduct by a dealer, Haier has the authority to cancel its contract.
          </li>
          <li>
            Haier reserves the right to change Terms & Conditions at any time without prior notice.
          </li>
          <li>
            Customer data is the property of Haier, and dealers cannot misuse it.
          </li>
          <li>
            In case of a dispute between customers, dealers, and Haier, Haier's decision or statement will be considered final.
          </li>
          <li>
            All warranties for products sold online will start from the purchasing date.
          </li>
          <li>
            Dealers will call all customers whose orders they picked to confirm order details and delivery addresses.
          </li>
          
        </ul>

        <h3>Order Mechanism:</h3>
        <ul>
          <li>Customers will visit the Haier website and place their orders there.</li>
          <li>
            Once an order is placed, it will be listed as a public order, and any dealer
            from the respective city can accept the order within one hour.
          </li>
          <li>
            If no dealer picks up the order within one hour, it will then be forwarded
            to Haier for fulfilment.
          </li>
          <li>
            For private orders, if a dealer has registered the customer, that dealer
            will have the first opportunity to accept the order. If the dealer fails to
            pick up the order within one hour, it will then be available as a public
            order for any registered online dealer to accept.
          </li>
          <li>
            If no dealer from the public orders picks up the order within one hour,
            then Haier will fulfil the order.
          </li>
        </ul>
      </div>

 
      <!-- Accept Terms -->
      <div class="accept-terms" v-if="isLoginRoute">
        <!-- Checkbox for terms -->
        <VCheckbox
          v-model="acceptTerm"
          label="Accept & agree to our Terms and Conditions"
          color="primary"
        />
      
        <!-- Button for submission -->
        <VBtn
          :disabled="!acceptTerm" 
          @click="!isLoading && handleSubmit()"
        >
          <!-- Loading indicator -->
          <VProgressCircular
            v-if="isLoading"
            indeterminate
            color="white"
          />
          <!-- Button label -->
          <template v-else>
            Accept
          </template>
        </VBtn>
      </div>
      
    </VCard>
  </VDialog>
</template>

<style lang="scss">
.dialog-bottom-transition-enter-active,
.dialog-bottom-transition-leave-active {
  transition: transform 0.2s ease-in-out;
}

.terms-content {
  padding: 16px;
  font-size: 0.9rem;
  color: #555;
}

.terms-content .note {
  color: #007bff;
  font-weight: bold;
  margin-bottom: 8px;
}

.terms-content ul {
  padding-left: 20px;
}

.terms-content li {
  margin-bottom: 8px;
}

.accept-terms {
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
