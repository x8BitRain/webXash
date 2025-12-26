<template>
  <div class="window no-resize" name="Save Location">
    <div class="save-location-wrapper">
      <label for="save-location-input"></label>
      <input
        id="save-location-input"
        v-model="correctedSaveLocation"
        type="text"
        disabled
      />
      <div class="info-icon">
        <img :src="InfoIcon" @click="openSaveHelp" alt="Info" />
      </div>
    </div>
  </div>
  <div class="window" name="Saves List">
    <div class="save-controls">
      <button class="save-controls__add" @click="addSave">Add</button>
      <button
        class="save-controls__remove"
        @click="removeSave"
        :disabled="!selectedSave"
      >
        Remove
      </button>
      <button
        class="save-controls__download"
        @click="downloadSave"
        :disabled="!selectedSave"
      >
        Download
      </button>
    </div>
    <div v-if="saves && saves.length > 0" class="box inset saves-list__wrapper">
      <div v-for="save in saves" :key="save.gameId" class="saves-list">
        <b>{{ save.gameId }}</b>
        <div class="category-title-spacer"></div>
        <p
          v-for="data in save.data"
          :key="data.name"
          class="menu-item"
          :class="{
            'menu-item--selected': selectedSave?.id === data?.id,
          }"
          @click="onSelectSave(data)"
        >
          {{ data.name }}
        </p>
        <div class="category-title-spacer"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue';
  import { useXashStore } from '/@/stores/store';
  import { storeToRefs } from 'pinia';
  import { type IDBSaveGame } from '/@/services/save-manager.ts';
  import { SaveManager } from '/@/services';
  // @ts-ignore -- asset import
  import InfoIcon from '../assets/info-icon.png?url';

  const store = useXashStore();

  const { saves, customGameArg } = storeToRefs(store);

  // Data

  const selectedSave = ref<IDBSaveGame>();
  const uploadElement = ref<null | HTMLInputElement>();

  // Computed

  const correctedSaveLocation = computed(() => {
    return customGameArg.value + '/save/';
  });

  // Methods

  const openSaveHelp = () => {
    window.open(
      'https://github.com/x8BitRain/webXash?tab=readme-ov-file#save-manager',
      '_blank',
    );
  };

  const onSelectSave = (save: IDBSaveGame): void => {
    selectedSave.value = save;
  };

  const addSave = () => {
    uploadElement.value = document.createElement('input');
    uploadElement.value.type = 'file';
    uploadElement.value.multiple = true;
    uploadElement.value.click();
    uploadElement.value.onchange = async (event: Event) => {
      let files = (event.target as HTMLInputElement).files;
      if (!files) return;
      const filesArr = Array.from(files);
      await SaveManager.addCustomSaves(filesArr);
      await store.refreshSavesList();
    };
  };

  const removeSave = async () => {
    if (selectedSave.value) {
      await SaveManager.removeSave(selectedSave.value);
      await store.refreshSavesList();
      selectedSave.value = undefined;
    }
  };

  const downloadSave = async () => {
    if (!selectedSave.value) return;

    // Get the full save data from IndexedDB
    const fullSave = await SaveManager.getSaveById(selectedSave.value.id);
    if (!fullSave || !fullSave.data || fullSave.data.length === 0) {
      alert('Save data not found or is empty');
      return;
    }

    // Create a blob from the Uint8Array
    const blob = new Blob([fullSave.data], {
      type: 'application/octet-stream',
    });

    // Create a download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fullSave.name;
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
</script>

<style scoped lang="scss">
  #save-location-input {
    width: 100%;
  }

  .save-location-wrapper {
    display: flex;
    align-items: center;
  }

  .info-icon {
    cursor: help;
    img {
      height: 16px;
      border: none;
      &:hover {
        filter: brightness(0) saturate(100%) invert(56%) sepia(28%)
          saturate(830%) hue-rotate(0deg) brightness(92%) contrast(87%);
      }
    }
  }

  .save-controls {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
    &__add,
    &__remove,
    &__download {
      min-width: 3rem;
    }
  }

  .saves-list__wrapper {
    max-height: 30rem;
    overflow-y: auto;
  }

  .saves-list {
    .category-title-spacer {
      margin-bottom: 0.5rem;
    }
  }
</style>
