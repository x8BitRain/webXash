<template>
  <div v-if="loading" class="loading"></div>
  <canvas
    ref="xashCanvasElement"
    id="canvas"
    class="emscripten"
    oncontextmenu="event.preventDefault()"
  ></canvas>
</template>

<script setup lang="ts">
  import { storeToRefs } from 'pinia';
  import { useXashStore } from '/@/stores/store.ts';
  import { onMounted, ref } from 'vue';

  // Dependencies

  const store = useXashStore();
  const { loading, xashCanvas } = storeToRefs(store);

  // Data

  const xashCanvasElement = ref<HTMLCanvasElement>();

  // Hooks

  onMounted(() => {
    xashCanvas.value = xashCanvasElement.value
  })
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
