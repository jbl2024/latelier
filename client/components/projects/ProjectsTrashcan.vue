<template>
  <div class="projects-trashcan">
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
            v-if="projects && projects.length === 0 && !loading"
            :description="$t('No project')"
            small
            illustration="empty"
          ></empty-state>
          <v-list v-if="projects && !loading">
            <template v-for="project in projects">
              <v-list-tile :key="project._id" @click="restoreProject(project)" avatar>
                <v-list-tile-content>
                  <v-list-tile-title>{{ project.name }}</v-list-tile-title>
                </v-list-tile-content>
                <v-list-tile-action>
                  <v-tooltip top slot="activator">
                    <v-btn icon ripple @click.stop="deleteForever(project)" slot="activator">
                      <v-icon color="red">delete_forever</v-icon>
                    </v-btn>
                    <span>{{ $t('Delete forever') }}</span>
                  </v-tooltip>
                </v-list-tile-action>
                <v-list-tile-action>
                  <v-tooltip top slot="activator">
                    <v-btn icon ripple @click.stop="restoreProject(project)" slot="activator">
                      <v-icon color="primary">restore_from_trash</v-icon>
                    </v-btn>
                    <span>{{ $t('Restore from trash') }}</span>
                  </v-tooltip>
                </v-list-tile-action>
              </v-list-tile>
              <v-divider :key="`divider-${project._id}`"></v-divider>
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
        "Delete forever": "Delete forever",
        "Restore from trash": "Restore from trash"
      },
      fr: {
        "Delete forever": "Supprimer définitivement",
        "Restore from trash": "Restaurer de la corbeille"
      }
    }
  },
  data() {
    return {
      showDialog: false,
      projects: [],
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
      Meteor.call("projects.getDeletedProjects", (error, result) => {
        this.loading = false;
        if (error) {
          this.$store.dispatch("notifyError", error);
          return;
        }
        this.projects = result.data;
      });
    },

    restoreProject(project) {
      Meteor.call("projects.restore", { projectId: project._id }, (error, result) => {
        if (error) {
          this.$store.dispatch("notifyError", error);
          return;
        }
        this.refresh();
      });
    },

    deleteForever(project) {
      this.$confirm(this.$t("Delete forever"), {
        title: project.name,
        cancelText: this.$t("Cancel"),
        confirmText: this.$t("Delete")
      }).then(res => {
        if (res) {
          Meteor.call(
            "projects.deleteForever",
            {projectId: project._id},
            (error, result) => {
              if (error) {
                this.$store.dispatch("notifyError", error);
                return;
              }
              this.$store.dispatch("notify", this.$t("Project deleted"));
              this.refresh();
            }
          );
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