<script setup lang="ts">
import {
  orderCodeStatus,
  orderStatusCodes,
} from '../../../libs/order/order-status'
import pdfLogo from '@images/pdf-logo.png'
import { requiredValidator } from "@/utils/validators";

const orderData = ref([])
const logistics = ref([])

const isConfirmDialogVisible = ref(false)
const isLogisticDialogVisible = ref(false)
const isTransferDialogVisible = ref(false)
const isReasonDialogVisible = ref(false)
const selectedStatus = ref(12)
const selectedReason = ref()
const selectedVendor = ref()
const selectedLogistic = ref()
const courierVendorDnNo = ref();
const selectedPics = ref([])
const inputPics = ref([])
const fileInput = ref(null)
const customReason = ref(null)
const dialogMsg = ref('Are you sure')
const reasons = ref([])
const imagePreviews = ref([])

// Store the actual file data for PDFs
const pdfFiles = ref([])


const isPodVisible = ref(false)
const podUrl = ref(false)
const showRejectionTable = ref(false)
const showRejectionCard = ref(false)
const showLogisticCard = ref(false)
const vendorsList = ref([]);

const userData = ref({
  fullName: '',
  country: 'Pakistan',
  province: '',
  city: '',
  address: '',
  contact: '',
  clientIp: '',
})

const reasonDetail = ref([]);
const orderDetail = ref([])
const rejectionDetail = ref([])
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
  'Customer refused to accept at door step',
  'Cusotmer has already generated the canacel request',
  'No one is at home/ or opened the door',
  'Other',
]

