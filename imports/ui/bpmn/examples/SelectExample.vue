<template>
  <div>
    <v-dialog
      :value="active"
      :fullscreen="$vuetify.breakpoint.xsOnly"
      @input="$emit('update:active')"
    >
      <v-card class="flex-container">
        <v-toolbar
          v-if="$vuetify.breakpoint.xsOnly"
          dark
          color="primary"
          class="flex0"
        >
          <v-btn
            v-shortkey="['esc']"
            icon
            text
            @click="cancel()"
            @shortkey="cancel()"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-spacer />
          <v-toolbar-items>
            <v-btn text dark :disabled="!example" @click="select">
              {{ $t("Select") }}
            </v-btn>
          </v-toolbar-items>
        </v-toolbar>

        <examples-list class="flex1" @select="onExampleSelected" />
        <v-card-actions v-if="!$vuetify.breakpoint.xsOnly">
          <v-spacer />
          <v-btn text @click="cancel">
            {{ $t("Cancel") }}
          </v-btn>
          <v-btn color="primary" :disabled="!example" @click="select">
            {{ $t("Select") }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import ExamplesList from "./ExamplesList";

export default {
  components: {
    ExamplesList
  },
  props: {
    active: Boolean
  },
  data() {
    return {
      example: null
    };
  },
  methods: {
    closeDialog() {
      this.$emit("update:active", false);
    },

    onExampleSelected(example) {
      this.example = example;
    },

    select() {
      this.$emit("update:active", false);
      this.$emit("select", this.example);
    },

    cancel() {
      this.$emit("update:active", false);
    }
  }
};
</script>

<style scoped>
.flex-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.flex0 {
  flex: 0;
  height: 100%;
}

.flex1 {
  flex: 1; /* takes the remaining height of the "container" div */
  overflow: auto; /* to scroll just the "main" div */
}
</style>
