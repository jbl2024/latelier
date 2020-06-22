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
        <div>
          {{ title }}
        </div>
      </slot>
    </div>
    <div class="meeting-title__counts">
      <div class="mr-2">
        <v-icon>
          mdi-attachment
        </v-icon>
        {{ documentsCount }}
      </div>
      <div>
        <v-icon>
          mdi-account-multiple
        </v-icon>
        {{ attendeesCount }}
      </div>
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
    },
    documentsCount: {
      type: Number,
      default: 0
    },
    attendeesCount: {
      type: Number,
      default: 0
    }
  },
  computed: {
    colorStyles() {
      return `background-color: ${this.color}`;
    }
  }
}
</script>
<style lang="scss">
  .meeting-title {
    display: flex;
    justify-content: space-between;
    width: 100%;
    align-items: center;
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