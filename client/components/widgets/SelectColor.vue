<template>
  <div class="select-color">
    <v-dialog
      :value="active"
      persistent
      max-width="390"
      :fullscreen="$vuetify.breakpoint.xsOnly"
      @input="$emit('update:active')"
    >
      <v-card>
        <v-card-title class="headline">
          Choisir une couleur
        </v-card-title>
        <v-card-text>
          <v-color-picker
            v-model="color"
            show-swatches
            :hide-inputs="!advanced"
            :hide-canvas="!advanced"
            :width="390"
          />
        </v-card-text>
        <v-card-actions>
          <v-btn text color="secondary" @click="advanced = !advanced">
            <v-icon v-if="!advanced">
              mdi-plus
            </v-icon>
            <v-icon v-if="advanced">
              mdi-minus
            </v-icon>
          </v-btn>
          <v-spacer />
          <v-btn text @click="closeDialog">
            {{ this.$t("Cancel") }}
          </v-btn>
          <v-btn color="primary" @click="selectColor">
            {{ this.$t("Select") }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  props: {
    active: Boolean
  },
  data() {
    return {
      color: "",
      advanced: false
    };
  },
  methods: {
    closeDialog() {
      this.$emit("update:active", false);
    },

    selectColor() {
      this.$emit("update:active", false);
      this.$emit("select", this.color);
    }
  }
};
</script>

<style scoped></style>
