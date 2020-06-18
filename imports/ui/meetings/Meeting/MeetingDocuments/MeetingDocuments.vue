<template>
  <div class="meeting-documents">
    <v-container class="meeting-documents__container">
      <v-progress-linear v-if="!projectId" indeterminate />
      <div v-else>
        <attachment-list
          v-model="selectedDocuments"
          display="combobox"
          :label="$t('attachments.addAttachments')"
          :attachments="attachments"
        />
      </div>
    </v-container>
  </div>
</template>
<script>

import { Meteor } from "meteor/meteor";
import debounce from "lodash/debounce";
import AttachmentList from "/imports/ui/attachments/AttachmentList";

export default {
  components: {
    AttachmentList
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
      filter: "",
      page: 1,
      pagination: {
        totalItems: 0,
        rowsPerPage: 10,
        totalPages: 0
      },
      attachments: []
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
    },
    params() {
      return {
        meta: {
          projectId: this.projectId
        },
        perPage: this.pagination.rowsPerPage,
        page: this.page,
        name: this.filter
      };
    }
  },
  methods: {
    changeFilter: debounce(function() {
      this.fetchAttachments();
    }, 300),
    fetchAttachments() {
      Meteor.call(
        "attachments.find",
        this.params,
        (error, result) => {
          if (error || !result.data) {
            this.$notifyError(error);
            return false;
          }
          this.attachments = result.data;
          this.page = result.totalPages;
          this.pagination.totalItems = result.totalItems;
          this.pagination.rowsPerPage = result.rowsPerPage;
          this.pagination.totalPages = this.calculateTotalPages();
        }
      )
    },
    calculateTotalPages() {
      if (
        this.pagination.rowsPerPage == null
        || this.pagination.totalItems == null
      ) {
        return 0;
      }
      return Math.ceil(
        this.pagination.totalItems / this.pagination.rowsPerPage
      );
    },
  },
  watch: {
    projectId: {
      immediate: true,
      handler() {
        this.fetchAttachments();
      }
    }
  }
};
</script>
<style lang="scss">
  .meeting-documents {
    .container.meeting-documents__container {
      padding: 0;
    }
  }
</style>
