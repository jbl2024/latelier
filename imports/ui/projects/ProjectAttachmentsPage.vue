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
        label="Aucune pièce jointe"
        description="Vous pouvez ajouter une pièce jointe sur une tâche"
      />

      <v-list v-show="attachments.length > 0" two-line subheader class="list">
        <v-subheader>
          {{ $t('Attachments') }}
        </v-subheader>
        <v-list-item v-for="attachment in attachments" :key="attachment._id">
          <v-list-item-avatar>
            <v-icon>mdi-file-document</v-icon>
          </v-list-item-avatar>

          <v-list-item-content class="pointer">
            <v-list-item-title>
              <a class="link" :href="link(attachment)" target="_blank">{{
                attachment.name
              }}</a>
            </v-list-item-title>
            <v-list-item-subtitle>
              <router-link
                class="link-subtitle"
                :to="{
                  name: 'project-task',
                  params: {
                    projectId: attachment.meta.projectId,
                    taskId: attachment.meta.taskId
                  }
                }"
              >
                {{ getTask(attachment).name }}
              </router-link>
            </v-list-item-subtitle>
          </v-list-item-content>

          <v-list-item-action>
            <v-btn
              icon
              text
              color="grey darken-1"
              @click.stop="deleteAttachment(attachment)"
            >
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </v-list-item-action>
        </v-list-item>
      </v-list>
    </div>
  </div>
</template>

<script>
import { Projects } from "/imports/api/projects/projects.js";
import { Tasks } from "/imports/api/tasks/tasks.js";
import { Attachments } from "/imports/api/attachments/attachments.js";
import { mapState } from "vuex";

export default {
  props: {
    projectId: {
      type: String,
      default: null
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
        return attachments.filter((attachment) => Tasks.findOne({ _id: attachment.meta.taskId }));
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
    link(attachment) {
      return Attachments.link(attachment);
    },
    getTask(attachment) {
      return Tasks.findOne({ _id: attachment.meta.taskId });
    },
    deleteAttachment(attachment) {
      this.$confirm(this.$t("Delete attachment?"), {
        title: attachment.name,
        cancelText: this.$t("Cancel"),
        confirmText: this.$t("Delete")
      }).then((res) => {
        if (res) {
          Meteor.call("attachments.remove", attachment._id);
        }
      });
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
