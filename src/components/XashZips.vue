<template>
  <div class="window" name="Half-Life Demos">
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
  </div>
</template>

<script setup lang="ts">
import zipList from "/@/config/games";
import { useXashStore } from "/@/stores/store";
import { storeToRefs } from "pinia";

const store = useXashStore();

const { selectedZip } = storeToRefs(store);
</script>

<style scoped lang="scss"></style>
