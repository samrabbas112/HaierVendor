<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import moment from 'moment';
const snackBarStore = useSnackbarStore();
import { useLoaderStore } from '@/stores/loader'


// State
const searchQuery = ref('');
const vendorsData = ref({ total: 0, vendors: [] });
const selectedRows = ref([]);
const router = useRouter();
const loaderStore = useLoaderStore()
const isConfirmDialogVisible = ref(false)
const selectedVendorId = ref()
const selectedVendorStatus = ref()




// Data table options
const itemsPerPage = ref(10);
const page = ref(1);
const apiRequestObj = useApi();

// Resolve user status for the UI
const resolveUserStatusVariant = (stat: string) => {
  const statLowerCase = stat.toLowerCase();
  if (statLowerCase === 'pending') return 'warning';
  if (statLowerCase === 'active') return 'success';
  if (statLowerCase === 'inactive') return 'secondary';
  return 'primary';
};

// Headers for the data table
const headers = [
  { title: 'SN', key: 'id' },
  { title: 'Vendor ID', key: 'uid' },
  { title: 'Vendor', key: 'vendor' },
  { title: 'Contact', key: 'contact' },
  { title: 'Create Time', key: 'created_at' },
  { title: 'Status', key: 'status' },
  { title: 'Actions', key: 'actions', sortable: false },
];

const vendorStatus = [
  { title: 'Active', value: 1 },
  { title: 'inActive', value: 0 },

]

// Navigate to Add New Vendor page
const goToAddVendorPage = () => {
  router.push('/management/vendors/add-vendor'); // Navigates to /add-vendor
};

const detailsVendor = (vendorId: string) => {
  router.push({
    path: `/management/vendors/${vendorId}`,
    query: { mode: 'details' },
  });
};

const editVendor = (vendorId: string) => {
  router.push({
    path: `/management/vendors/${vendorId}`,
    query: { mode: 'edit' },
  });
};


// Fetch vendors from the API
const fetchVendors = async () => {

  loaderStore.showLoader();

  try {
    const response = await apiRequestObj.makeRequest(
      'haier/vendor/list',
      'get',
      '',
      {
        page: page.value,
        itemsPerPage: itemsPerPage.value,
        query: searchQuery.value,
        status: selectedVendorStatus.value,
      }
    );

    if (response?.success) {
      vendorsData.value = {
        total: response.data.total,
        vendors: response.data.vendors,
      };

    }
  } catch (error) {
    console.error('Error fetching vendors:', error);
  }
  loaderStore.hideLoader();

};

// Delete a customer
const handleConfirm = async (value) => {
  if (value) {
    loaderStore.showLoader();
    try {
      const response = await apiRequestObj.makeRequest(
        `haier/vendor/delete/${selectedVendorId.value}`,
        'DELETE'
      );
      console.log('kk');
      if (response?.success) {
        await fetchVendors();
      } else {
        console.log('noce');
      }
    } catch (error) {
      console.error('Error deleting vendor:', error);
      snackBarStore.showSnackbar('Error deleting vendor, please try again.', 'error');
      // Re-fetch the vendor list in case of an error
      // fetchVendors();
    }
   
  }
};

const capitalizedLabel = (label: boolean) => {
  const convertLabelText = label.toString()

  return convertLabelText.charAt(0).toUpperCase() + convertLabelText.slice(1)
}

// Delete a vendor
const deleteVendor = async (id: string) => {
  selectedVendorId.value = id
  isConfirmDialogVisible.value = !isConfirmDialogVisible.value
};


const formatRelativeTime = (date: string) => {
  return moment(date).fromNow();
};

const handleStatusToggle = async(item) =>{
   loaderStore.showLoader()
   const response = await apiRequestObj.makeRequest(`haier/vendor/update-status/${item.uid}`,'get');
   snackBarStore.showSnackbar(response.message || 'Something went wrong');
   loaderStore.hideLoader();
}


onMounted(fetchVendors);
</script>

