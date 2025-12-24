<template>
  <div class="window no-resize" :name="storedFolder ? 'Game: ' + storedFolder : 'Open folder'">
    <div class="box">
      <button v-if="storedFolder" class="start-button" @click="start">
        <span> Start Game </span>
      </button>

      <button class="start-button" @click="chooseNewFolder">
        <span> Open game Folder </span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useXashStore } from '/@/stores/store';
  import directoryOpen, {
    type FilesWithPath,
    clearStoredFolder,
    getStoredDirectoryHandle,
  } from '/@/utils/directory-open.ts';
  import { onMounted, ref } from 'vue';

  // Dependencies

  const store = useXashStore();

  // Data

  const files = ref<FilesWithPath[]>();
  const storedFolder = ref<string | null>(null);
  const { startXashFiles } = store;

  // Methods

  const openFolder = async () => {
    files.value = await directoryOpen({ recursive: true });
  };

  const chooseNewFolder = async () => {
    await clearStoredFolder();
    await openFolder();
    await populateStoredDir();
  };

  const populateStoredDir = async () => {
    const storedDir = await getStoredDirectoryHandle();
    if (storedDir && storedDir?.name) {
      storedFolder.value = storedDir.name;
    }
  };

  const start = async () => {
    if (!files.value) {
      await openFolder();
      if (files.value) {
        await startXashFiles(files.value);
      } else {
        alert('There were no files found in this folder, was it moved or deleted?')
      }
    } else {
      await startXashFiles(files.value);
    }
  };

  // Hooks

  onMounted(async () => {
    await populateStoredDir();
  });
</script>

<style scoped lang="scss">
  .start-button {
    text-align: center;
    width: 100%;

    &:first-child {
      margin-bottom: 1rem;
    }
  }
</style>
