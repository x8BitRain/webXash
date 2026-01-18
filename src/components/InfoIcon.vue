<template>
  <div class="info-icon">
    <img :src="InfoIcon" @click="handleClick" alt="Info" />
  </div>
</template>

<script setup lang="ts">
  // @ts-ignore -- asset import
  import InfoIcon from '../assets/info-icon.png?url';

  const emit = defineEmits<{
    click: [];
  }>();

  const handleClick = () => {
    emit('click');
  };
</script>

<style scoped lang="scss">
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
</style>
