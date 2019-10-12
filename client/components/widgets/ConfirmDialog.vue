<template>
  <div class="confirm-dialog">
    <v-dialog :value="active" @input="$emit('update:active')" max-width="340" :fullscreen="$vuetify.breakpoint.xsOnly">
      <v-card>
        <v-card-title class="headline">{{ title }}</v-card-title>
        <v-card-text>{{ content }}</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="cancelDialog">{{ cancelText}}</v-btn>
          <v-btn color="error" @click="confirmDialog">{{ confirmText }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { Meteor } from "meteor/meteor";

export default {
  props: {
    active: Boolean,
    title: String,
    content: String,
    cancelText: String,
    confirmText: String
  },
  data() {
    return {
      color: ""
    };
  },
  methods: {
    cancelDialog() {
      this.$emit("update:active", false);
      this.$emit("cancel");
    },

    confirmDialog() {
      this.$emit("update:active", false);
      this.$emit("confirm");
    }
  }
};
</script>

<style scoped>
.content {
  margin-left: 24px;
  margin-right: 24px;
  overflow-y: scroll;
}

.cursor {
  cursor: pointer;
}

.cursor:hover {
  background-color: #aaa;
}
</style>