const rejectOrderReasons = [
  'Customer is not responding',
  'Out of stock',
  'Customer ask to cancel',
  'Wrong customer information',
  'Delivery location mismatch',
  'Other',
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
    type: orderProduct.newProductType || 'N/A',
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
  

    if(apiResponse.logistics_company_id) {
        showLogisticCard.value = true;
      }
      console.log('rejection reasons');
      console.log(apiResponse.reasons);
      console.log(authUser.user_type);
      reasonDetail.value = (apiResponse.reasons ?? []) // Ensure it's an array
  .filter(reason => {
    if (authUser.user_type === 'haier') {
      return reason.vendor?.type === 'admin';
    } else if (authUser.user_type === 'vendor') {
      return reason.vendor?.type === 'vendor';
    }
    return true; // No filtering if neither condition matches
  })
  .map(reason => ({
    rejectionReason: reason.reason || 'N/A',
    vendorName: reason.vendor?.name || 'N/A',
    rejectedOn: reason.created_at || 'N/A',
  }));

// Update showRejectionCard only if reasonDetail has values
showRejectionCard.value = reasonDetail.value.length > 0;



  // Set order details
  orderDetail.value = apiResponse.orderProduct.map(orderProduct => {
    let singleProductTotal = 0
    orderProduct.specInfo.forEach(spec => {
      subtotal.value += spec.amount * spec.purchaseNum
      singleProductTotal += spec.amount * spec.purchaseNum
    })
    singleProductTotal += orderProduct.logisticAmount || 0
     
    return transformOrderDetail(orderProduct, singleProductTotal)
  })
  console.log('orderDetail');
  console.log(orderDetail.value);

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
    hidden: apiResponse.hidden,
    POD: apiResponse.payment_method,
    logistics_company_id: apiResponse.logistics_company_id,
    courier_vendor_no: apiResponse.courier_vendor_no,
    order_type : apiResponse.order_type
  }
}


  const fetchLogistics = async () => {
  try {
    loaderStore.showLoader()

    const response = await apiRequestObj.makeRequest(
      `haier/logistics/list`,
      'get',
    )

    if (response && response.success) {
      console.log(response);
      logistics.value = response.data
     
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

const fetchData = async () => {
  try {
    loaderStore.showLoader()

    const response = await apiRequestObj.makeRequest(
      `common/order/show/${route.params.id}`,
      'get',
    )

    if (response && response.success) {
      const singleOrder = response.data
      console.log(response.data.city);
      const vendorResponse = await apiRequestObj.makeRequest(
        `common/order/vendor-list/${response.data.city}`,
        'get',
      )
      if (vendorResponse && vendorResponse.success) {
        vendorsList.value = vendorResponse.data.map(vendor => ({
          title: vendor.name,
          value: vendor.id,
        }));

      }
      orderData.value = transformData(singleOrder)

      if (orderData.value.status == orderStatusCodes.isRejected) {
        showRejectionTable.value = true;
      }
     
      Total.value = singleOrder.paymentAmount || 0 // Update total with the subtotal
    }
    else if (response?.code === 401 || response?.message === 'Unauthenticated.') {
      snackbarStore.showSnackbar('Login session expired', 'error')
    }
    else if (response?.code == 403) {
      snackbarStore.showSnackbar(response?.message, 'error')

      return navigateTo(`/order/${route?.params?.group == 'notification' ? 'my' : route?.params?.group}`)
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

    if (
      selectedStatus.value == orderStatusCodes.isClosed
      && !isEmpty(selectedPics.value)
    ) {
      const formData = new FormData()

      // Append selected pictures to the FormData
      selectedPics.value.forEach((file, index) => {
        formData.append(`files[${index}]`, file)
      })

      const token = useCookie('auth').value?.token

      // Make the API request
      const { data, status, error, refresh, clear } = await useFetch(
        'https://v2.jochaho.global/api/v2/common/file-upload',
        {
          method: 'POST', // Specify HTTP method
          body: formData,
          onRequest({ request, options }) {
            // Set the Authorization header
            options.headers = options.headers || {}
            options.headers.Authorization = `Bearer ${token}`
          },
        },
      )

      if (status.value == 'success' && data?.value?.status == 200) {
        selectedPics.value = []
        selectedPics.value = data?.value?.data

        // return console.log('ahmad', selectedPics.value)
      }
      else {
        snackbarStore.showSnackbar('Error in uploading files', 'error')

        return
      }
    }

    const requestData = {
      status: selectedStatus.value,
      reason:
        selectedReason.value === 'Other'
          ? customReason.value
          : selectedReason.value,
      files: selectedPics.value,
    }

    const response = await apiRequestObj.makeRequest(
      `common/order/update/status/${orderData.value.uid}`,
      'post',
      requestData,
    )

    if (response?.success) {
      const updatedStatus = response?.data?.pick_status?.id
      if (updatedStatus == orderStatusCodes.isRejected || updatedStatus == orderStatusCodes.isPublic) {
        showRejectionCard.value = true
      }
      if (updatedStatus == orderStatusCodes.isRejected || updatedStatus == orderStatusCodes.isPublic) {
        snackbarStore.showSnackbar(response.message, 'info')

        return navigateTo(`/order/${route?.params?.group == 'notification' ? 'my' : route?.params?.group}`)
      }
      orderData.value.status = response?.data?.pick_status?.id
      if (orderData.value.status !== orderStatusCodes.isReadyToShip) {
        showRejectionTable.value = false;
      }
      orderData.value.POD = response?.data?.POD
      snackbarStore.showSnackbar(response.message, 'primary')
    }
    else if (response?.code == 403) {
      snackbarStore.showSnackbar(response.message, 'error')

      return navigateTo(`/order/${route?.params?.group == 'notification' ? 'my' : route?.params?.group}`)
    }
  }
  catch (error) {
    console.error('Error updating status:', error)
    snackbarStore.showSnackbar(
      'Failed to update status. Please try again.',
      'error',
    )
  }
  finally {
    loaderStore.hideLoader()
    selectedPics.value = []
  }
}

const handleClick = (status, text) => {
  dialogMsg.value = text
  selectedStatus.value = status
  isConfirmDialogVisible.value = !isConfirmDialogVisible.value
}
const handleLogisticClick = (status) => {
  selectedStatus.value = status
  isLogisticDialogVisible.value = !isLogisticDialogVisible.value
}

const handleConfirm = async value => {
  if (value) {
    if (
      [
        orderStatusCodes.isDeliveryRefused,
        orderStatusCodes.isRejected,
      ].includes(selectedStatus.value)
    ) {
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

const handleTransfer = async () => {

  const payload = {
    selectedVendor: selectedVendor.value,
    orderId: orderData.value.id
  }

  if(orderData?.value.order_type.toUpperCase() != 'NORMAL') {
    snackbarStore.showSnackbar('Exclusive or B-category orders cannot be assigned to vendors', 'error')
    return;
  }

  if (!selectedVendor.value) {
    snackbarStore.showSnackbar('Please select vendro before submitting', 'error')
    return;
  }
  const response = await apiRequestObj.makeRequest(
    `common/order/vendorTransfer`,
    'post',
    payload,
  )


  if (response?.success) {
    snackbarStore.showSnackbar('Order Transferred Successfully', 'success')
    return navigateTo(`/order/vendor/${response?.data?.uid}`)
  }


}

const saveLogisticsData = async (payload) => {

    const response = await apiRequestObj.makeRequest(
      `haier/logistics/save/${orderData.value.uid}`,
      'post',
      payload,
    )
    console.log('logistic');
    console.log(response);
  if (response?.success) {
    orderData.value = transformData(response.data)
    isLogisticDialogVisible.value = false;
    showLogisticCard.value = true;


       
    }
    
  
};

const handleLogisticDialog = async () => {

  if (!selectedLogistic.value || !courierVendorDnNo.value) {

    snackbarStore.showSnackbar('Please fill in all required fields before submitting', 'error')
    return; // Stop execution
  }

  const payload = {
    logistic: selectedLogistic.value,
    courierVendorDnNo: courierVendorDnNo.value 
  }

  await Promise.all([
    updateStatus(), // First API
    saveLogisticsData(payload), // Second API
  ])
  isLogisticDialogVisible.value = false;
  showLogisticCard.value = true;
}


const handleReasonDialog = async () => {
  if (
    selectedStatus.value == orderStatusCodes.isRejected
    || selectedStatus.value == orderStatusCodes.isDeliveryRefused
  ) {
    if (selectedReason.value === 'Other') {
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
    if (
      isEmpty(selectedPics.value)
      || selectedPics.value.length > 5
      || !max6mbValidator(selectedPics.value)
      || !imageFileValidator(selectedPics.value)
    ) {
      snackbarStore.showSnackbar(
        'Please add between 1 to 5 images/pdf, and each must not be more than 6MB.',
        'error',
      )

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
  if (files && files.length > 0) {
    if (selectedPics.value.length + files.length > 5) {
      snackbarStore.showSnackbar(
        'Please add between 1 to 5 images/pdf, and each must not be more than 6MB.',
        'error',
      )

      return
    }
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
    return new Promise(resolve => {
      if (file.type === 'application/pdf') {
        // Use PDF logo for the preview and store the PDF file URL
        const pdfUrl = URL.createObjectURL(file)

        pdfFiles.value.push(pdfUrl) // Store PDF URLs for later access
        resolve(pdfLogo) // Use PDF logo as the preview
      }
      else {
        const reader = new FileReader()

        reader.onloadend = () => resolve(reader.result)
        reader.readAsDataURL(file)
      }
    })
  })

  // Once all files have been processed, update the previews array
  Promise.all(previews).then(urls => {
    imagePreviews.value = urls
  })
}

// Remove selected file from the list
function removeFile(index) {
  if (pdfFiles.value[index]) {
    URL.revokeObjectURL(pdfFiles.value[index]) // Revoke URL for cleanup
    pdfFiles.value.splice(index, 1)
  }
  imagePreviews.value.splice(index, 1)
  selectedPics.value.splice(index, 1)
}

const resolveMethod = (status: string) => {
  if (status === 'COD')
    return { text: 'COD', color: 'warning' }
  if (status === 'Card')
    return { text: 'Card', color: 'success' }
  if (status === 'EasyPaisa' || status === 'Easy_Paisa')
    return { text: 'EasyPaisa', color: 'error' }
  if (status === 'jazzCash' || status === 'jazz_Cash')
    return { text: 'jazzCash', color: 'info' }

  return { text: status.replace('_', ' '), color: 'info' }
}

const resolveType = (type: string) => {
  if (type === 'NORMAL')
    return { text: 'NORMAL', color: 'info' }
  if (type === 'EXCLUSIVE')
    return { text: 'EXCLUSIVE', color: 'primary' }

  return { text: type, color: 'warning' }
}

onMounted(async () => {
  await fetchData()
  fetchLogistics();
})

const headers = [
  { title: 'Product', key: 'productName' },
  { title: 'Variation', key: 'variations' },
  { title: 'Quantity', key: 'quantity' },
  { title: 'Price', key: 'price', align: 'end' },
]

const rejectionHeaders = [
  { title: 'Rejection Reason', key: 'rejectionReason' },
  { title: 'Vendor Name', key: 'vendorName' },
  { title: 'Rejected On', key: 'rejectedOn' },
]

if (authUser.user_type === 'haier')
  headers.push({ title: 'Product Type', key: 'type', sortable: false, align: 'end' })
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
            <VChip v-if="orderData?.status" v-bind="resolveOrderStatus(orderData?.status)" label size="small" />
          </div>
        </div>
        <div class="text-body-1">
          {{ new Date(orderData?.date).toLocaleString() }}
        </div>
        <div class="d-flex gap-2 align-center mb-2 flex-wrap">
          <h5 class="text-h5">
            Payment Method
          </h5>
          <div class="d-flex gap-x-2">
            <VChip v-if="orderData?.method" v-bind="resolveMethod(orderData?.method)" label size="small" />
          </div>
        </div>
      </div>
      <div v-if="(authUser.user_type === 'haier' && route.params.group !== 'vendor') || authUser.user_type === 'vendor'"
        class="d-flex gap-x-2">
        <PrintOrderDetail :order-data="orderData" :order-detail="orderDetail" :subtotal="subtotal" :Total="Total"
          :user-data="userData" />
        <VBtn v-if="(orderData?.status == orderStatusCodes.isExclusive && authUser.user_type == 'vendor') || (orderData?.status == orderStatusCodes.isHaier && orderData?.order_type == 'NORMAL' && orderData?.POD == 'COD' )" variant="tonal" color="error" @click="
            handleClick(
              orderStatusCodes.isPublic,
              'Do you confirm you want to move the order to public?',
            )
            ">
          Move to Public
        </VBtn>
        <div v-if="authUser.user_type == 'vendor'" class="d-flex gap-x-2">
          <VBtn v-if="
            (orderData?.status == orderStatusCodes.isExclusive || orderData?.status == orderStatusCodes.isPublic)
            && (!orderData?.hidden || !orderData?.hidden?.includes(String(authUser.vendor_id)))
          " variant="tonal" color="primary" @click="
              handleClick(
                orderStatusCodes.isPicked,
                'Do you confirm you want to pick up the order?',
              )
              ">
            Pick
          </VBtn>
          <VBtn v-if="orderData?.status == orderStatusCodes.isPicked || orderData?.status == orderStatusCodes.isAssignedByHaier" variant="tonal" color="error" @click="
            handleClick(
              orderStatusCodes.isRejected,
              'Do you confirm you want to Reject Order?',
            )
            ">
            Reject Order
          </VBtn>
        </div>
        
            <VBtn
      v-if="orderData?.status == orderStatusCodes.isPicked || orderData?.status == orderStatusCodes.isReadyToShip || orderData?.status == orderStatusCodes.isAssignedByHaier"
      variant="tonal"
      color="primary"
      @click="authUser.user_type === 'haier' && route.params.group !== 'vendor'
        ? handleLogisticClick(orderStatusCodes.isOutForDelivery)
        : handleClick(
            orderStatusCodes.isOutForDelivery,
            'Do you confirm you want to deliver the order now?'
          )"
    >
      Deliver Now
      </VBtn>
        <VBtn
          v-if="(orderData?.status == orderStatusCodes.isRejected || orderData?.status == orderStatusCodes.isDeliveryTimeout || orderData?.status == orderStatusCodes.isHaier) && (orderData?.POD == 'COD')"
          variant="tonal" color="error" @click="isTransferDialogVisible = !isTransferDialogVisible">
          Transfer Order
        </VBtn>

        <VBtn
          v-if="orderData?.status == orderStatusCodes.isHaier || orderData?.status == orderStatusCodes.isDeliveryTimeout || orderData?.status == orderStatusCodes.isRejected"
          variant="tonal" color="primary" @click="
            handleClick(
              orderStatusCodes.isReadyToShip,
              'Do you confirm that the order is ready to ship now?',
            )
            ">
          Ready To Ship
        </VBtn>

        <VBtn v-if="orderData?.status == orderStatusCodes.isOutForDelivery" variant="tonal" color="primary" @click="
          handleClick(
            orderStatusCodes.isClosed,
            'Do you confirm you Delivered the Order?',
          )
          ">
          Delivered
        </VBtn>

        <VBtn v-if="orderData?.status == orderStatusCodes.isOutForDelivery" variant="tonal" color="error" @click="
          handleClick(
            orderStatusCodes.isDeliveryRefused,
            'Do you confirm you want to refuse the delivery of this order?',
          )
          ">
          Delivery Refused
        </VBtn>
      </div>
      <div v-else>
        <PrintOrderDetail :order-data="orderData" :order-detail="orderDetail" :subtotal="subtotal" :Total="Total"
          :user-data="userData" />
      </div>
    </div>

    <VRow>
      <VCol cols="12" md="12">
        <!-- 👉 Order Details -->
        <VCard class="mb-6">
          <VCardItem>
            <template #title>
              <div class="d-flex gap-x-2">
                <h5 class="text-h5">
                  Order Details
                </h5>
              </div>
            </template>
          </VCardItem>

          <VDivider />
          <VDataTable :headers="headers" :items="orderDetail" item-value="productName" class="text-no-wrap">
            <template #item.productName="{ item }">
              <div class="d-flex gap-x-3 align-center">
                <VAvatar size="34" :image="item.productImage" :rounded="0" />

                <div class="d-flex flex-column align-start text-wrap w-100">
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

            <template #item.variations="{ item }">
              <div v-for="(variation, index) in item.variations" :key="index" class="text-body-1 text-wrap w-100">
                {{ variation.name }}
              </div>
            </template>
            <template #item.type="{ item }">
              <VChip v-if="item.type && authUser.user_type === 'haier'" v-bind="resolveType(item.type)" label
                size="small" />
            </template>
            <template #item.quantity="{ item }">
              <div v-for="(variation, index) in item.variations" :key="index" class="text-body-1">
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
                    <td class="text-high-emphasis font-weight-medium" width="200px">
                      Total:
                    </td>
                    <td class="font-weight-medium">
                      <span class="font-weight-light">PKR </span>{{ Total }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </VCardText>
        </VCard>
      </VCol>
      <VRow class="d-flex align-stretch" style="margin: auto; gap: 16px;">
        <!-- Customer Details -->
        <VCol v-show="true" :class="showRejectionCard || showLogisticCard ? 'col-4' : 'col-6'">
          <VCard class="mb-6 h-100">
            <VCardText class="d-flex flex-column gap-y-6">
              <h5 class="text-h5">Customer Details</h5>
              <div>
                <h6 class="text-h6">Customer Name: {{ userData?.fullName }}</h6>
              </div>
              <div>
                <h6 class="text-h6">Contact Info:</h6>
                <span v-if="orderData?.status === orderStatusCodes.isPublic || orderData?.status === orderStatusCodes.isDeliveryTimeout">
                  Mobile: 03*******{{ userData?.contact.slice(-2) }}
                </span>
                <span v-else>Mobile: {{ userData?.contact }}</span>
              </div>
            </VCardText>
          </VCard>
        </VCol>
      
        <!-- Shipping Address -->
        <VCol v-show="true" :class="showRejectionCard || showLogisticCard ? 'col-4' : 'col-6'">
          <VCard class="mb-6 h-100">
            <VCardText class="d-flex flex-column gap-y-6">
              <h5 class="text-h5">Shipping Address</h5>
              <div class="text-body-1">
                {{ userData?.address }} <br />
                {{ userData?.city }} <br />
                {{ userData?.province }} {{ userData?.country }}
              </div>
            </VCardText>
          </VCard>
        </VCol>
      
        <!-- Rejection Reason -->
        <VCol v-if="!showRejectionTable  && showRejectionCard" class="col-4">
          <VCard class="mb-6 h-100">
            <VCardText class="d-flex flex-column gap-y-6">
              <h5 class="text-h5">Delivery Refusal Reason</h5>
              <div class="text-body-1">
                {{ reasonDetail[0]?.rejectionReason || 'No reason provided' }}
              </div>
            </VCardText>
          </VCard>
        </VCol>
      
        <!-- Logistic Card -->
        <VCol v-if="authUser.user_type === 'haier' && route.params.group !== 'vendor' && showLogisticCard" class="col-4">
          <VCard class="mb-6 h-100">
            <VCardText class="d-flex flex-column gap-y-6">
              <h5 class="text-h5">Logistic Information</h5>
              <div class="d-flex flex-column gap-y-4">
                <div>
                  <h6 class="text-h6">Logistic Type: {{ orderData.logistics_company_id }}</h6>
                </div>
                <div>
                  <h6 class="text-h6">
                    <template v-if="orderData?.logistics_company_id === 'Haier Logistics'">
                      DN No: {{ orderData?.courier_vendor_no || 'N/A' }}
                    </template>
                    <template v-else-if="orderData?.logistics_company_id === 'Other'">
                      Vendor ID: {{ orderData?.courier_vendor_no || 'N/A' }}
                    </template>
                    <template v-else-if="['LCS', 'TCS'].includes(orderData?.logistics_company_id)">
                      Courier ID: {{ orderData?.courier_vendor_no || 'N/A' }}
                    </template>
                    <template v-else>
                      No data available
                    </template>
                  </h6>
                </div>
              </div>
            </VCardText>
          </VCard>
        </VCol>
      </VRow>
      
      


      <VCol cols="12" md="12"
        v-if="(authUser.user_type === 'haier' && route.params.group !== 'vendor') && showRejectionTable == true">
        <!-- 👉 Order Details -->
        <VCard class="mb-6">
          <VCardItem>
            <template #title>
              <div class="d-flex gap-x-2">
                <h5 class="text-h5">
                  Rejection Reasons
                </h5>
              </div>
            </template>
          </VCardItem>

          <VDivider />
          <VDataTable :headers="rejectionHeaders" :items="reasonDetail" item-value="orderReason"
            class="text-no-wrap">
            <template #item.rejectionReason="{ item }">


              <span class="text-body-1">
                {{ item.rejectionReason }}
              </span>
            </template>

            <template #item.vendorName="{ item }">
              <div class="text-body-1">
                {{ item.vendorName }}
              </div>
            </template>
            <template #item.rejectedOn="{ item }">
              <div class="text-body-1">
                {{ new Date(item.rejectedOn).toLocaleDateString() }} {{  new Date(item.rejectedOn).toLocaleTimeString() }}
              </div>
            </template>


            <template #bottom />
          </VDataTable>
          <VDivider />

          <VCardText>
            <div class="d-flex align-end flex-column">

            </div>
          </VCardText>
        </VCard>
      </VCol>


      <!-- 👉  Media -->
      <VCol cols="12" md="12">
        <VCard v-if="orderData.status == orderStatusCodes.isClosed || orderData.status == orderStatusCodes.isDelivered"
          class="mb-6">
          <VCardItem>
            <VCardTitle>POD files</VCardTitle>
          </VCardItem>

          <VCardText>
            <div v-for="(pod, index) in orderData?.POD" :key="index" class="preview-container mr-2 cursor-pointer"
              @click="async () => {
                if (pod.media_type == 'pdf') {
                  await navigateTo(pod.media_name, {
                    open: {
                      target: '_blank',
                    },
                  })
                }
                else {

                  podUrl = pod.media_name
                  isPodVisible = !isPodVisible
                }
              }">
              <VImg v-if="pod.media_type == 'pdf'" :src="pdfLogo" height="150" width="150" :cover="true"
                :alt="orderData?.order_no" />
              <VImg v-else :src="pod.media_name" height="150" width="150" :cover="true" :alt="orderData?.order_no" />
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <ConfirmDialog v-model:isDialogVisible="isConfirmDialogVisible" :confirmation-question="dialogMsg"
      cancel-msg="Request cancelled!!" cancel-title="Cancelled" confirm-msg="Your order status changed successfully."
      confirm-title="Confirmed" @confirm="handleConfirm" />
<!--    Transfer Order-->
    <VDialog v-model="isTransferDialogVisible" max-width="500">
      <VCard>
        <VCardText class="text-center px-10 py-6">
          <VRow cols="12" sm="8">
            <h2>Transfer Order</h2>
            <VCol cols="12">
              <v-autocomplete
                v-model="selectedVendor"
                label="Select Vendor"
                :items="vendorsList"
                :rules="[requiredValidator]"
                :clearable="disabled"
                :clear-icon="tabler-x"
                :class="text-left"
              ></v-autocomplete>

            </VCol>
            
          </VRow>

          <VCardText class="d-flex align-center justify-center gap-2">
            <VBtn color="success" @click="handleTransfer">
              Transfer
            </VBtn>

            <VBtn color="secondary" variant="tonal" @click="() => {
                selectedPics = [];
                selectedReason = null;
                customReason = null;
                isReasonDialogVisible = false;
                isLogisticDialogVisible = false;
                isTransferDialogVisible = false;

              }
              ">
              Cancel
            </VBtn>
          </VCardText>
        </VCardText>
      </VCard>
    </VDialog>
    <VDialog v-model="isLogisticDialogVisible" max-width="500">
      <VCard>
        <VCardText class="text-center px-10 py-6">
          <VRow cols="12" sm="8">
            <h2>Delivery information</h2>
            <VCol cols="12">

              <AppSelect v-model="selectedLogistic" label="Select Logistics" placeholder="Select Logistics"
                         :items="logistics" clearable clear-icon="tabler-x" class="text-left" :rules="[ requiredValidator ]"
                          />
            </VCol>

            <VCol v-if="selectedLogistic == 'Other'" cols="12">
              <AppTextField v-model="courierVendorDnNo" class="text-left" label="Vendor ID" placeholder="Enter Vendor ID"
                            :rules="[ requiredValidator ]" />
            </VCol>

            <VCol v-if="selectedLogistic == 'TCS' || selectedLogistic == 'LCS'" cols="12">
              <AppTextField v-model="courierVendorDnNo" class="text-left" label="Courier No" placeholder="Enter Courier No"
                            :rules="[ requiredValidator ]" />
            </VCol>

            <VCol v-if="selectedLogistic === 'Haier Logistics'" cols="12">
              <AppTextField
                v-model="courierVendorDnNo"
                label="DN No"
                placeholder="Enter DN No"
                :rules="[requiredValidator]"
                class="text-left"
              />
            </VCol>

          </VRow>

          <VCardText class="d-flex align-center justify-center gap-2">
            <VBtn color="success" @click="handleLogisticDialog">
              Confirm
            </VBtn>

            <VBtn color="secondary" variant="tonal" @click="() => {
                selectedPics = [];
                selectedReason = null;
                customReason = null;
                isReasonDialogVisible = false;
                isLogisticDialogVisible = false;
              }
              ">
              Cancel
            </VBtn>
          </VCardText>
        </VCardText>
      </VCard>
    </VDialog>
    <VDialog v-model="isReasonDialogVisible" max-width="500">
      <VCard>
        <VCardText class="text-center px-10 py-6">
          <VRow cols="12" sm="8">
            <VCol cols="12">
              <div v-if="selectedStatus === orderStatusCodes.isClosed">
                <div class="d-flex align-center gap-x-1">
                  <VFileInput id="pod-files" ref="fileInput" v-model="inputPics" :disabled="selectedPics.length == 5"
                    show-size accept="image/png, image/jpeg, image/bmp, .pdf"
                    label="POD Files: images/pdf must be between 1-5" prepend-icon="tabler-camera" multiple :rules="[
                      maxFiveFilesValidator,
                      max6mbValidator,
                      imageFileValidator,
                    ]" @change="handleFileChange" @click:clear="handleFileChange" />
                  <VBtn icon="tabler-plus" size="24" color="primary" :disabled="selectedPics.length == 5" @click="() => $refs.fileInput.$el.querySelector('input').click()
                    " />
                </div>

                <!-- Updated Preview Section -->
                <VCol v-if="imagePreviews.length > 0" class="d-flex justify-center flex-wrap gap-3">
                  <div v-for="(preview, index) in imagePreviews" :key="index"
                    class="preview-container position-relative">
                    <VImg :src="preview" height="150" width="150" alt="Preview" :cover="true" />
                    <VBtn icon="tabler-x" size="20" color="error" class="remove-btn" :rounded="0"
                      @click="removeFile(index)" />
                  </div>
                </VCol>
              </div>

              <AppSelect v-else v-model="selectedReason" label="Select Reason:" placeholder="Please Select your Reason"
                :items="reasons" clearable clear-icon="tabler-x" class="text-left" :rules="[requiredValidator]" />
            </VCol>

            <VCol v-if="selectedReason == 'Other'" cols="12">
              <AppTextarea v-model="customReason" placeholder="Type Reason" label="Reason:" class="text-left"
                :rules="[requiredValidator]" />
            </VCol>
          </VRow>

          <VCardText class="d-flex align-center justify-center gap-2">
            <VBtn color="success" @click="handleReasonDialog">
              Ok
            </VBtn>

            <VBtn color="secondary" variant="tonal" @click="() => {
                selectedPics = [];
                selectedReason = null;
                customReason = null;
                isReasonDialogVisible = false;
              }
              ">
              Cancel
            </VBtn>
          </VCardText>
        </VCardText>
      </VCard>
    </VDialog>
    <VDialog v-model="isPodVisible" max-width="600">
      <VCard>
        <VCardText class="text-center px-10 py-6">
          <VRow cols="12" sm="8">
            <VCol cols="12">
              <VImg :src="podUrl" height="100%" width="100%" :cover="true" alt="Image" />
            </VCol>
          </VRow>

          <VCardText class="d-flex align-center justify-end">
            <VBtn color="primary" variant="tonal" @click="() => {
                podUrl = null
                isPodVisible = false
              }
              ">
              Close
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
  top: 0px;
  right: 0px;
}

.preview-container {
  position: relative;
  display: inline-block;
}
</style>
