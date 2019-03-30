<template>
  <div class="project-filters-dialog">
    <v-dialog :value="active" @input="$emit('update:active')" max-width="340" :fullscreen="$vuetify.breakpoint.xsOnly">
      <v-card>
        <v-card-title class="headline">{{ $t('Filters') }}</v-card-title>
        <v-card-text>
          <project-filters :projectId="projectId"></project-filters>
        </v-card-text>
        
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn flat @click="cancelDialog">{{ $t('Close')}}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { Meteor } from "meteor/meteor";

export default {
  i18n: {
    messages: {
      en: {
        "Filters": "Filters",
        "Close": "Close",
      },
      fr: {
        "Filters": "Filtres",
        "Close": "Fermer",
      }
    }
  },    
  props: {
    active: Boolean,
    projectId: {
      type: String
    }
  },
  data() {
    return {
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