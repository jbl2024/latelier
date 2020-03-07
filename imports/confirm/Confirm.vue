<template>
  <div class="confirm">
    <v-dialog
      value="true"
      :max-width="width"
      @input="change"
      @keydown.esc="choose(false)"
    >
      <v-card>
        <v-card-title class="headline">
          {{ title }}
        </v-card-title>
        <v-card-text>{{ message }}</v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="choose(false)">
            {{ cancelText }}
          </v-btn>
          <v-btn color="error" @click="choose(true)">
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
    title: {
      type: String,
      default: "Confirm"
    },
    message: {
      type: String,
      default: null
    },
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
    change() {
      this.$destroy();
    }
  }
};
</script>

<style scoped>
</style>
