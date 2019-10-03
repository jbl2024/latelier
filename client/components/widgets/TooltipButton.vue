<template>
  <v-tooltip :top="top" :left="left" :bottom="bottom" :right="right">
    <template v-slot:activator="{ on }">
      <v-btn icon v-on="on" @click.stop="onClick()">
        <v-icon>{{ icon }}</v-icon>
      </v-btn>
    </template>
    <span>{{ tooltip }}</span>
  </v-tooltip>
</template>

<script>
export default {
  props: {
    icon: {
      type: String
    },
    tooltip: {
      type: String
    },
    top: {
      type: Boolean,
      default: false
    },
    left: {
      type: Boolean,
      default: false
    },
    bottom: {
      type: Boolean,
      default: false
    },
    right: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    onClick() {
      this.$emit("on");
    }
  }
};
</script>

<style scoped>
</style>