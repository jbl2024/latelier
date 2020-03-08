<template>
  <div class="project-filters-dialog">
    <generic-dialog
      v-model="showDialog"
      :title="$t('Filters')"
      :close-label="$t('Close')"
    >
      <template v-slot:content>
        <project-filters :project-id="projectId" />
      </template>
    </generic-dialog>
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
    value: {
      type: Boolean,
      default: false
    },
    projectId: {
      type: String,
      default: ""
    }
  },
  data() {
    return {};
  },
  computed: {
    showDialog: {
      get() {
        return this.value;
      },
      set(val) {
        this.$emit("input", val);
      }
    }
  },
  methods: {
    cancelDialog() {
      this.showDialog = false;
      this.$emit("cancel");
    },

    confirmDialog() {
      this.showDialog = false;
      this.$emit("confirm");
    }
  }
};
</script>
