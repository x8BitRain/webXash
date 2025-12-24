<template>
  <div class="window no-resize" name="Start">
    <div class="box">
      <button class="start-button" :disabled="!selectedZip" @click="start">
        Start
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useXashStore } from '/@/stores/store';
  import { storeToRefs } from 'pinia';
  import setCanvasLoading from '/@/utils/setCanvasLoading';

  const store = useXashStore();
  const { selectedZip } = storeToRefs(store);
  const { downloadZip, startXashZip } = store;

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
    text-align: center;
    width: 100%;
  }
</style>
