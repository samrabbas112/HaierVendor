<script setup lang="ts">
const orderData = ref([])
const isConfirmDialogVisible = ref(false)
const isReasonDialogVisible = ref(false)
const selectedStatus = ref('picked')
const selectedReason = ref()
const customeReason = ref()
const dialogMsg = ref('Are you sure')
const reasons = ref([])

const userData = ref({
  fullName: '',
  country: 'Pakistan',
  province: '',
  city: '',
  address: '',
  contact: '',
  clientIp: '',
})

const orderDetail = ref([])
const subtotal = ref(0)
const Total = ref(0)

const route = useRoute()
const loaderStore = useLoaderStore()
const snackbarStore = useSnackbarStore()
const apiRequestObj = useApi()

const deliveryRefusedReasons = [
  'Customer has not answered the phone call',
  'Customer refused to accept',
  'Cusotmer has already generated the canacel request',
  'other',
]

const rejectOrderReasons = [
  'Customer is not responding',
  'Out of stock',
  'Customer ask to cancel',
  'wrong customer information',
  'Delivery location mismatch',
  'other',
]

const transformOrderDetail = (orderProduct, singleProductTotal) => {
  return {
    productName: orderProduct.productName,
    productImage: orderProduct.productCoverImg || '',
    productId: orderProduct.productId,
    variations: orderProduct.specInfo.map((spec: any) => ({
      name: spec.specName,
      quantity: spec.purchaseNum,
    })),
    price: orderProduct.productPrice,
    total: singleProductTotal,
  }
}

const transformData = apiResponse => {
  subtotal.value = 0 // Reset subtotal before recalculating

  const customer = apiResponse.customer

  // Set user data
  userData.value = {
    fullName: customer.name,
    country: 'Pakistan',
    province: customer.province,
    city: customer.city,
    address: customer.address,
    contact: customer.mobile.toString(),
    clientIp: customer.clientIp,
  }

  // Set order details
  orderDetail.value = apiResponse.orderProduct.map(orderProduct => {
    let singleProductTotal = 0
    orderProduct.specInfo.forEach(spec => {
      subtotal.value += orderProduct.productPrice * spec.purchaseNum
      singleProductTotal += orderProduct.productPrice * spec.purchaseNum
    })

    return transformOrderDetail(orderProduct, singleProductTotal)
  })

  // Return transformed order data
  return {
    id: apiResponse.id,
    uid: apiResponse.uid,
    order: apiResponse.order_no,
    payment: Number.parseFloat(apiResponse.paymentAmount) || 0,
    status: apiResponse.pick_status || 'Unknown',
    method: apiResponse.payment_method || 'COD',
    date: apiResponse.created_at,
    time: apiResponse.pick_before,
  }
}

const fetchData = async () => {
  try {
    loaderStore.showLoader()

    const response = await apiRequestObj.makeRequest(
      `common/order/show/${route.params.id}`,
      'get',
    )

    if (response && response.success) {
      const singleOrder = response.data

      orderData.value = transformData(singleOrder)
      Total.value = subtotal.value // Update total with the subtotal
    }
    else {
      snackbarStore.showSnackbar(
        'An error occurred. Please try again.',
        'error',
      )
    }
  }
  catch (error) {
    snackbarStore.showSnackbar('An error occurred. Please try again.', 'error')
  }
  finally {
    loaderStore.hideLoader()
  }
}

const handleClick = (status, text) => {
  dialogMsg.value = text
  selectedStatus.value = status
  isConfirmDialogVisible.value = !isConfirmDialogVisible.value
}

const handleDialogClick = async (value) => {
  if (value) {
    if (
      ['delivery_refused', 'reject_order'].includes(selectedStatus.value) || true
    ) {
      selectedStatus.value === 'delivery_refused'
        ? (reasons.value = deliveryRefusedReasons)
        : (reasons.value = rejectOrderReasons)
      isReasonDialogVisible.value = !isReasonDialogVisible.value
    }
    else {
      await updateStatus();
      snackbarStore.showSnackbar('Status Updated', 'primary')
    }
  }
  else {
    selectedStatus.value = null
  }
}

