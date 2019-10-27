<template>
  <div class="confirm-dialog">
    <v-dialog
      :value="active"
      max-width="340"
      :fullscreen="$vuetify.breakpoint.xsOnly"
      @input="$emit('update:active')"
    >
      <v-card>
        <v-card-title class="headline">
          {{ title }}
        </v-card-title>
        <v-card-text>{{ content }}</v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="cancelDialog">
            {{ cancelText }}
          </v-btn>
          <v-btn color="error" @click="confirmDialog">
            {{ confirmText }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  props: {
    active: Boolean,
    title: {
      type: String,
      default: ""
    },
    content: {
      type: String,
      default: ""
    },
    cancelText: {
      type: String,
      default: ""
    },
    confirmText: {
      type: String,
      default: ""
    }
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
</style>
