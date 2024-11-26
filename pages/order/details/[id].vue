<script setup lang="ts">
import type { Order } from '@db/apps/ecommerce/types'

const orderData = ref<Order>()
const userData = ref()
const orderDetail = ref([])
const subtotal = ref(0)
const extra = ref(0)
const Discount = ref(0)
const Total = ref(0)

const route = useRoute('order-details-id')
const loaderStore = useLoaderStore()
const snackbarStore = useSnackbarStore()
const apiRequestObj = useApi()

const transformOrderDetail = vendorOrderInfoDto => {
  subtotal.value = subtotal.value + (vendorOrderInfoDto.orderAmount * vendorOrderInfoDto.vendorOrderSpecInfoDtoList[0].purchaseNum) || 0
  extra.value = extra.value + vendorOrderInfoDto.logisticAmount || 0
  Discount.value = Discount.value + vendorOrderInfoDto.favourableAmount || 0
  Total.value = (subtotal.value + extra.value) - Discount.value || 0

  return {
    productName: vendorOrderInfoDto.productName,
    productImage: vendorOrderInfoDto.vendorOrderSpecInfoDtoList[0].specCoverImg,
    productId: vendorOrderInfoDto.productId,
    variation: vendorOrderInfoDto.vendorOrderSpecInfoDtoList[0].specName,

    //     subtitle: "Storage: 128gb",
    price: vendorOrderInfoDto.orderAmount,
    quantity: vendorOrderInfoDto.vendorOrderSpecInfoDtoList[0].purchaseNum,
    total: vendorOrderInfoDto.orderAmount * vendorOrderInfoDto.vendorOrderSpecInfoDtoList[0].purchaseNum,
    logisticAmount: vendorOrderInfoDto.logisticAmount,
    favourableAmount: vendorOrderInfoDto.favourableAmount,
  }
}

const transformData = apiResponse => {
  return apiResponse.map(item => {
    const payload = JSON.parse(item.payload) || {}
    const vendor = item.vendor || {}

    userData.value = {
      fullName: payload.consignee,
      country: 'Pakistan',
      province: payload.province,
      city: payload.city,
      district: payload.district,
      address: payload.address,
      contact: payload.mobile,
      clientIp: payload.clientIp,
    }
    orderDetail.value = payload.vendorOrderInfoDtos.map(vendorOrderInfoDto => transformOrderDetail(vendorOrderInfoDto))

    return {
      id: item.id,
      order: item.order_no,
      customer: payload.consignee || 'N/A',
      email: vendor.email || 'N/A',
      avatar: '', // Default empty avatar
      payment: Number.parseFloat(item.paymentAmount) || 0,
      status: item.pick_status.name || 'Unknown',
      spent: Number.parseFloat(item.paymentAmount) || 0, // Assuming spent = paymentAmount
      method: payload.channel || 'Unknown', // Payment method
      // date: new Date(item.created_at).toLocaleString("en-US", dateTimeOptions),
      date: item.created_at,
      time: new Date(item.created_at).getTime() + 60 * 60 * 1000, // One hour later
      methodNumber: item.id, // Placeholder for method number
    }
  })
}

