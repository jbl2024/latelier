<template>
  <div>
    <v-dialog
      :value="active"
      :fullscreen="$vuetify.breakpoint.xsOnly"
      @input="$emit('update:active')"
    >
      <v-card>
        <examples-list @select="onExampleSelected" />
        <v-card-actions>
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
