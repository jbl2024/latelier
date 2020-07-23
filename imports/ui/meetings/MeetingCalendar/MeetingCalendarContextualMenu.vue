<template>
  <v-menu
    v-model="isShown"
    :position-x="x"
    :position-y="y"
    absolute
    offset-y
  >
    <slot />
  </v-menu>
</template>
<script>
export default {
  props: {
    value: {
      type: Boolean,
      default: false
    },
    x: {
      type: [Number, String],
      default: null
    },
    y: {
      type: [Number, String],
      default: null
    }
  },
  computed: {
    isShown: {
      get() {
        return this.value;
      },
      set(isShown) {
        this.$emit("input", isShown);
      }
    }
  }
};
</script>
