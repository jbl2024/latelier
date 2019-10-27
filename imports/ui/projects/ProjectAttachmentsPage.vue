<template>
  <div class="project-attachments-page">
    <div v-if="!$subReady.project">
      <v-progress-linear indeterminate />
    </div>
    <div v-if="$subReady.project">
      <empty-state
        v-show="attachments.length == 0"
        small
        illustration="documents"
        label="Aucune pièce jointe"
        description="Vous pouvez ajouter une pièce jointe sur une tâche"
      />

      <v-list v-show="attachments.length > 0" two-line subheader>
        <v-subheader>Pièces jointes</v-subheader>
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

export default {
  props: {
    projectId: {
      type: String,
      default: "0"
    }
  },
  data() {
    return {};
  },
  mounted() {
    this.$store.dispatch("setCurrentProjectId", this.projectId);
  },
  beforeDestroy() {
    this.$store.dispatch("setCurrentProjectId", 0);
  },
  meteor: {
    // Subscriptions
    $subscribe: {
      project: function() {
        return [this.projectId];
      }
    },
    project() {
      return Projects.findOne();
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
.toolbar {
  background-color: white;
}

.empty-state {
  margin-top: 24px;
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
