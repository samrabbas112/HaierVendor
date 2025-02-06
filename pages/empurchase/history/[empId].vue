<script setup lang="ts">
import { ref } from 'vue';
import ProductDetail from "@/components/employee-order/product-detail.vue";
const orderStatus = ref('Select Order Status')
const orderNo = ref('')
const snackbarStore = useSnackbarStore();
const loaderStore = useLoaderStore()
const apiRequestObj = useApi()
const route = useRoute()
const subtotal = ref(0)
const order = ref(null);
const orderDetail = ref([])
const isLoading = ref(false)
const isDisabled = ref(false);
let products = reactive({
  productCoverImg: '',
  productName: '',
  purchaseNum: 0,
  specName: '',
});

const headers = [
  { title: 'Product', key: 'productName' },
  { title: 'Variation', key: 'specInfo' },
  { title: 'Quantity', key: 'quantity' },
  { title: 'Placed At', key: 'created_at' },
  { title: 'City', key: 'city' },
  { title: 'Price', key: 'price' },
  { title: 'Paid Amount', key: 'payedAmount' },
  { title: 'Payment Proof', key: 'proof' },
]

const resolveMethod = (status: number) => {
  if (status === 1)
    return { text: 'Approved', color: 'success' }
  if (status === 2)
    return { text: 'Rejected', color: 'error' }
  return { text: 'Pending', color: 'warning' }
}

const fetchData = async () => {
  try {
    loaderStore.showLoader()
    const response = await apiRequestObj.makeRequest(
      `haier/employee-order/detail/${route.params.empId}`,
      'get',
    )
    if(response && response.success) {
      order.value = response.data;
      console.log('order wasim',order.value);
      orderDetail.value = order.value.orderProduct.map(orderProduct => {
        let singleProductTotal = 0
        let singleProductPrice =0;
        orderProduct.specInfo.forEach(spec => {
          subtotal.value += spec.amount * spec.purchaseNum
          singleProductTotal += spec.amount * spec.purchaseNum
          singleProductPrice = spec.amount;
          products = {productCoverImg: orderProduct.productCoverImg, productName: orderProduct.productName, purchaseNum: spec.purchaseNum, specName: spec.specName};
        })
        singleProductTotal += orderProduct.logisticAmount || 0
        return {
          ...orderProduct, // Keep existing properties
          singleProductTotal, // Add computed total
          created_at: order.value.created_at, // Add created_at
          city: order.value.customer.city,
          price: singleProductPrice,
          payedAmount: order.value.payment_amount,
        };
        // return orderProduct.push({ created_at: order.value.created_at });
      });
        isDisabled.value = order.value.finance_status != 0;
        if(isDisabled.value){
          console.log('Wasim if block')
          selectedRadio.value = order.value.finance_status;
          financeCode.value = order.value.sap_code;
          rejectReason.value  = order.value.rejection_reason;

        }
      console.log('wasim',orderDetail.value);
    }else if (response?.code === 401 || response?.message === 'Unauthenticated.') {
      snackbarStore.showSnackbar('Login session expired', 'error')
    }
    else {
      snackbarStore.showSnackbar(
        'An error occurred. Please try again.',
        'error',
      )
    }
  }catch (error) {
    snackbarStore.showSnackbar('An error occurred. Please try again.', 'error')
  }
  finally {
    loaderStore.hideLoader()
  }
}


onMounted(() => {
  fetchData();
});

const showCopiedMessage = ref(false);

const copyUrl = async () => {
  try {
    await navigator.clipboard.writeText(order.value.form_number);
    showCopiedMessage.value = true;
    setTimeout(() => {
      showCopiedMessage.value = false;
    }, 1500);
  } catch (error) {
    console.error("Failed to copy URL: ", error);
  }
};
const selectedRadio = ref(0);
const rejectReason = ref('');
const financeCode = ref('');


const updateOrder =  async () => {
  if(isLoading.value) return;
  isLoading.value = true;
  try {
    const data = {
      'finance_status': selectedRadio.value,
      'rejection_reason': rejectReason.value,
      'sap_code': financeCode.value
    };
    console.log('wasim data',data);
    const response = await apiRequestObj.makeRequest(
      `haier/employee-order/update/${route.params.empId}`,
      'post',
      data,
    )
    console.log('wasim response', response.data);

  } catch (e) {
    console.error(e);
  } finally {
    isDisabled.value = true;
    isLoading.value = false;
  }
}
</script>

