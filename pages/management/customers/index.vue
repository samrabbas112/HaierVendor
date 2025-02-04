<script setup lang="ts">
import AddNewCustomerDrawer from "@/views/customer/AddNewCustomerDrawer.vue";
import { ref, onMounted, watch, nextTick } from "vue";
const snackBarStore = useSnackbarStore();
import { useLoaderStore } from "@/stores/loader";

// State
const searchQuery = ref("");
const selectedCustomer = ref(null);
const customersData = ref({ total: 0, customers: [] });
const isAddNewCustomerDrawerVisible = ref(false);
const selectedRows = ref([]);
const loaderStore = useLoaderStore();
const route = useRoute();
const isConfirmDialogVisible = ref(false);
const selectedCustomerId = ref();
const authUser = useCookie("auth");
const selectedVendorStatus = ref();

// Data table options
const itemsPerPage = ref(10);
const page = ref(1);
const apiRequestObj = useApi();

// Resolve user status for the UI
const resolveUserStatusVariant = (stat: string) => {
  const statLowerCase = stat.toLowerCase();
  if (statLowerCase === "2 ") return "danger";
  if (statLowerCase === "1") return "success";
  if (statLowerCase === "0") return "warning";

  return "primary";
};

const vendorStatus = [
  { title: "Confirmed", value: 1 },
  { title: "Pending", value: 0 },
  { title: "Declined", value: 2 },
];

// Headers for the data table
const headers = [
  { title: "SN", key: "id" },
  { title: "Name", key: "name" },
  { title: "Phone", key: "phone_number" },
  { title: "City", key: "city" },
  { title: "Status", key: "confirmed" },
  { title: "Registered At", key: "updated_at" },
  { title: "Actions", key: "actions", sortable: false },
];

// Fetch customers from the API
const fetchCustomers = async () => {
  loaderStore.showLoader();
  try {
    const response = await apiRequestObj.makeRequest(
      `common/customer/list/${route.query.vendor || authUser.value.user.vendor_uid}`,
      "post",
      {
        page: page.value,
        itemsPerPage: itemsPerPage.value,
        query: searchQuery.value,
        ...((selectedVendorStatus.value == 0 ||
          selectedVendorStatus.value == 1 ||
          selectedVendorStatus.value == 2) && {
          status: selectedVendorStatus.value,
        }),
      },
    );

    if (response?.success) {
      customersData.value = {
        total: response.data.total,
        customers: response.data.customers,
      };
    }
  } catch (error) {
    console.error("Error fetching customers:", error);
  }
  loaderStore.hideLoader();
};

const deleteCustomer = (id) => {
  selectedCustomerId.value = id;
  isConfirmDialogVisible.value = !isConfirmDialogVisible.value;
};

// Delete a customer
const handleConfirm = async (value) => {
  if (value) {
    loaderStore.showLoader();
    try {
      const response = await apiRequestObj.makeRequest(
        `common/customer/delete/${selectedCustomerId.value}`,
        "DELETE",
      );
      if (response?.success) {
        snackBarStore.showSnackbar("Customer Deleted Successfully.", "success");
        await fetchCustomers();
      }else {
        snackBarStore.showSnackbar(response?.message, "error");
      }
    } catch (error) {
      console.error("Error deleting customer:", error);
    } finally {
      loaderStore.hideLoader();
    }
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
// watch([page, searchQuery, itemsPerPage], () => {
//   fetchCustomers();
// });\

watch([page], () => {
  fetchCustomers();
});

const handleCustomerUpdated = () => {
  fetchCustomers();
};
watch([selectedVendorStatus], () => {
  fetchCustomers();
});

onMounted(fetchCustomers);
</script>

<template>
  <section>
    <!-- Header Section with Add New Customer Button -->
    <VRow justify="space-between" class="mb-6 align-center">
      <VCol cols="12" sm="6"> </VCol>
    </VRow>

    <!-- Filters Section -->
    <VCard class="mb-6">
      <VCardText>
        <VRow>
          <!-- Items Per Page -->
          <!-- <VCol cols="12" sm="4">
            <AppSelect
              v-model="itemsPerPage"
              :items="[10, 20, 50, 100]"
              label="Items Per Page"
            />
          </VCol> -->
        </VRow>
        <VRow cols="12" sm="8">
          <!-- 👉 Select Status -->
          <VCol cols="12" sm="3">
            <AppTextField
              v-model="searchQuery"
              placeholder="Search by contact no"
              @keypress.enter="
                () => {
                  page = 1;
                  fetchCustomers();
                }
              "
            />
          </VCol>
          <VCol cols="12" sm="3">
            <AppSelect
              v-model="selectedVendorStatus"
              placeholder="Select  Status"
              :items="vendorStatus"
              clearable
              clear-icon="tabler-x"
            />
          </VCol>
          <VCol cols="12" sm="3">
            <div class="d-flex">
              <VBtn
                class="me-2"
                variant="outlined"
                color="secondary"
                @click="
                  () => {
                    searchQuery = '';
                    page = 1;
                    selectedVendorStatus = null;
                    fetchCustomers();
                  }
                "
              >
                Reset
              </VBtn>
              <VBtn
                variant="flat"
                @click="
                  () => {
                    page = 1;
                    fetchCustomers();
                  }
                "
              >
                Search
              </VBtn>
            </div>
          </VCol>
          <VCol cols="12" sm="3" class="text-end">
            <VBtn
              prepend-icon="tabler-plus"
              color="primary"
              @click="addNewCustomer"
            >
              Add New Customer
            </VBtn>
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
      @update:options="updateOptions"
    >
      <template #item.id="{ index }">
        <NuxtLink>
          <!-- {{ item.id }} -->
          {{ (page - 1) * itemsPerPage + index + 1 }}
        </NuxtLink>
      </template>
      <template #item.updated_at="{ item }">
        {{ new Date(item.updated_at).toLocaleDateString() }} {{ new Date(item.updated_at).toLocaleTimeString() }}

      </template>
      <!-- Status -->
      <template #item.confirmed="{ item }">
        <VChip
          :color="resolveUserStatusVariant(item.confirmed)"
          size="small"
          label
          class="text-capitalize"
        >
          {{
            item.confirmed == 1
              ? "Confirmed"
              : item.confirmed == 0
                ? "Pending"
                : "Declined"
          }}
        </VChip>
      </template>

      <!-- Actions -->
      <template #item.actions="{ item }">
        <!-- Trash Icon Button -->
        <IconBtn @click="deleteCustomer(item.uid)">
          <VIcon icon="tabler-trash" />
        </IconBtn>

        <IconBtn
          @click="editCustomer(item)"
          v-if="authUser.user.vendor_uid === item.reference_vendor"
        >
          <VIcon icon="tabler-pencil" />
        </IconBtn>
      </template>

      <!-- pagination -->
      <template #bottom>
        <TablePagination
          v-model:page="page"
          :items-per-page="itemsPerPage"
          :total-items="customersData.total"
        />
      </template>
    </VDataTableServer>

    <!-- Add/Edit Drawer -->
    <AddNewCustomerDrawer
      v-model:isDrawerOpen="isAddNewCustomerDrawerVisible"
      :customer="selectedCustomer"
      @customer-updated="handleCustomerUpdated"
    />
    <ConfirmDialog
      v-model:isDialogVisible="isConfirmDialogVisible"
      confirmation-question="Are you sure to want to delete"
      cancel-msg="Request cancelled!!"
      cancel-title="Cancelled"
      confirm-msg="Your order status changed successfully."
      confirm-title="Confirmed"
      @confirm="handleConfirm"
    />
  </section>
</template>
