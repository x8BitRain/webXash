<template>
  <div class="window" name="Open folder">
    <div class="box">
      <button class="start-button" @click="openFolder">Open game folder</button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useXashStore } from '/@/stores/store';
  import directoryOpen from '/@/utils/directoryOpen.ts';

  const store = useXashStore();
  const { startXashFiles } = store;

  const openFolder = async () => {
    const files = await directoryOpen({ recursive: true });
    if (files) {
      await startXashFiles(files);
    }
  };
</script>

<style scoped lang="scss">
  .start-button {
    text-align: center;
    width: 100%;
  }
</style>