const fetchData = async () => {
  try {
    loaderStore.showLoader()
    console.log('details page ', route.params.id)

    // const response = await apiRequestObj.makeRequest('admin/dashboard/stats', 'get', '',route.params.id)
    const response = await apiRequestObj.makeRequest(
      'service/search/my-orders?page=&order_no=&order_status=&payment_status=',
      'get',
    )

    if (response && response.success) {
      // Transform and set the data
      const singleOrder = response?.data?.data.filter(
        item => item.order_no === route.params.id,
      )
      orderData.value = transformData(singleOrder)
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

onMounted(async ()=>{
  await fetchData()

})


const isConfirmDialogVisible = ref(false)

const headers = [
  { title: 'Product', key: 'productName' },
  { title: 'Variation', key: 'variation' },
  { title: 'Price', key: 'price' },
  { title: 'Quantity', key: 'quantity' },
  { title: 'Total', key: 'total' },
]

const resolvePaymentStatus = (payment: number) => {
  if (payment === 1)
    return { text: 'Paid', color: 'success' }
  if (payment === 2)
    return { text: 'Pending', color: 'warning' }
  if (payment === 3)
    return { text: 'Cancelled', color: 'secondary' }
  if (payment === 4)
    return { text: 'Failed', color: 'error' }
}

const resolveStatus = (status: string) => {
  if (status === 'Exclusive')
    return { text: 'Ready to Pickup', color: 'info' }
  if (status === 'Picked')
    return { text: 'Picked', color: 'warning' }
  if (status === 'out for delivery')
    return { text: 'Out for delivery', color: 'primary' }
  if (status === 'Closed')
    return { text: 'Closed', color: 'success' }

  return { text: status, color: 'primary' }
}
</script>

<template>
  <SnackBar />
  <div>
    <div class="d-flex justify-space-between align-center flex-wrap gap-y-4 mb-6">
      <div>
        <div class="d-flex gap-2 align-center mb-2 flex-wrap">
          <h5 class="text-h5">
            Order #{{ route.params.id }}
          </h5>
          <div class="d-flex gap-x-2">
            <VChip
              v-if="orderData?.[0]?.status"
              v-bind="resolveStatus(orderData?.[0]?.status)"
              label
              size="small"
            />
          </div>
        </div>
        <div class="text-body-1">
          {{ orderData?.[0]?.date }}
        </div>
      </div>
      <div class="d-flex gap-x-2">
     <VBtn
      v-if="orderData?.[0]?.status === 'Exclusive'"
      variant="tonal"
      color="primary"
      @click="isConfirmDialogVisible = !isConfirmDialogVisible"
    >
      Pick
    </VBtn>

    <VBtn
      v-if="orderData?.[0]?.status === 'Exclusive'"
      variant="tonal"
      color="error"
      @click="isConfirmDialogVisible = !isConfirmDialogVisible"
    >
      Move to Public
    </VBtn>

    <VBtn
      v-if="orderData?.[0]?.status === 'Picked'"
      variant="tonal"
      color="warning"
      @click="isConfirmDialogVisible = !isConfirmDialogVisible"
    >
      Reject Order
    </VBtn>

    <VBtn
      v-if="orderData?.[0]?.status === 'Picked'"
      variant="tonal"
      color="success"
      @click="isConfirmDialogVisible = !isConfirmDialogVisible"
    >
      Delivered
    </VBtn>

    <VBtn
      v-if="orderData?.[0]?.status === 'out for delivery'"
      variant="tonal"
      color="primary"
      @click="isConfirmDialogVisible = !isConfirmDialogVisible"
    >
      Deliver Now
    </VBtn>

    <VBtn
      v-if="orderData?.[0]?.status === 'out for delivery'"
      variant="tonal"
      color="error"
      @click="isConfirmDialogVisible = !isConfirmDialogVisible"
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
                ${{ item.price }}
              </div>
            </template>

            <template #item.total="{ item }">
              <div class="text-body-1">
                ${{ item.total }}
              </div>
            </template>

            <template #item.quantity="{ item }">
              <div class="text-body-1">
                {{ item.quantity }}
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
                      PKR{{ subtotal }}
                    </td>
                  </tr>
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
                  <tr>
                    <td class="text-high-emphasis font-weight-medium">
                      Total:
                    </td>
                    <td class="font-weight-medium">
                      PKR{{ Total }}
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
              <VAvatar
                v-if="orderData"
                :variant="!orderData[0]?.avatar?.length ? 'tonal' : undefined"
                :rounded="1"
                class="me-3"
              >
                <VImg
                  v-if="orderData[0]?.avatar"
                  :src="orderData[0]?.avatar"
                />

                <span
                  v-else
                  class="font-weight-medium"
                >{{
                  avatarText(userData?.fullName)
                }}</span>
              </VAvatar>
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
              {{ userData?.district }} , <br>
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
      :confirm-title="dialogConfirmTitle"
    />
  </div>
</template>
