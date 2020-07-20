<template>
  <div class="meeting-title">
    <div class="meeting-title__main-title">
      <div
        v-if="color"
        ref="color"
        class="meeting-color-trigger"
        :style="colorStyles"
        @click="$emit('click-color')"
      />
      <slot name="title">
        <div class="meeting-title__title">
          {{ title }}
        </div>
      </slot>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    title: {
      type: String,
      default: null
    },
    color: {
      type: String,
      default: null
    }
  },
  computed: {
    colorStyles() {
      return `background-color: ${this.color}`;
    }
  }
};
</script>
<style lang="scss">
  .meeting-title {
    display: flex;
    justify-content: space-between;
    width: 100%;
    align-items: center;
    .meeting-title__title {
      word-break: break-word;
    }
    .meeting-color-trigger {
      position: relative;
      border-radius: 50px;
      min-height: 40px;
      cursor: pointer;
      display: flex;
      min-width: 40px;
      margin-right: 16px;
    }
    .meeting-title__counts,
    .meeting-title__main-title {
      display: flex;
      align-items: center;
    }
  }
</style>
