<script setup lang="ts">
import { orderStatusCodes } from '@/libs/order/order-status'
import pdfLogo from '@images/pdf-logo.png'

const apiRequestObj = useApi()
const snackbarStore = useSnackbarStore()
const loaderStore = useLoaderStore()
const notificationStore = useNotificationStore()

const searchQuery = ref("");
const selectedPaymentMethod = ref();
const selectedOrderStatus = ref();
const isDeliveredRefusalDialogVisible = ref(false);
const isConfirmDialogVisible = ref(false);
const selectedStatus = ref(12)
const selectedReason = ref()
const selectedPics = ref([])
const inputPics = ref([])
const fileInput = ref(null)
const customReason = ref(null)
const dialogMsg = ref('Are you sure')
const reasons = ref([])
const imagePreviews = ref([])
const isReasonDialogVisible = ref(false)
const selectedHaierOrderStatus = ref({})
const orderId = ref()
const pdfFiles = ref([])
const podUrl = ref(false)



const ordersData = ref({
  per_page: 10,
  current_page: 1,
  total: 0,
  orders: [],
})

const authUser = useCookie('auth')

// Data table Headers
const headers = [
  { title: "Sr. No.", key: "id", sortable: false },
  { title: "Order Info", key: "order", sortable: false },
  { title: "Product Info", key: "product", sortable: false },
  { title: "Total Price", key: "payment", sortable: false },
  { title: "Customer Info", key: "customer", sortable: false },
  // { title: "Payment Method", key: "method", sortable: false },
  // { title: "Placed At", key: "date", sortable: false },
  { title: "City", key: "city", sortable: false },
  { title: "Current Status", key: "status", sortable: false },
  { title: "Order Status", key: "haier_order_status", sortable: false },
  { title: "Action", key: "actions", sortable: false },
];

const paymentMethods = [
  { title: 'COD', value: 'COD' },
  { title: 'Card', value: 'Card' },
  { title: 'EasyPaisa', value: 'Easy_Paisa' },
  { title: 'JazzCash', value: 'Jazz_Cash' },
]

const orderStatus = [
  { title: "Out For Delivery", value: orderStatusCodes.isOutForDelivery },
  { title: "Delivery Refused", value: orderStatusCodes.isDeliveryRefused },
  { title: "Received", value: orderStatusCodes.isClosed },
  { title: "Ready To Ship", value: orderStatusCodes.isReadyToShip },
  { title: "Haier Operations", value: orderStatusCodes.isHaier },
  { title: "Delivery Timeout", value: orderStatusCodes.isDeliveryTimeout },
  { title: "Rejected", value: orderStatusCodes.isRejected },
  { title: "Cancelled", value: orderStatusCodes.isCancelled },
];
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
  'wrong customer information',
  'Delivery location mismatch',
  'Other',
]



const transformData = apiResponse => {
  return apiResponse.map(item => {
    const customer = item.customer

    return {
      id: item.id,
      uid: item.uid,
      order: item.order_no,
      customer: customer.name || "N/A",
      mobile: customer.mobile || "03XXXXXXXXXX",
      address: customer.address || "N/A",
      payment: Number.parseFloat(item.paymentAmount) || 0,
      status: item.pick_status.id || 1,
      method: item.payment_method || 'COD', // Payment method
      date: item.created_at,
      time: item.pick_before,
      city: item.city,
      products: item.orderProduct,
      haierOrderStatus: "N/A"
    };
  });
};

const orderHaierStatuses = [
  { title: "Ready To Ship", value: orderStatusCodes.isReadyToShip},
  { title: "Out For Delivery", value: orderStatusCodes.isOutForDelivery },
  { title: "Delivered/Refused", value: orderStatusCodes.isDelivered_Refused },
];

let previousSearchQuery = "";

