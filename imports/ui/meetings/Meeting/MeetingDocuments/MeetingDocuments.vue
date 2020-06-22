<template>
  <div class="meeting-documents">
    <v-container class="meeting-documents__container">
      <v-progress-linear v-if="!projectId" indeterminate />
      <div v-else>
        <attachment-list
          v-model="selectedDocuments"
          display="autocomplete"
          :search.sync="filter"
          :item-options="{color: 'indigo', dark: true}"
          :label="$t('meetings.attachments.meetingAttachments')"
          :attachments="attachments"
        />
        <div class="meeting-documents__add-documents">
          <v-btn dark @click="beginUpload">
            <v-icon left color="white">
              mdi-plus
            </v-icon>
            {{ $t("attachments.addAttachments") }}
          </v-btn>
          <input
            v-if="!isUploading"
            ref="uploadInput"
            style="display: none;"
            type="file"
            multiple
            :disabled="isUploading"
            @change="onUpload"
          >
        </div>
      </div>
    </v-container>
  </div>
</template>
<script>

import { Meteor } from "meteor/meteor";
import debounce from "lodash/debounce";
import { Attachments } from "/imports/api/attachments/attachments.js";
import AttachmentList from "/imports/ui/attachments/AttachmentList";
import Api from "/imports/ui/api/Api";

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
      file: null,
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
        return;
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
    onUpload(e) {
      const files = e.target.files || [];
      for (let i = 0; i < files.length; i++) {
        this.uploadFile(files[i]);
      }
    },
    beginUpload() {
      this.$refs.uploadInput.click();
    },
    uploadFile(file) {
      const transport = Meteor.settings.public.uploadTransport || "ddp";
      const upload = Attachments.insert(
        {
          file: file,
          streams: "dynamic",
          chunkSize: "dynamic",
          transport: transport,
          meta: {
            projectId: this.projectId,
            createdBy: Meteor.userId()
          }
        },
        false
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
          this.file = null;
          await this.fetchAttachments();
          this.selectedDocuments.push(uploadedFile);
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
