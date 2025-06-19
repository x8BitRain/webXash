<template>
  <div v-if="loading" class="loading"></div>
  <canvas
    id="canvas"
    class="emscripten"
    oncontextmenu="event.preventDefault()"
  ></canvas>
</template>

<script setup lang="ts">
  import { storeToRefs } from 'pinia';
  import { useXashStore } from '/@/stores/store.ts';

  const store = useXashStore();
  const { loading } = storeToRefs(store);
</script>

<style scoped lang="scss">
  .loading {
    position: absolute;
    height: 100%;
    width: 100%;
    background-repeat: no-repeat;
    background-position: center;
    background-image: url('../assets/hl-spin.svg');
    z-index: 9;
  }
</style>