const makeSearch = async page => {
  // return console.log("search api hit", typeof page, searchQuery.value, page);
  console.log('search function hit', searchQuery.value)

  // Check if searchQuery has changed, reset page to 1 if it has
  if (searchQuery.value !== previousSearchQuery)
    page = 1 // Reset to page 1 if the search query has changed

  const formData = {
    order_no: searchQuery.value,
    order_status: selectedOrderStatus.value,
    payment_status: selectedPaymentMethod.value,
    vendor_id: authUser.value.user.user_id,
    order_type: 'my_orders',
  }

  try {
    loaderStore.showLoader()

    const response = await apiRequestObj.makeRequest(
      `common/order/list?page=${typeof page == 'number' ? page : 1}`,
      'post',
      formData,
    );
    console.log('samra');
    console.log(response?.data?.orders);
    if (response && response.success) {
      // Transform and set the data
      ordersData.value = {
        per_page: response?.data?.per_page,
        current_page: response?.data?.currentPage,
        total: response?.data?.total, // Set total count of orders
        orders: transformData(response?.data?.orders),
      };
    } else if (response?.code === 401 || response?.message === "Unauthenticated.") {
      snackbarStore.showSnackbar("Login session expired", "error");
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

  // Update the previous search query to the current one
  previousSearchQuery = searchQuery.value
}

onMounted(() => {
  makeSearch(1);
});

watch(() => notificationStore.notifications, (newNotifications, oldNotifications) => {
  if (newNotifications.length > oldNotifications.length)
    makeSearch(1) // Call makeSearch to update the order list
}, { deep: true });

const handleSelectedOrderStatus = (newSelectedStatus) => {
     
  if(newSelectedStatus == orderStatusCodes.isReadyToShip) {
    handleClick(orderStatusCodes.isReadyToShip, 'Do you confirm that the order is ready to ship now?');
  }

  else if(newSelectedStatus == orderStatusCodes.isOutForDelivery) {
    handleClick(orderStatusCodes.isOutForDelivery, 'Do you confirm you Delivered the Order?');

  } 

 else if(newSelectedStatus == orderStatusCodes.isDelivered_Refused){
    isDeliveredRefusalDialogVisible.value = !isDeliveredRefusalDialogVisible.value
  } 
};

const handleClick = (status, text) => {
  dialogMsg.value = text
  orderId.value = Object.keys(selectedHaierOrderStatus.value)[0]
  selectedHaierOrderStatus.value = {}
  selectedStatus.value = status
  isConfirmDialogVisible.value = !isConfirmDialogVisible.value
  isDeliveredRefusalDialogVisible.value = false
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
  else{
    selectedHaierOrderStatus.value = {}
  }
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
        'Please add between 1 to 5 images, and each must not be more than 6MB.',
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
        'Please add between 1 to 5 images, and each must not be more than 6MB.',
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
// Remove selected file from the list
function removeFile(index) {
  if (pdfFiles.value[index]) {
    URL.revokeObjectURL(pdfFiles.value[index]) // Revoke URL for cleanup
    pdfFiles.value.splice(index, 1)
  }
  imagePreviews.value.splice(index, 1)
  selectedPics.value.splice(index, 1)
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
      `common/order/update/status/${orderId.value}`,
      'post',
      requestData,
    )

    if (response?.success) {
      // orderData.value.status = response?.data?.pick_status?.id
      snackbarStore.showSnackbar(response.message, 'primary')
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
    makeSearch()
  }
}

watch([selectedOrderStatus, selectedPaymentMethod], () => {
  makeSearch();
});
</script>

<template>
  <CustomTable :headers="headers" :data="ordersData" from="haier" :orderHaierStatus="orderHaierStatuses" :selectedHaierOrderStatus="selectedHaierOrderStatus"
    @update:page="makeSearch"  :handleSelectedOrderStatus="handleSelectedOrderStatus">
    <VCardText>
      <VRow
        cols="12"
        sm="8"
      >
        <!-- 👉 Select Status -->
        <VCol
          cols="12"
          sm="3"
        >
          <AppTextField
            v-model="searchQuery"
            placeholder="Search Order#"
            @keypress.enter="makeSearch"
          />
        </VCol>
        <VCol cols="12" sm="3">
          <AppSelect v-model="selectedOrderStatus" placeholder="Select Order Status" :items="orderStatus" clearable
            clear-icon="tabler-x" />
        </VCol>
        <VCol cols="12" sm="3">
          <AppSelect v-model="selectedPaymentMethod" placeholder="Select Payment Method" :items="paymentMethods"
            clearable clear-icon="tabler-x" />
        </VCol>

        <VCol
          cols="12"
          sm="3"
        >
          <div class="d-flex">
            <VBtn class="me-2" variant="outlined" color="secondary" @click="() => {
                searchQuery = '';
                selectedOrderStatus = null;
                selectedPaymentMethod = null;
                makeSearch(1);
              }
              ">
              Reset
            </VBtn>
            <VBtn
              variant="flat"
              @click="makeSearch"
            >
              Search
            </VBtn>
          </div>
        </VCol>
      </VRow>
    </VCardText>
  </CustomTable>
  <ConfirmDialog
  v-model:isDialogVisible="isConfirmDialogVisible"
  :confirmation-question="dialogMsg"
  cancel-msg="Request cancelled!!"
  cancel-title="Cancelled"
  confirm-msg="Your order status changed successfully."
  confirm-title="Confirmed"
  @confirm="handleConfirm"
/>
<VDialog v-model="isDeliveredRefusalDialogVisible" max-width="500">
  <VCard>
    <VCardText class="text-center px-10 py-6">
      <!-- Adjust the styling for the 'Please Select' text -->
      <h3>Please Select One</h3>

      <!-- Action Buttons Section -->
      <VCardText class="d-flex align-center justify-center gap-4 mt-4">
        <VBtn
          color="error"
          @click="handleClick(orderStatusCodes.isDeliveryRefused, 'Do you confirm you want to refuse the delivery of this order?')"
        >
          Delivery Refused
        </VBtn>

        <VBtn
          color="success"
          variant="tonal"
          @click="handleClick(orderStatusCodes.isClosed, 'Do you confirm you Delivered the Order?')"
        >
          Delivered
        </VBtn>
      </VCardText>
    </VCardText>
  </VCard>
</VDialog>


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
                    :disabled="selectedPics.length == 5"
                    v-model="inputPics"
                    show-size
                    accept="image/png, image/jpeg, image/bmp, application/pdf"
                    label="POD Files: images/pdf must be between 1-5"
                    prepend-icon="tabler-camera"
                    multiple
                    :rules="[
                      maxFiveFilesValidator,
                      max6mbValidator,
                      imageFileValidator,
                    ]"
                    @change="handleFileChange"
                    @click:clear="handleFileChange"
                  />
                  <VBtn
                    icon="tabler-plus"
                    size="24"
                    color="primary"
                    :disabled="selectedPics.length == 5"
                    @click="
                      () => $refs.fileInput.$el.querySelector('input').click()
                    "
                  />
                </div>

                <!-- Updated Preview Section -->
                <VCol
                  v-if="imagePreviews.length > 0"
                  class="d-flex justify-center flex-wrap gap-3"
                >
                  <div
                    v-for="(preview, index) in imagePreviews"
                    :key="index"
                    class="preview-container position-relative"
                  >
                    <VImg
                      :src="preview"
                      height="150"
                      width="150"
                      alt="Preview"
                      :cover="true"
                    />
                    <VBtn
                      icon="tabler-x"
                      size="20"
                      color="error"
                      class="remove-btn"
                      :rounded=0
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
              v-if="selectedReason == 'Other'"
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
              @click="
                () => {
                  selectedPics = [];
                  selectedReason = null;
                  customReason = null;
                  isReasonDialogVisible = false;
                }
              "
            >
              Cancel
            </VBtn>
          </VCardText>
        </VCardText>
      </VCard>
  </VDialog>

</template>

<style lang="scss" scoped>
.customer-title:hover {
  color: rgba(var(--v-theme-primary)) !important;
}

.product-widget {
  border-block-end: 1px solid rgba(var(--v-theme-on-surface), var(--v-border-opacity));
  padding-block-end: 1rem;
}
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
