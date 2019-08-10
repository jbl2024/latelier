<template>
  <div class="confirm">
    <v-dialog
      @input="change"
      value="true"
      :max-width="width"
      @keydown.esc="choose(false)"
      :fullscreen="$vuetify.breakpoint.xsOnly"
    >
      <v-card>
        <v-card-title class="headline">{{ title }}</v-card-title>
        <v-card-text>{{ message }}</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="choose(false)">{{ cancelText}}</v-btn>
          <v-btn color="error" @click="choose(true)">{{ confirmText }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { Meteor } from "meteor/meteor";

export default {
  props: {
    title: {
      type: String,
      default: "Confirm"
    },
    message: String,
    cancelText: {
      type: String,
      default: "Cancel"
    },
    confirmText: {
      type: String,
      default: "Confirm"
    },
    width: {
      type: Number,
      default: 350
    }
  },
  data() {
    return {
      value: false
    };
  },
  methods: {
    choose(value) {
      this.$emit("result", value);
      this.value = value;
      this.$destroy();
    },
    change(res) {
      this.$destroy();
    }
  }
};
</script>

<style scoped>
</style>