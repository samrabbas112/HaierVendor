<script setup lang="ts">
import AddNewCustomerDrawer from '@/views/customer/AddNewCustomerDrawer.vue'
import { ref, onMounted, watch, nextTick } from 'vue';
const snackBarStore = useSnackbarStore();
import { useLoaderStore } from '@/stores/loader'

// State
const searchQuery = ref('');
const selectedCustomer = ref(null);
const customersData = ref({ total: 0, customers: [] });
const isAddNewCustomerDrawerVisible = ref(false);
const selectedRows = ref([]);
const loaderStore = useLoaderStore()


// Data table options
const itemsPerPage = ref(10); 
const page = ref(1);
const apiRequestObj = useApi();

// Resolve user status for the UI
const resolveUserStatusVariant = (stat: string) => {
  const statLowerCase = stat.toLowerCase()
  if (statLowerCase === 'pending')
    return 'warning'
  if (statLowerCase === 'active')
    return 'success'
  if (statLowerCase === 'inactive')
    return 'secondary'

  return 'primary'
}

// Headers for the data table
const headers = [
  { title: 'ID', key: 'id' },
  { title: 'Name', key: 'name' },
  { title: 'Phone', key: 'phone_number' },
  { title: 'City', key: 'city' },
  { title: 'Status', key: 'confirmed' },
  { title: 'Registered At', key: 'created_at' },
  { title: 'Actions', key: 'actions', sortable: false },
];

// Fetch customers from the API
const fetchCustomers = async () => {
  loaderStore.showLoader();
  try {
    const response = await apiRequestObj.makeRequest('common/customer/list', 'get','', 
       {
        page: page.value,
        itemsPerPage: itemsPerPage.value,
        query: searchQuery.value,
      },
    );

    if (response?.success) {
      customersData.value = {
        total: response.data.total,
        customers: response.data.customers,
      };
    }
  } catch (error) {
    console.error('Error fetching customers:', error);
  }
  loaderStore.hideLoader();
};


// Delete a customer
const deleteCustomer = async (id) => {
  try {
    const response = await apiRequestObj.makeRequest(`common/customer/delete/${id}`, 'DELETE');
    if (response?.success) {
      snackBarStore.showSnackbar("Customer Deleted Successfully.", 'success')
      fetchCustomers();
    }
  } catch (error) {
    console.error('Error deleting customer:', error);
  }
};

// Handle Add New Customer
const addNewCustomer = () => {
  selectedCustomer.value = null;
  isAddNewCustomerDrawerVisible.value = true;
};

// Handle Edit Customer
const editCustomer = (customer) => {
  selectedCustomer.value = { ...customer };
  isAddNewCustomerDrawerVisible.value = true;
};

// Watch for changes in filters or pagination
watch([page, searchQuery, itemsPerPage], () => {
  fetchCustomers();
});



const handleCustomerUpdated = () => {
  fetchCustomers(); 
};

onMounted(fetchCustomers);
</script>


<template>
  <section>
    <!-- Header Section with Add New Customer Button -->
    <VRow justify="space-between" class="mb-6 align-center">
      <VCol cols="12" sm="6">
        <AppTextField v-model="searchQuery" placeholder="Search Customers" />
      </VCol>
      <VCol cols="12" sm="6" class="text-end">
        <VBtn prepend-icon="tabler-plus" color="primary" @click="addNewCustomer">
          Add New Customer
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

    <!-- Customers Table -->
    <VDataTableServer 
      v-model:items-per-page="itemsPerPage" 
      v-model:model-value="selectedRows" 
      v-model:page="page"
      :items="customersData.customers" 
      item-value="id" 
      :items-length="customersData.total" 
      :headers="headers"
      class="text-no-wrap" 
      show-select 
      @update:options="updateOptions"
    >
      <template #item.id="{ item }">
        <NuxtLink>
          #{{ item.id }}
        </NuxtLink>
      </template>
      <template #item.created_at="{ item }">
        {{ new Date(item.created_at).toDateString() }}
      </template>
      <!-- Status -->
      <template #item.confirmed="{ item }">
        <VChip :color="resolveUserStatusVariant(item.confirmed)" size="small" label class="text-capitalize">
          {{ item.confirmed == 1 ? 'Active' : 'InActive' }}
        </VChip>
      </template>

      <!-- Actions -->
      <template #item.actions="{ item }">
        <!-- Trash Icon Button -->
        <IconBtn @click="deleteCustomer(item.uid)">
          <VIcon icon="tabler-trash" />
        </IconBtn>

        <IconBtn @click="editCustomer(item)">
          <VIcon icon="tabler-pencil" />
        </IconBtn>
      </template>

      <!-- pagination -->
      <template #bottom>
        <TablePagination v-model:page="page" :items-per-page="itemsPerPage" :total-items="customersData.total" />
      </template>
    </VDataTableServer>

    <!-- Add/Edit Drawer -->
    <AddNewCustomerDrawer
      v-model:isDrawerOpen="isAddNewCustomerDrawerVisible"
      :customer="selectedCustomer"
      @customer-updated="handleCustomerUpdated"
    />
  </section>
</template>

