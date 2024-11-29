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
  { title: 'ID', key: 'id' },
  { title: 'Vendor ID', key: 'uid' },
  { title: 'Vendor', key: 'vendor' },
  { title: 'Contact', key: 'contact' },
  { title: 'Create Time', key: 'created_at' },
  { title: 'Actions', key: 'actions', sortable: false },
];

// Navigate to Add New Vendor page
const goToAddVendorPage = () => {
  router.push('/management/add-vendor'); // Navigates to /add-vendor
};

const detailsVendor = (vendorId: string) => {
  router.push({
    path: `/management/${vendorId}`,
    query: { mode: 'details' },
  });
};

const editVendor = (vendorId: string) => {
  router.push({
    path: `/management/${vendorId}`,
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

// Delete a vendor
const deleteVendor = async (id: string) => {
  vendorsData.value.vendors = vendorsData.value.vendors.filter(vendor => vendor.id !== id);

  try {
    const response = await apiRequestObj.makeRequest(
      `haier/vendor/delete/${id}`,
      'DELETE'
    );
    if (response?.success) {
      snackBarStore.showSnackbar('Vendor Deleted Successfully.', 'success');
      fetchVendors(); 
    } else {
      snackBarStore.showSnackbar('Failed to delete vendor.', 'error');
      
      fetchVendors();
    }
  } catch (error) {
    console.error('Error deleting vendor:', error);
    snackBarStore.showSnackbar('Error deleting vendor, please try again.', 'error');
    // Re-fetch the vendor list in case of an error
    fetchVendors();
  }
};



// Watch for changes in filters or pagination
watch([page, searchQuery, itemsPerPage], () => {
  fetchVendors();
});

const formatRelativeTime = (date: string) => {
  return moment(date).fromNow();
};

onMounted(fetchVendors);
</script>

<template>
  <section>
    <!-- Header Section with Add New Vendor Button -->
    <VRow justify="space-between" class="mb-6 align-center">
      <VCol cols="12" sm="6">
        <AppTextField v-model="searchQuery" placeholder="Search Vendors" />
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
        <VRow>
          <!-- Items Per Page -->
          <VCol cols="12" sm="4">
            <AppSelect
              v-model="itemsPerPage"
              :items="[10, 20, 50, 100]"
              label="Items Per Page"
            />
          </VCol>
        </VRow>
      </VCardText>
    </VCard>

    <!-- Vendors Table -->
    <VDataTableServer
      v-model:items-per-page="itemsPerPage"
      v-model:model-value="selectedRows"
      v-model:page="page"
      :items="vendorsData.vendors"
      item-value="id"
      :items-length="vendorsData.total"
      :headers="headers"
      class="text-no-wrap"
      show-select
    >
      <template #item.id="{ item }">
        <NuxtLink>
          #{{ item.id }}
        </NuxtLink>
      </template>
      <template #item.created_at="{ item }">
        {{ formatRelativeTime(item.created_at) }}
      </template>
      <template #item.vendor="{ item }">
        <div>
          <small>{{ item.name }}</small><br />
          <small>{{ item.city }}</small><br />
          <small class="address-text-multiline">{{ item.address }}</small>
        </div>
      </template>

      <template #item.contact="{ item }">
        <div>
          <small>{{ item.telephone }}</small><br />
          <small>{{ item.email }}</small>
        </div>
      </template>

      <!-- Actions -->
      <template #item.actions="{ item }">

        <IconBtn @click="detailsVendor(item.uid)">
          <VIcon icon="tabler-eye" />
        </IconBtn>

        <IconBtn @click="deleteVendor(item.uid)">
          <VIcon icon="tabler-trash" />
        </IconBtn>

        <IconBtn @click="editVendor(item.uid)">
          <VIcon icon="tabler-pencil" />
        </IconBtn>
      </template>

      <!-- Pagination -->
      <template #bottom>
        <TablePagination
          v-model:page="page"
          :items-per-page="itemsPerPage"
          :total-items="vendorsData.total"
        />
      </template>
    </VDataTableServer>
  </section>
</template>
<style scoped>
.address-text-multiline {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;     /* Limit to 2 lines */
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 250px;          /* Limit the maximum width, adjust as needed */
}
</style>
