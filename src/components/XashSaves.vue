<template>
  <div class="window no-resize" name="Save Location">
    <p v-if="showSaveInfo">
      The saves added here will be transferred into the location below. Saves
      made in-game will also be stored here.
    </p>
    <div class="save-location-wrapper">
      <label for="save-location-input"></label>
      <input
        id="save-location-input"
        v-model="correctedSaveLocation"
        type="text"
        disabled
      />
      <div class="info-icon">
        <img :src="InfoIcon" @click="showSaveInfo = !showSaveInfo" />
      </div>
    </div>
  </div>
  <div class="window" name="Saves List">
    <div class="save-controls">
      <button @click="addSave">Add</button>
      <button @click="removeSave">Remove</button>
    </div>
    <div class="box inset">
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
  import { DEFAULT_GAME, useXashStore } from '/@/stores/store';
  import { storeToRefs } from 'pinia';
  import { type IDBSaveGame } from '/@/services/save-manager.ts';
  import { SaveManager } from '/@/services';
  import InfoIcon from '../assets/info-icon.png?url';

  const store = useXashStore();

  const { saves, customGameArg } = storeToRefs(store);

  // Data

  const showSaveInfo = ref<boolean>(false);
  const selectedSave = ref<IDBSaveGame>();
  const uploadElement = ref<null | HTMLInputElement>();

  // Computed

  const correctedSaveLocation = computed(() => {
    if (!customGameArg.value.includes(DEFAULT_GAME)) {
      return customGameArg.value + '/save/';
    } else {
      return customGameArg.value;
    }
  });

  // Methods

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
      await SaveManager.removeCustomSave(selectedSave.value);
      await store.refreshSavesList();
    }
  };
</script>

<style scoped lang="scss">
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
  }

  .saves-list {
    .category-title-spacer {
      margin-bottom: 0.5rem;
    }
  }
</style>
