<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { useSnackbarStore } from "@/stores/snackbar";
import {
  minLengthValidator,
  numberValidator,
  phoneValidator,
  requiredValidator,
} from "@/utils/validators";

const props = defineProps({
  selectedProvinceId: Number,
  selectedCityId: Number,
  addClass: Boolean,
  mode: {
    type: String,
    default: null, // Default mode is null
  },
});

const emit = defineEmits([
  "update:selectedProvinceId",
  "update:selectedCityId",
]);

const provinces = ref([]);
const cities = ref([]);
const snackBarStore = useSnackbarStore();
const apiRequestObj = useApi();

const fetchProvinces = async () => {
  try {
    const response = await apiRequestObj.makeRequest("common/provinces", "get");

    provinces.value = response.data.map((province) => ({
      value: province.id,
      title: province.name,
    }));
    if (provinces.value.length > 0 && props.selectedProvinceId !== undefined)
      emit("update:selectedProvinceId", provinces.value[0]?.value); // Set default province
  } catch (error) {
    snackBarStore.showSnackbar("Failed to load provinces", "error");
  }
};

const fetchCities = async (provinceId: number) => {
  try {
    const response = await apiRequestObj.makeRequest(
      `common/cities/${provinceId}`,
      "get",
    );

    cities.value = response.data.map((city) => ({
      value: city.id,
      title: city.name,
    }));
  } catch (error) {
    snackBarStore.showSnackbar("Failed to load cities", "error");
  }
};


const selectedProvince = ref(props.selectedProvinceId);
const selectedCity = ref(props.selectedCityId);

// Sync local state with props
watch(
  () => props.selectedProvinceId,
  (newVal) => {
    selectedProvince.value = newVal;
  }
);

watch(
  () => props.selectedCityId,
  (newVal) => {
    selectedCity.value = newVal;
  }
);
watch(
  selectedProvince,
  async (newProvinceId, oldProvinceId) => {
    if (newProvinceId && oldProvinceId == undefined) {
      await fetchCities(newProvinceId);
    } else if (newProvinceId !== oldProvinceId) {
      selectedCity.value = undefined; // Reset selected city
      emit("update:selectedCityId", undefined);
      await fetchCities(newProvinceId);
    }
    emit("update:selectedProvinceId", newProvinceId);
  }
);


// Fetch provinces on mount
onMounted(() => {
  
  fetchProvinces();

});
</script>

<template>
  <VCol cols="12" :sm="props.addClass ? 12 : 6">
    <v-autocomplete
    v-model="selectedProvince"
    label="Select Province"
    placeholder="Select Province"
    :items="provinces"
    :rules="[requiredValidator]"
    :searchable="true"
    :clearable="props.mode !== 'disabled'"
    :clear-icon="props.mode !== 'disabled' ? 'tabler-x' : ''"
    :disabled="props.mode === 'details' || props.mode === 'disabled'"
    @update:model-value="(value) => {
      selectedProvince = value;
      emit('update:selectedProvinceId', value);
    }"
  ></v-autocomplete>
  </VCol>
  <VCol cols="12" :sm="props.addClass ? 12 : 6">
    <v-autocomplete
      v-model="selectedCity"
      label="Select City"
      :items="cities"
      :disabled="props.mode === 'details' || !selectedProvince || props.mode === 'disabled'"
       :rules="[requiredValidator]"
      :clearable="props.mode !== 'disabled'"
      :clear-icon="props.mode !== 'disabled' ? 'tabler-x' : ''"
      @update:model-value="(value) => {
        selectedCity = value;
        emit('update:selectedCityId', value);
      }"
    ></v-autocomplete>
  </VCol>
</template>

<style scoped>
/* Add styling if necessary */
</style>
