<template>
  <div class="project-attachments-page">
    <div v-if="!currentProject">
      <v-progress-linear indeterminate />
    </div>
    <div v-else>
      <empty-state
        v-show="attachments.length == 0"
        small
        full-page
        illustration="documents"
        :label="$t('attachments.none')"
        :description="$t('attachments.addDescription')"
      >
        <v-btn class="primary" @click="beginUpload">
          {{ $t("attachments.addAttachments") }}
        </v-btn>
      </empty-state>

      <input
        style="display: none;"
        ref="uploadInput"
        v-if="!isUploading"
        type="file"
        multiple
        :disabled="isUploading"
        @change="onUpload"
      >
      <v-progress-linear v-show="isUploading" indeterminate />
      <attachment-list
        :attachments="attachments"
        @add-attachment="beginUpload"
      />
    </div>
  </div>
</template>

<script>
import { Projects } from "/imports/api/projects/projects.js";
import { Tasks } from "/imports/api/tasks/tasks.js";
import { Attachments } from "/imports/api/attachments/attachments.js";
import { mapState } from "vuex";
import AttachmentList from "/imports/ui/attachments/AttachmentList";

export default {
  components: {
    AttachmentList
  },
  props: {
    projectId: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      file: null,
      isUploading: false
    }
  },
  computed: {
    ...mapState("project", ["currentProject"])
  },
  meteor: {
    $subscribe: {
      project() {
        return [this.projectId];
      }
    },
    project() {
      const project = Projects.findOne();
      if (project) {
        this.$store.dispatch("project/setCurrentProject", project);
      }
    },
    attachments: {
      params() {
        return {
          projectId: this.projectId
        };
      },
      update({ projectId }) {
        const attachments = Attachments.find(
          { "meta.projectId": projectId },
          { sort: { "meta.taskId": 1, name: 1 } }
        ).fetch();
        return attachments;
      }
    }
  },
  watch: {
    projectId() {
      this.$store.dispatch("project/setCurrentProjectId", this.projectId);
    }
  },
  mounted() {
    this.$store.dispatch("project/setCurrentProjectId", this.projectId);
  },
  beforeDestroy() {
    this.$store.dispatch("project/setCurrentProjectId", null);
  },
  methods: {
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
      const that = this;
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

      upload.on("start", function() {
        that.isUploading = true;
      });

      upload.on("end", function(error) {
        that.isUploading = false;
        if (error) {
          this.$notifyError(error);
        } else {
          that.file = null;
        }
      });
      upload.start();
    }
  }
};
</script>
<style scoped>
.list {
  max-width: 800px;
  margin: 0 auto;
  margin-top: 24px;
  margin-bottom: 24px;
}

.toolbar {
  background-color: white;
}

.link {
  text-decoration: none !important;
  color: black;
}

.link-subtitle {
  text-decoration: none !important;
  color: rgba(0, 0, 0, 0.54);
}
</style>
