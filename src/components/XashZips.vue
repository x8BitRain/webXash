<template>
  <div class="window no-resize" name="Half-Life Demos">
    <div class="box inset">
      <p
        v-for="zip in zipList"
        :key="zip.name"
        class="menu-item"
        :class="{ 'menu-item--selected': selectedZip === zip.packageName }"
        @click="selectedZip = zip.packageName"
      >
        {{ zip.name }}
      </p>
    </div>
    <button class="start-button" :disabled="!selectedZip" @click="start">
      Start Demo
    </button>
  </div>
</template>

<script setup lang="ts">
  import zipList from '/@/config/games';
  import { useXashStore } from '/@/stores/store';
  import { storeToRefs } from 'pinia';
  import setCanvasLoading from '/@/utils/setCanvasLoading.ts';

  const store = useXashStore();

  const { selectedZip } = storeToRefs(store);
  const { downloadZip, startXashZip } = store;

  // Methods

  const start = async () => {
    setCanvasLoading();
    const zip = await downloadZip();
    if (!zip) {
      alert('Selected game could not be loaded!');
      return;
    }
    await startXashZip(zip);
  };
</script>

<style scoped lang="scss">
  .start-button {
    margin-top: 0.5rem;
    text-align: center;
    width: 100%;
  }
</style>
