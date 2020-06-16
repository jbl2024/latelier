<template>
  <div class="meeting-documents">
    <v-container class="container">
      <v-progress-linear v-if="!$subReady.project" indeterminate />
      <div v-else>
        <v-text-field
          v-model="filter"
          :label="$t('meetings.documents.search')"
        />
        <meeting-documents-list
          v-model="selectedDocuments"
          :documents="attachments"
        />
      </div>
    </v-container>
  </div>
</template>
<script>

import { Attachments } from "/imports/api/attachments/attachments.js";
import MeetingDocumentsList from "./MeetingDocumentsList";

export default {
  components: {
    MeetingDocumentsList
  },
  props: {
    value: {
      type: Array,
      default() {
        return [];
      }
    },
    projectId: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      filter: ""
    };
  },
  computed: {
    selectedDocuments: {
      get() {
        return this.value;
      },
      set(newDocuments) {
        this.$emit("input", newDocuments);
      }
    }
  },
  meteor: {
    $subscribe: {
      project() {
        return [this.projectId];
      }
    },
    attachments: {
      params() {
        return {
          projectId: this.projectId,
          filter: this.filter
        };
      },
      update({ projectId, filter }) {
        const attachments = Attachments.find(
          {
            "meta.projectId": projectId,
            name: { $regex: `.*${filter}.*`, $options: "i" }
          }
        ).fetch();
        return attachments;
      }
    }
  }
};
</script>
<style lang="scss">
  .meeting-documents {
    .container {
      padding: 2rem 3rem;
    }
  }
</style>
