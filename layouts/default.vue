<script lang="ts" setup>
import Alert from '@/components/alert/Alert.vue';
import Loader from '@/components/loader/Loader.vue';
import { useConfigStore } from "@core/stores/config";
import { AppContentLayoutNav } from "@layouts/enums";
import { switchToVerticalNavOnLtOverlayNavBreakpoint } from "@layouts/utils";

const DefaultLayoutWithHorizontalNav = defineAsyncComponent(
  () => import("./components/DefaultLayoutWithHorizontalNav.vue"),
);
const DefaultLayoutWithVerticalNav = defineAsyncComponent(
  () => import("./components/DefaultLayoutWithVerticalNav.vue"),
);

const configStore = useConfigStore();

// ℹ️ This will switch to vertical nav when define breakpoint is reached when in horizontal nav layout
// Remove below composable usage if you are not using horizontal nav layout in your app
switchToVerticalNavOnLtOverlayNavBreakpoint();

const { layoutAttrs, injectSkinClasses } = useSkins();

injectSkinClasses();
</script>

<template>
  <Component
    v-bind="layoutAttrs"
    :is="
      configStore.appContentLayoutNav === AppContentLayoutNav.Vertical
        ? DefaultLayoutWithVerticalNav
        : DefaultLayoutWithHorizontalNav
    "
  >
    <Loader />
    <Alert />
    <slot />
  </Component>
</template>

<style lang="scss">
// As we are using `layouts` plugin we need its styles to be imported
@use "@layouts/styles/default-layout";
</style>
