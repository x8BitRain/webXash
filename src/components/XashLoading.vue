<template>
  <div class="half window xash-loading" name="Loading">
    <div class="xash-loading__container">
      {{ loadingPercentage }}%
      <progress :value="loadingProgress" :max="maxLoadingAmount" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useXashStore } from '/@/stores/store';
  import { storeToRefs } from 'pinia';
  import { computed } from 'vue';

  const store = useXashStore();
  const { loadingProgress, maxLoadingAmount } = storeToRefs(store);

  // Computed

  const loadingPercentage = computed(() => {
    if (maxLoadingAmount.value === 0) return 0;
    return Math.round((loadingProgress.value / maxLoadingAmount.value) * 100);
  });
</script>

<style scoped lang="scss">
  .xash-loading {
    &__container {
      display: flex;
      justify-content: space-evenly;
      align-items: center;
    }
  }
</style>
