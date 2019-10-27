<template>
  <div class="task-attachments">
    <input
      v-if="!isUploading"
      type="file"
      multiple
      :disabled="isUploading"
      @change="onUpload"
    >
    <v-progress-linear v-show="isUploading" indeterminate />
    <v-list>
      <v-list-item v-for="attachment in attachments" :key="attachment._id">
        <v-list-item-avatar>
          <v-icon>mdi-file-document</v-icon>
        </v-list-item-avatar>

        <v-list-item-content class="pointer">
          <v-list-item-title>
            <a :href="link(attachment)" target="_blank">{{
              attachment.name
            }}</a>
          </v-list-item-title>
        </v-list-item-content>

        <v-list-item-action>
          <v-btn icon ripple @click.stop="deleteAttachment(attachment)">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </v-list-item-action>
      </v-list-item>
    </v-list>
  </div>
</template>

<script>
import { Attachments } from "/imports/api/attachments/attachments";

import "moment/locale/fr";

export default {
  name: "TaskAttachments",
  props: {
    task: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      file: null,
      isUploading: false
    };
  },
  methods: {
    onUpload(e) {
      const files = e.target.files || [];
      for (let i = 0; i < files.length; i++) {
        this.uploadFile(files[i]);
      }
    },

    uploadFile(file) {
      const that = this;
      const transport = Meteor.settings.public.uploadTransport || "ddp";
      const upload = Attachments.insert(
        {
          file: file,
          streams: "dynamic",
          chunkSize: "dynamic",
          transport: transport,
          meta: {
            projectId: this.task.projectId,
            taskId: this.task._id,
            createdBy: Meteor.userId()
          }
        },
        false
      );

      upload.on("start", function() {
        that.isUploading = true;
      });

      upload.on("end", function(error) {
        that.isUploading = false;
        if (error) {
          this.$store.dispatch("notifyError", error);
        } else {
          Meteor.call("tasks.addAttachment", that.task._id);
          that.file = null;
        }
      });

      upload.start();
    },

    deleteAttachment(attachment) {
      this.$confirm(this.$t("Delete attachment?"), {
        title: attachment.name,
        cancelText: this.$t("Cancel"),
        confirmText: this.$t("Delete")
      }).then((res) => {
        if (res) {
          Meteor.call("tasks.removeAttachment", this.task._id, attachment._id);
        }
      });
    },

    link(attachment) {
      return Attachments.link(attachment);
    }
  },
  meteor: {
    attachments: {
      params() {
        return {
          task: this.task
        };
      },
      update({ task }) {
        return Attachments.find({ "meta.taskId": task._id });
      }
    }
  }
};
</script>

<style scoped>
input {
  padding: 14px;
}
.progress {
  text-align: center;
}
</style>
