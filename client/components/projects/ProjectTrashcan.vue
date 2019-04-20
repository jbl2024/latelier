<template>
  <div class="project-trashcan">
    <v-dialog v-model="showDialog" :fullscreen="$vuetify.breakpoint.xsOnly" max-width="640px">
      <v-toolbar dark color="primary">
        <v-btn icon flat @click="close()" v-shortkey="['esc']" @shortkey="close()">
          <v-icon>close</v-icon>
        </v-btn>
        <v-toolbar-title>{{ $t('Trashcan')}}</v-toolbar-title>
      </v-toolbar>
      <v-card>
        <v-card-text class="content">
          <v-progress-linear indeterminate v-if="loading"></v-progress-linear>
          <empty-state
            v-if="tasks && tasks.length === 0 && !loading"
            :description="$t('No task')"
            small
            illustration="empty"
          ></empty-state>
          <v-list v-if="tasks && !loading">
            <template v-for="task in tasks">
              <v-list-tile :key="task._id" @click="restoreTask(task)" avatar>
                <v-list-tile-content>
                  <v-list-tile-title>#{{ task.number }} - {{ task.name }}</v-list-tile-title>
                </v-list-tile-content>
                <v-list-tile-action>
                  <v-tooltip top slot="activator">
                    <v-btn icon ripple @click.stop="deleteForever(task)" slot="activator">
                      <v-icon color="red">delete_forever</v-icon>
                    </v-btn>
                    <span>{{ $t('Delete forever') }}</span>
                  </v-tooltip>
                </v-list-tile-action>
                <v-list-tile-action>
                  <v-tooltip top slot="activator">
                    <v-btn icon ripple @click.stop="restoreTask(task)" slot="activator">
                      <v-icon color="primary">restore_from_trash</v-icon>
                    </v-btn>
                    <span>{{ $t('Restore from trash') }}</span>
                  </v-tooltip>
                </v-list-tile-action>
              </v-list-tile>
              <v-divider :key="`divider-${task._id}`"></v-divider>
            </template>
          </v-list>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn flat @click="close()">Fermer</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { Meteor } from "meteor/meteor";
import DatesMixin from "/imports/ui/mixins/DatesMixin.js";
import usersMixin from "/imports/ui/mixins/UsersMixin.js";

export default {
  mixins: [usersMixin, DatesMixin],
  i18n: {
    messages: {
      en: {
        "Delete task?": "Delete task?",
        "Task deleted": "Task deleted",
        "Delete forever": "Delete forever",
        "Restore from trash": "Restore from trash"
      },
      fr: {
        "Delete task?": "Supprimer la tâche ?",
        "Task deleted": "Tâche supprimée",
        "Delete forever": "Supprimer définitivement",
        "Restore from trash": "Restaurer de la corbeille"
      }
    }
  },
  props: {
    projectId: String
  },
  data() {
    return {
      showDialog: false,
      tasks: [],
      loading: true
    };
  },
  methods: {
    open() {
      this.refresh();
      this.showDialog = true;
    },

    close() {
      this.showDialog = false;
    },

    refresh() {
      this.loading = true;
      Meteor.call(
        "projects.getDeletedTasks",
        { projectId: this.projectId },
        (error, result) => {
          this.loading = false;
          if (error) {
            this.$store.dispatch("notifyError", error);
            return;
          }
          this.tasks = result.data;
        }
      );
    },

    restoreTask(task) {
      Meteor.call("tasks.restore", task._id, (error, result) => {
        if (error) {
          this.$store.dispatch("notifyError", error);
          return;
        }
        this.refresh();
      });
    },

    deleteForever(task) {
      this.$confirm(this.$t("Delete task?"), {
        title: task.name,
        cancelText: this.$t("Cancel"),
        confirmText: this.$t("Delete")
      }).then(res => {
        if (res) {
          Meteor.call("tasks.deleteForever", task._id, (error, result) => {
            if (error) {
              this.$store.dispatch("notifyError", error);
              return;
            }
            this.$store.dispatch("notify", this.$t('Task deleted'));
            this.refresh();
          });
        }
      });

    }
  }
};
</script>

<style scoped>
.content {
  overflow-y: auto;
  max-height: 500px;
}
</style>