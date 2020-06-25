<template>
  <div class="meeting-documents">
    <v-container class="meeting-documents__container">
      <v-progress-linear v-if="!projectId" indeterminate />
      <div v-else>
        <attachments
          v-model="selectedDocuments"
          display="autocomplete"
          :search.sync="filter"
          :label="$t('meetings.attachments.meetingAttachments')"
          :attachments="attachments"
        />
        <div class="meeting-documents__add-documents">
          <upload-button
            :is-uploading="isUploading"
            @on-upload="uploadFile"
          />
        </div>
      </div>
    </v-container>
  </div>
</template>
<script>

import { Meteor } from "meteor/meteor";
import debounce from "lodash/debounce";
import AttachmentUtils from "/imports/api/attachments/utils";
import Attachments from "/imports/ui/attachments/Attachments";
import Api from "/imports/ui/api/Api";
import UploadButton from "/imports/ui/widgets/UploadButton";

export default {
  components: {
    Attachments,
    UploadButton
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
      isUploading: false,
      filter: "",
      page: 1,
      pagination: {
        totalItems: 0,
        rowsPerPage: 50,
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
  watch: {
    projectId: {
      immediate: true,
      async handler() {
        await this.fetchAttachments();
      }
    },
    filter: {
      async handler() {
        const that = this;
        const debouncedFetch = debounce(async function() {
          await that.fetchAttachments();
        }, 300);
        debouncedFetch();
      }
    }
  },
  methods: {
    async fetchAttachments() {
      try {
        const result = await Api.call("attachments.find", this.params);
        if (!result || !result.data) return;
        this.attachments = result.data;
        this.page = result.totalPages;
        this.pagination.totalItems = result.totalItems;
        this.pagination.rowsPerPage = result.rowsPerPage;
        this.pagination.totalPages = this.calculateTotalPages();
      } catch (error) {
        this.$notifyError(error);
      }
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
    uploadFile(file) {
      const upload = AttachmentUtils.uploadFile(
        file,
        {
          meta: {
            projectId: this.projectId,
            createdBy: Meteor.userId()
          }
        }
      );
      upload.on("start", () => {
        this.isUploading = true;
      });
      upload.on("end", async (error, uploadedFile) => {
        this.isUploading = false;
        if (error) {
          this.$notifyError(error);
          this.$emit("upload-document-error", error);
        } else {
          this.$emit("upload-document-finished");
          await this.fetchAttachments();
          this.selectedDocuments.push(uploadedFile);
          this.$notify("meetings.documents.documentAddedSuccess");
        }
      });
      upload.start();
    }
  }
};
</script>
<style lang="scss">
  .meeting-documents {
    .container.meeting-documents__container {
      padding: 0;
    }
    .meeting-documents__add-documents {
      display: flex;
      justify-content: flex-end;
      margin-top: 12px;
    }
  }
</style>