const handleReasonDialogClick = async() => {
  if (selectedReason.value){
    snackbarStore.showSnackbar('order status updated', 'primary')
    isReasonDialogVisible.value = !isReasonDialogVisible.value
    await updateStatus();
  }

  selectedReason.value = null
  customeReason.value = null
  
}

const updateStatus = async () => {
  const response = apiRequestObj.makeRequest(`common/order/update/status/${orderData.value.uid}`,'post',{
    order_no: orderData.value.order,
    status: selectedStatus.value,
    reason: selectedReason.value
  },
  )

  console.log("ahmad",response?.success)
}

onMounted(async () => {
  await fetchData()
})

const headers = [
  { title: 'Product', key: 'productName' },
  { title: 'Variation', key: 'variations' },
  { title: 'Quantity', key: 'quantity' },
  { title: 'Price', key: 'price' },
  { title: 'Total', key: 'total' },
]

const resolveStatus = (status: string) => {
  const statusMapping = {
    'Exclusive': { text: 'Ready to Pickup', color: 'info' },
    'Picked': { text: 'Picked', color: 'warning' },
    'out for delivery': { text: 'Out for delivery', color: 'primary' },
    'Closed': { text: 'Closed', color: 'success' },
  }

  return statusMapping[status] || { text: status, color: 'primary' }
}
</script>

