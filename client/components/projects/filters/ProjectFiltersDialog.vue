<template>
  <div class="project-filters-dialog">
    <v-dialog
      :value="active"
      max-width="340"
      :fullscreen="$vuetify.breakpoint.xsOnly"
      @input="$emit('update:active')"
    >
      <v-card>
        <v-card-title class="headline">
          {{ $t("Filters") }}
        </v-card-title>
        <v-card-text>
          <project-filters :project-id="projectId" />
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn text @click="cancelDialog">
            {{ $t("Close") }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  i18n: {
    messages: {
      en: {
        Filters: "Filters",
        Close: "Close"
      },
      fr: {
        Filters: "Filtres",
        Close: "Fermer"
      }
    }
  },
  props: {
    active: Boolean,
    projectId: {
      type: String,
      default: ""
    }
  },
  data() {
    return {};
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
