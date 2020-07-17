<template>
  <div>
    <generic-dialog
      v-model="showDialog"
      max-width="700px"
    >
      <template #title>
        {{ $t('attachments.selectAttachments') }}
      </template>
      <template #content>
        <div class="content">
          <div>
            <v-text-field
              v-model="filter"
              :label="$t('Search') + '...'"
              single-line
              append-icon="mdi-magnify"
              clearable
              autofocus
            />
          </div>
          <attachments
            ref="attachments"
            v-model="selectedAttachments"
            :attachments.sync="attachments"
            :fetch="true"
            :search="filter"
            :per-page="5"
            item-action="select"
            :params="params"
          />
        </div>
      </template>
      <template #actions>
        <upload-button
          :is-uploading="isUploading"
          class="ml-2"
          @on-upload="uploadFile"
        />
        <v-btn
          :disabled="!selectedAttachments.length"
          color="success"
          :dark="selectedAttachments.length > 0"
          class="ml-2"
          @click="selectAttachments"
        >
          {{ $t("Select") }}
        </v-btn>
      </template>
    </generic-dialog>
  </div>
</template>
<script>
import { Meteor } from "meteor/meteor";
import Attachments from "/imports/ui/attachments/Attachments";
import AttachmentUtils from "/imports/api/attachments/utils";
import UploadButton from "/imports/ui/widgets/UploadButton";
import deepCopy from "/imports/ui/utils/deepCopy";

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
    active: {
      type: Boolean,
      default: false
    },
    projectId: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      filter: "",
      isUploading: false,
      attachments: [],
      selectedAttachments: []
    };
  },
  computed: {
    showDialog: {
      get() {
        return this.active;
      },
      set(active) {
        this.$emit("update:active", active);
      }
    },
    params() {
      return {
        name: this.filter,
        meta: {
          projectId: this.projectId
        }
      };
    }
  },
  watch: {
    showDialog: {
      handler() {
        const attachments = Array.isArray(this.value) && this.value.length
          ? deepCopy(this.value) : [];
        this.selectedAttachments = attachments;
      }
    }
  },
  methods: {
    open() {
      this.showDialog = true;
    },
    close() {
      this.showDialog = false;
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
          this.selectedAttachments.push(uploadedFile);
          this.$refs.attachments.fetchAttachments();
          this.$notify(this.$t("meetings.documents.documentAddedSuccess"));
        }
      });
      upload.start();
    },
    selectAttachments() {
      this.$emit("select", this.selectedAttachments);
    }
  }
};
</script>
<style lang="scss" scoped>
.content {
  padding: 1rem 0;
}
</style>