<template>
  <section>
    <!-- Header Section with Add New Vendor Button -->
    <VRow justify="space-between" class="mb-6 align-center">
      <VCol cols="12" sm="6">
      </VCol>
      <VCol cols="12" sm="6" class="text-end">
        <VBtn prepend-icon="tabler-plus" color="primary" @click="goToAddVendorPage">
          Add New Vendor
        </VBtn>
      </VCol>
    </VRow>

    <!-- Filters Section -->
    <VCard class="mb-6">
      <VCardText>
        <VRow cols="12" sm="8">
          <!-- Search Vendors -->
          <VCol cols="12" sm="3">
            <AppTextField v-model="searchQuery" placeholder="Search by name" />
          </VCol>
          <VCol cols="12" sm="3">
            <AppSelect
            v-model="selectedVendorStatus"
            placeholder="Select Vendor Status"
            :items="vendorStatus"
            clearable
            clear-icon="tabler-x"
          />
          </VCol>
          <VCol cols="12" sm="3">
            <div class="d-flex">
              <VBtn class="me-2" variant="outlined" color="secondary" @click="() => {
                searchQuery = '';
                page = 1;
                fetchVendors();
              }">
                Reset
              </VBtn>
              <VBtn variant="flat" @click="() => {
                page = 1;
                fetchVendors();
              }">
                Search
              </VBtn>
            </div>
          </VCol>
        </VRow>
      </VCardText>
    </VCard>

    <!-- Vendors Table -->
    <VDataTableServer v-model:items-per-page="itemsPerPage" v-model:model-value="selectedRows" v-model:page="page"
      :items="vendorsData.vendors" item-value="id" :items-length="vendorsData.total" :headers="headers"
      class="text-no-wrap" @update:options="">
      <template #item.id="{ index }">
        <NuxtLink>
          <!-- {{ item.id }} -->
          {{ (page - 1) * itemsPerPage + index + 1 }}
        </NuxtLink>
      </template>
      <template #item.vendor="{ item }">
        <small>{{ item.city}}</small><br>
        <small>{{ item.address}}</small>
  
      </template>

      <template #item.contact="{ item }">
        <small>{{ item.telephone}}</small><br>
        <small>{{ item.email}}</small>
  
      </template>
      
      <template #item.created_at="{ item }">
        {{ new Date(item.created_at).toDateString() }}
      </template>

      <!-- Status -->
      <template #item.confirmed="{ item }">
        <VChip :color="resolveUserStatusVariant(item.confirmed)" size="small" label class="text-capitalize">
          {{ item.confirmed == 1 ? 'Active' : 'Inactive' }}
        </VChip>
      </template>

      <template #item.status="{ item }">
        <VSwitch
         v-model="item.status"
         :label="capitalizedLabel(item.status?'Active' : 'inActive')"
         @change="handleStatusToggle(item)"
        />
      </template>

      <!-- Actions -->
      <template #item.actions="{ item }">
        <IconBtn @click="deleteVendor(item.uid)">
          <VIcon icon="tabler-trash" />
        </IconBtn>
        <IconBtn @click="editVendor(item.uid)">
          <VIcon icon="tabler-pencil" />
        </IconBtn>
        <IconBtn >
            <VIcon icon="tabler-dots-vertical" />
            <VMenu activator="parent">
              <VList>
                <VListItem
                  value="order"
                  :to="`/order/admin/vendor?user=${item.user.uid}`"
                >
                  Orders
                </VListItem>
                <VListItem
                  value="customer"
                  :to="`/management/customers?vendor=${item.uid}`"
                >
                  Customers
                </VListItem>
              </VList>
            </VMenu>
          </IconBtn>
      </template>

      <!-- Pagination -->
      <template #bottom>
        <TablePagination v-model:page="page" :items-per-page="itemsPerPage" :total-items="vendorsData.total" />
      </template>
    </VDataTableServer>

    <ConfirmDialog v-model:isDialogVisible="isConfirmDialogVisible"
      confirmation-question="Are you sure to want to delete" cancel-msg="Request cancelled!!" cancel-title="Cancelled"
      confirm-msg="Your order status changed successfully." confirm-title="Confirmed" @confirm="handleConfirm" />
  </section>
</template>
<style scoped>
.address-text-multiline {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  /* Limit to 2 lines */
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 250px;
  /* Limit the maximum width, adjust as needed */
}
</style>
