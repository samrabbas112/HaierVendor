<script setup lang="ts">
import { orderCodeStatus, orderStatusCodes } from '../../../libs/order/order-status'

const orderData = ref([])
const isConfirmDialogVisible = ref(false)
const isReasonDialogVisible = ref(false)
const selectedStatus = ref(12)
const selectedReason = ref()
const selectedPics = ref([])
const inputPics = ref([])
const fileInput = ref(null)
const customReason = ref(null)
const dialogMsg = ref('Are you sure')
const reasons = ref([])
const imagePreviews = ref([])

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
const authStore = useAuthStore()
const authUser = authStore.user

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
    status: apiResponse.pick_status.id || 1,
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

const updateStatus = async () => {
  try {
    loaderStore.showLoader()

    if (selectedStatus.value == orderStatusCodes.isClosed && !isEmpty(selectedPics.value)) {
      const formData = new FormData()

      // Append selected pictures to the FormData
      selectedPics.value.forEach((file, index) => {
        formData.append(`files[${index}]`, file)
      })

      const token = useCookie('auth').value?.token

      // Make the API request
      const { data, status, error, refresh, clear } = await useFetch('http://haiermall.test/api/v2/common/file-upload', {
        method: 'POST', // Specify HTTP method
        body: formData,
        onRequest({ request, options }) {
          // Set the Authorization header
          options.headers = options.headers || {}
          options.headers.Authorization = `Bearer ${token}`
        },
      })

      if (status.value == 'success' && data?.value?.data.status == 200) {
        selectedPics.value = []
        selectedPics.value = data?.value?.data
      }
      else {
        snackbarStore.showSnackbar('Error in uploading files')

        return
      }
    }

    const requestData = {
      status: selectedStatus.value,
      reason: selectedReason.value === 'other' ? customReason.value : selectedReason.value,
      files: selectedPics.value,
    }

    const response = await apiRequestObj.makeRequest(
      `common/order/update/status/${orderData.value.uid}`, 'post',
      requestData,
    )

    if (response?.success) {
      orderData.value.status = response?.data?.pick_status?.id
      snackbarStore.showSnackbar(response.message, 'primary')
    }
  }
  catch (error) {
    console.error('Error updating status:', error)
    snackbarStore.showSnackbar('Failed to update status. Please try again.', 'error')
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

const handleConfirm = async value => {
  if (value) {
    if ([orderStatusCodes.isDeliveryRefused, orderStatusCodes.isRejected].includes(selectedStatus.value)) {
      selectedStatus.value === orderStatusCodes.isDeliveryRefused
        ? (reasons.value = deliveryRefusedReasons)
        : (reasons.value = rejectOrderReasons)
      isReasonDialogVisible.value = !isReasonDialogVisible.value
    }
    else if (selectedStatus.value == orderStatusCodes.isClosed) {
      isReasonDialogVisible.value = !isReasonDialogVisible.value
    }
    else {
      await updateStatus()
    }
  }
}

const handleReasonDialog = async () => {
  if (selectedStatus.value == orderStatusCodes.isRejected || selectedStatus.value == orderStatusCodes.isDeliveryRefused) {
    if (selectedReason.value === 'other') {
      if (customReason.value == null) {
        snackbarStore.showSnackbar('Please Enter Reason', 'error')

        return
      }
    }
    if (!selectedReason.value) {
      snackbarStore.showSnackbar('Please Enter Reason', 'error')

      return
    }
  }
  if (selectedStatus.value == orderStatusCodes.isClosed) {
    if (isEmpty(selectedPics.value) || selectedPics.value.length > 5 || !max6mbValidator(selectedPics.value) || !imageFileValidator(selectedPics.value)) {
      snackbarStore.showSnackbar('Please add between 1 to 5 images, and each must not be more than 6MB.', 'error')

      return
    }
  }
  if (selectedReason.value || !isEmpty(selectedPics.value)) {
    isReasonDialogVisible.value = false
    await updateStatus()
  }
  selectedReason.value = null
  customReason.value = null
  selectedPics.value = []
}

const handleFileChange = event => {
  const files = event.target.files
  if (files && files.length > 0 && files.length <= 5) {
    const newFiles = Array.from(files)

    selectedPics.value = [...selectedPics.value, ...newFiles]
  }
  else {
    selectedPics.value = []
  }
  inputPics.value = selectedPics.value
  generateImagePreviews(selectedPics.value)
}

// Generate image previews
function generateImagePreviews(files) {
  const previews = files.map(file => {
    const reader = new FileReader()

    return new Promise(resolve => {
      reader.onloadend = () => resolve(reader.result)
      reader.readAsDataURL(file)
    })
  })

  // Once all files have been processed, update the previews array
  Promise.all(previews).then(urls => {
    imagePreviews.value = urls
  })
}

// Remove selected file from the list
function removeFile(index) {
  imagePreviews.value.splice(index, 1)
  selectedPics.value.splice(index, 1)
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
              v-bind="resolveOrderStatus(orderData?.status)"
              label
              size="small"
            />
          </div>
        </div>
        <div class="text-body-1">
          {{ orderData?.date }}
        </div>
      </div>
      <div
        v-if="authUser.user_type !== 'haier' && route.params.group !== 'vendor'"
        class="d-flex gap-x-2"
      >
        <div
          v-if="authUser.user_type == 'vendor'"
          class="d-flex gap-x-2"
        >
          <VBtn
            v-if="orderData?.status == orderStatusCodes.isExclusive || orderData?.status == orderStatusCodes.isPublic"
            variant="tonal"
            color="primary"
            @click="
              handleClick(
                orderStatusCodes.isPicked,
                'Do you confirm you want to pick up the order?',
              )
            "
          >
            Pick
          </VBtn>

          <VBtn
            v-if="orderData?.status == orderStatusCodes.isExclusive"
            variant="tonal"
            color="error"
            @click="
              handleClick(
                orderStatusCodes.isPublic,
                'Do you confirm you want to move the order to public?',
              )
            "
          >
            Move to Public
          </VBtn>
          <VBtn
            v-if="orderData?.status == orderStatusCodes.isPicked"
            variant="tonal"
            color="warning"
            @click="
              handleClick(
                orderStatusCodes.isRejected,
                'Do you confirm you want to Reject Order?',
              )
            "
          >
            Reject Order
          </VBtn>
        </div>
        <VBtn
          v-if="orderData?.status == orderStatusCodes.isPicked"
          variant="tonal"
          color="success"
          @click="
            handleClick(
              orderStatusCodes.isOutForDelivery,
              'Do you confirm you want to deliver the order now?',
            )
          "
        >
          Deliver Now
        </VBtn>
        <VBtn
          v-if="orderData?.status == orderStatusCodes.isHaier"
          variant="tonal"
          color="success"
          @click="
            handleClick(
              orderStatusCodes.isReadyToShip,
              'Do you confirm that the order is ready to ship now?',
            )
          "
        >
          Ready To Ship
        </VBtn>

        <VBtn
          v-if="orderData?.status == orderStatusCodes.isOutForDelivery"
          variant="tonal"
          color="primary"
          @click="
            handleClick(
              orderStatusCodes.isClosed,
              'Do you confirm you Delivered the Order?',
            )
          "
        >
          Delivered
        </VBtn>

        <VBtn
          v-if="orderData?.status == orderStatusCodes.isOutForDelivery"
          variant="tonal"
          color="error"
          @click="
            handleClick(
              orderStatusCodes.isDeliveryRefused,
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
                  Customer Full Name:   {{ userData?.fullName }}
                </h6>
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
      @confirm="handleConfirm"
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
              <div v-if="selectedStatus === orderStatusCodes.isClosed">
                <div class="d-flex align-center gap-x-1">
                  <VFileInput
                    id="pod-files"
                    ref="fileInput"
                    v-model="inputPics"
                    show-size
                    accept="image/png, image/jpeg, image/bmp"
                    label="POD Files: Images must be between 1-5"
                    prepend-icon="tabler-camera"
                    multiple
                    :rules="[maxFiveFilesValidator, max6mbValidator, imageFileValidator]"
                    @change="handleFileChange"
                    @click:clear="handleFileChange"
                  />
                  <VBtn
                    icon="tabler-plus"
                    size="24"
                    color="primary"
                    @click="() => $refs.fileInput.$el.querySelector('input').click()"
                  />
                </div>

                <!-- Updated Preview Section -->
                <VCol
                  v-if="imagePreviews.length > 0"
                  class="d-flex justify-center  flex-wrap gap-x-3"
                >
                  <div
                    v-for="(preview, index) in imagePreviews"
                    :key="index"
                    class="preview-container position-relative"
                  >
                    <VImg
                      :src="preview"
                      height="175"
                      width="175"
                      alt="Preview"
                    />
                    <VBtn
                      icon="tabler-x"
                      size="20"
                      color="error"
                      class="remove-btn"
                      @click="removeFile(index)"
                    />
                  </div>
                </VCol>
              </div>

              <AppSelect
                v-else
                v-model="selectedReason"
                label="Select Reason:"
                placeholder="Please Select your Reason"
                :items="reasons"
                clearable
                clear-icon="tabler-x"
                class="text-left"
                :rules="[requiredValidator]"
              />
            </VCol>

            <VCol
              v-if="selectedReason == 'other'"
              cols="12"
            >
              <AppTextarea
                v-model="customReason"
                placeholder="Type Reason"
                label="Reason:"
                class="text-left"
                :rules="[requiredValidator]"
              />
            </VCol>
          </VRow>

          <VCardText class="d-flex align-center justify-center gap-2">
            <VBtn
              color="success"
              @click="handleReasonDialog"
            >
              Ok
            </VBtn>

            <VBtn
              color="secondary"
              variant="tonal"
              @click="() => {
                selectedPics = []
                selectedReason = null
                customReason = null
                isReasonDialogVisible = false;
              }"
            >
              Cancel
            </VBtn>
          </VCardText>
        </VCardText>
      </VCard>
    </VDialog>
  </div>
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