<template>
  <div>
    <div class="d-flex justify-space-between align-center flex-wrap gap-y-4 mb-6">
      <div>
        <div class="d-flex gap-2 align-center mb-2 flex-wrap">
          <h5 class="text-h5">
            Order #{{ orderData?.order }}
          </h5>
          <div class="d-flex gap-x-2">
            <VChip
              v-if="orderData?.status"
              v-bind="resolveStatus(orderData?.status)"
              label
              size="small"
            />
          </div>
        </div>
        <div class="text-body-1">
          {{ orderData?.date }}
        </div>
      </div>
      <div class="d-flex gap-x-2">
        <VBtn
          v-if="orderData?.status === 'Exclusive'"
          variant="tonal"
          color="primary"
          @click="
            handleClick(
              'picked',
              'Do you confirm you want to pick up the order?',
            )
          "
        >
          Pick
        </VBtn>

        <VBtn
          v-if="orderData?.status === 'Exclusive'"
          variant="tonal"
          color="error"
          @click="
            handleClick(
              'move_to_public',
              'Do you confirm you want to move the order to public?',
            )
          "
        >
          Move to Public
        </VBtn>

        <VBtn
          v-if="orderData?.status === 'Picked'"
          variant="tonal"
          color="warning"
          @click="
            handleClick(
              'reject_order',
              'Do you confirm you want to Reject Order?',
            )
          "
        >
          Reject Order
        </VBtn>

        <VBtn
          v-if="orderData?.status === 'Picked'"
          variant="tonal"
          color="success"
          @click="
            handleClick(
              'deliver_now',
              'Do you confirm you Delivered the Order?',
            )
          "
        >
          Deliver Now
        </VBtn>

        <VBtn
          v-if="orderData?.status === 'out for delivery'"
          variant="tonal"
          color="primary"
          @click="
            handleClick(
              'delivered',
              'Do you confirm you want to deliver the order now?',
            )
          "
        >
          Delivered
        </VBtn>

        <VBtn
          v-if="orderData?.status === 'out for delivery'"
          variant="tonal"
          color="error"
          @click="
            handleClick(
              'delivery_refused',
              'Do you confirm you want to refuse the delivery of this order?',
            )
          "
        >
          Delivery Refused
        </VBtn>
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
          <VDataTable
            :headers="headers"
            :items="orderDetail"
            item-value="productName"
            class="text-no-wrap"
          >
            <template #item.productName="{ item }">
              <div class="d-flex gap-x-3 align-center">
                <VAvatar
                  size="34"
                  :image="item.productImage"
                  :rounded="0"
                />

                <div class="d-flex flex-column align-start">
                  <h6 class="text-h6">
                    {{ item.productName }}
                  </h6>

                  <span class="text-body-2">
                    {{ item.subtitle }}
                  </span>
                </div>
              </div>
            </template>

            <template #item.price="{ item }">
              <div class="text-body-1">
                {{ item.price }}
              </div>
            </template>

            <template #item.total="{ item }">
              <div class="text-body-1">
                {{ item.total }}
              </div>
            </template>

            <template #item.variations="{ item }">
              <div
                v-for="(variation, index) in item.variations"
                :key="index"
                class="text-body-1"
              >
                {{ variation.name }}
              </div>
            </template>
            <template #item.quantity="{ item }">
              <div
                v-for="(variation, index) in item.variations"
                :key="index"
                class="text-body-1"
              >
                {{ variation.quantity }}
              </div>
            </template>
            <!-- </div> -->

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
                      <span class="font-weight-light">PKR</span>{{ subtotal }}
                    </td>
                  </tr>
                  <!--
                    <tr>
                    <td>Extra:</td>
                    <td class="font-weight-medium">
                    PKR{{ extra }}
                    </td>
                    </tr>
                    <tr>
                    <td>Discount:</td>
                    <td class="font-weight-medium">
                    PKR{{ Discount }}
                    </td>
                    </tr>
                  -->
                  <tr>
                    <td class="text-high-emphasis font-weight-medium">
                      Total:
                    </td>
                    <td class="font-weight-medium">
                      <span class="font-weight-light">PKR</span>{{ Total }}
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
          <VCardText class="d-flex flex-column gap-y-6">
            <h5 class="text-h5">
              Customer details
            </h5>

            <div class="d-flex align-center">
              <div>
                <h6 class="text-h6">
                  {{ userData?.fullName }}
                </h6>
                <div class="text-body-1">
                  Customer IP: #{{ userData?.clientIp }}
                </div>
              </div>
            </div>

            <div class="d-flex flex-column gap-y-1">
              <div class="d-flex justify-space-between align-center">
                <h6 class="text-h6">
                  Contact Info
                </h6>
              </div>
              <span>Mobile: {{ userData?.contact }}</span>
            </div>
          </VCardText>
        </VCard>

        <!-- 👉 Shipping Address -->
        <VCard class="mb-6">
          <VCardItem>
            <VCardTitle>Shipping Address</VCardTitle>
          </VCardItem>

          <VCardText>
            <div class="text-body-1">
              {{ userData?.address }} <br>
              {{ userData?.city }} <br>
              {{ userData?.province }}
              {{ userData?.country }}
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <ConfirmDialog
      v-model:isDialogVisible="isConfirmDialogVisible"
      :confirmation-question="dialogMsg"
      cancel-msg="Request cancelled!!"
      cancel-title="Cancelled"
      confirm-msg="Your order status changed successfully."
      confirm-title="Confirmed"
      @confirm="handleDialogClick"
    />
    <VDialog
      v-model="isReasonDialogVisible"
      max-width="500"
    >
      <VCard>
        <VCardText class="text-center px-10 py-6">
          <VRow
            cols="12"
            sm="8"
          >
            <VCol cols="12">
              <AppSelect
                v-model="selectedReason"
                label="Select Reason"
                placeholder="Please Select your Reason"
                :items="reasons"
                clearable
                clear-icon="tabler-x"
                class="text-left"
              />
            </VCol>
            <VCol
              v-if="selectedReason == 'other'"
              cols="12"
            >
              <AppTextarea
                v-model="customeReason"
                placeholder="Type Reason"
                label="Reason:"
                class="text-left"
              />
            </VCol>
          </VRow>

          <VBtn
            color="success"
            class="mt-5"
            @click="handleReasonDialogClick"
          >
            Ok
          </VBtn>
        </VCardText>
      </VCard>
    </VDialog>
  </div>
</template>