<template>
  <section>
  <div>
    <div class="d-flex justify-space-between align-center flex-wrap gap-y-4 mb-6">
      <div>
        <div class="d-flex gap-2 align-center mb-2 flex-wrap">
          <h5 class="text-h5">
            Order #{{ order?.order_no }}
          </h5>
          <div class="d-flex gap-x-2">
            <VChip  v-bind="resolveMethod(order?.status)" label size="small" />
          </div>
        </div>
          <div class="d-flex gap-2 align-center mb-2 flex-wrap">
          <h5 class="text-h5">
            Form No: {{ order?.form_number}}
            <IconBtn @click="copyUrl" class="mr-3">
              <VIcon icon="tabler-copy" />
            </IconBtn>
          </h5>
            <div
              v-if="showCopiedMessage"
              class="mt-2 text-green-darken-2 text-caption"
            >
              URL copied to clipboard!
            </div>
        </div>
        <div class="text-body-1">
          {{ order?.created_at }}
        </div>
      </div>
    </div>

    <VRow>
      <VCol
        cols="12"
        md="8"
      >
        <!-- 👉 Order Details -->
        <VCard class="mb-6">
          <VCardItem>
            <template #title>
              <h5 class="text-h5">
                Order Details
              </h5>
            </template>
          </VCardItem>

          <VDivider />
          <VDataTable :headers="headers" :items="orderDetail" item-value="productName" class="text-no-wrap">
            <template #item.productName="{ item }">
              <div class="d-flex gap-x-3 align-center">
                <div class="d-flex flex-column align-start text-wrap w-100">
                  <h6 class="text-h6">
                    {{ item.productName }}
                  </h6>
                </div>
              </div>
            </template>

            <template #item.specInfo="{ item }">
              <div v-for="(variation, index) in item.specInfo" :key="index" class="text-body-1 text-wrap w-100">
                {{ variation.specName }}
              </div>
            </template>
            <template #item.quantity="{ item }">
              <div v-for="(variation, index) in item.specInfo" :key="index" class="text-body-1">
                {{ variation.purchaseNum }}
              </div>
            </template>
            <template #item.proof="{ item }">
              <div v-for="(variation, index) in item.specInfo" :key="index" class="text-body-1">
                {{ variation.purchaseNum }}
              </div>
            </template>

            <template #bottom />
          </VDataTable>
          <VDivider />

          <VCardText>
            <div class="d-flex align-end flex-column">
              <table class="text-high-emphasis">
                <tbody>
                  <tr>
                    <td width="200px">
                      Subtotal:
                    </td>
                    <td class="font-weight-medium">
                      <span class="font-weight-light">PKR  {{ order?.payment_amount}}</span>
                    </td>
                  </tr>
                  <tr>
                    <td class="text-high-emphasis font-weight-medium">
                      Total:
                    </td>
                    <td class="font-weight-medium">
                      <span class="font-weight-light">PKR {{ order?.payment_amount}}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </VCardText>
        </VCard>
      </VCol>

      <VCol
        cols="12"
        md="4"
      >
        <!-- 👉 Customer Details  -->
        <VCard class="mb-6">
          <VCardText class="d-flex flex-column gap-y-2">
            <h5 class="text-h5">
              Status
            </h5>
           <hr>
            <VRow
              cols="12"
              sm="8"
            >
              <VCol
                v-if="selectedRadio == 1"
                cols="4"
                sm="4"
              >
                <VChip  v-bind="resolveMethod(order?.finance_status)" label size="small" />
              </VCol>
      <VCol cols="12" sm="12">
        <product-detail  :products="products"></product-detail>
      </VCol>
              <VCol
                v-if="selectedRadio == 1"
                cols="12"
                sm="12"
              >

                <AppTextField
                  :value="order?.sap_code"
                  label="SAP Code"
                  :disabled="isDisabled"
                  placeholder="Enter Code"
                />
              </VCol>
              <VCol
                v-if="selectedRadio == 2"
                cols="12"
                :disabled="isDisabled"
                sm="12"
              >
                <AppTextarea
                  v-model="rejectReason"
                  label="Reason"
                  :disabled="isDisabled"
                  placeholder="Please provide rejection reason"
                />
              </VCol>
            </VRow>
          </VCardText>
        </VCard>
        <VCard class="mb-6">
          <VCardText class="d-flex flex-column gap-y-2">
            <h5 class="text-h5">
              Status
            </h5>
            <hr>

            <VRow
              cols="12"
              sm="8"
            >
              <VCol
                v-if="selectedRadio == 1"
                cols="4"
                sm="4"
              >
              <VChip  v-bind="resolveMethod(order?.sod_status)" label size="small" />
              </VCol>
              <VCol cols="12" sm="12">
                <product-detail  :products="products"></product-detail>
              </VCol>
              <VCol
                v-if="selectedRadio == 1"
                cols="12"
                sm="12"
              >
                <AppTextField
                  :value="order?.dn_number"
                  label="Dn Number"
                  :disabled="isDisabled"
                  placeholder="Enter Code"
                />
              </VCol>
              <VCol
                v-if="selectedRadio == 2"
                cols="12"
                :disabled="isDisabled"
                sm="12"
              >
                <AppTextarea
                  v-model="rejectReason"
                  label="Reason"
                  :disabled="isDisabled"
                  placeholder="Please provide rejection reason"
                />
              </VCol>
            </VRow>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </div>

  </section>
</template>

<style scoped>
.remove-btn {
  position: absolute;
  top: 30px;
  right: 0px;
}
.preview-container {
  position: relative;
  display: inline-block;
}
</style>
