<script setup lang="ts">
import AddNewCustomerDrawer from '@/views/customer/AddNewCustomerDrawer.vue'
import { ref, onMounted, watch, nextTick } from 'vue';

// State
const searchQuery = ref('');
const selectedCustomer = ref(null);
const customersData = ref({ total: 0, customers: [] });
const isAddNewCustomerDrawerVisible = ref(false);
const selectedRows = ref([]);

// Data table options
const itemsPerPage = ref(10); // Set a default items per page (defaulting to 10)
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
  try {
    console.log('sam');
    console.log(page.value);
    const response = await apiRequestObj.makeRequest('common/customer/list', 'get', {
      params: {
        page: page.value,
        itemsPerPage: itemsPerPage.value,
        query: searchQuery.value,
      },
    });

    if (response?.success) {
      customersData.value = {
        total: response.data.total,
        customers: response.data.customers,
      };
    }
  } catch (error) {
    console.error('Error fetching customers:', error);
  }
};


// Delete a customer
const deleteCustomer = async (id) => {
  try {
    const response = await apiRequestObj.makeRequest(`common/customer/delete/${id}`, 'DELETE');
    if (response?.success) {
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
watch(page, (newPage) => {
  console.log('Current Page:', newPage);
  fetchCustomers();  
});
const handleCustomerUpdated = () => {
  fetchCustomers(); 
};

onMounted(fetchCustomers);
</script>


<template>
  <section>
    <!-- Customer Filters -->
    <VCard class="mb-6">
      <VCardTitle>Filters</VCardTitle>
      <VCardText>
        <VRow>
          <!-- Search Input -->
          <VCol cols="12" sm="4">
            <AppTextField v-model="searchQuery" placeholder="Search Customers" />
          </VCol>
          <!-- Items Per Page -->
          <VCol cols="12" sm="4">
            <AppSelect
              v-model="itemsPerPage"
              :items="[10, 25, 50, 100]"
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

    <!-- Add Customer Button -->
    <VBtn icon="tabler-plus" @click="addNewCustomer">Add New Customer</VBtn>

    <!-- Add/Edit Drawer -->
    <AddNewCustomerDrawer
      v-model:isDrawerOpen="isAddNewCustomerDrawerVisible"
      :customer="selectedCustomer"
      @customer-updated="handleCustomerUpdated"
    />
  </section>
</template>
