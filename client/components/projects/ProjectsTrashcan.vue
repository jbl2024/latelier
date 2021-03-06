<template>
  <div class="projects-trashcan">
    <v-dialog
      v-model="showDialog"
      :fullscreen="$vuetify.breakpoint.xsOnly"
      max-width="640px"
    >
      <v-toolbar dark color="primary">
        <v-btn
          v-shortkey="['esc']"
          icon
          text
          @click="close()"
          @shortkey="close()"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-toolbar-title>{{ $t("Trashcan") }}</v-toolbar-title>
      </v-toolbar>
      <v-card>
        <v-card-text class="content">
          <v-progress-linear v-if="loading" indeterminate />
          <empty-state
            v-if="projects && projects.length === 0 && !loading"
            :description="$t('No project')"
            small
            illustration="empty"
          />
          <v-list v-if="projects && !loading">
            <template v-for="project in projects">
              <v-list-item :key="project._id" @click="restoreProject(project)">
                <v-list-item-content>
                  <v-list-item-title>{{ project.name }}</v-list-item-title>
                </v-list-item-content>
                <v-list-item-action>
                  <v-tooltip top>
                    <template v-slot:activator="{ on }">
                      <v-btn
                        icon
                        ripple
                        @click.stop="deleteForever(project)"
                        v-on="on"
                      >
                        <v-icon color="red">
                          mdi-delete-forever
                        </v-icon>
                      </v-btn>
                    </template>
                    <span>{{ $t("Delete forever") }}</span>
                  </v-tooltip>
                </v-list-item-action>
                <v-list-item-action>
                  <v-tooltip top>
                    <template v-slot:activator="{ on }">
                      <v-btn
                        icon
                        ripple
                        @click.stop="restoreProject(project)"
                        v-on="on"
                      >
                        <v-icon color="primary">
                          mdi-delete-restore
                        </v-icon>
                      </v-btn>
                    </template>
                    <span>{{ $t("Restore from trash") }}</span>
                  </v-tooltip>
                </v-list-item-action>
              </v-list-item>
              <v-divider :key="`divider-${project._id}`" />
            </template>
          </v-list>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="close()">
            {{ $t("Close") }}
          </v-btn>
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
          this.$notifyError(error);
          return;
        }
        this.projects = result.data;
      });
    },

    restoreProject(project) {
      Meteor.call(
        "projects.restore",
        { projectId: project._id },
        (error) => {
          if (error) {
            this.$notifyError(error);
            return;
          }
          this.refresh();
        }
      );
    },

    deleteForever(project) {
      this.$confirm(this.$t("Delete forever"), {
        title: project.name,
        cancelText: this.$t("Cancel"),
        confirmText: this.$t("Delete")
      }).then((res) => {
        if (res) {
          Meteor.call(
            "projects.deleteForever",
            { projectId: project._id },
            (error) => {
              if (error) {
                this.$notifyError(error);
                return;
              }
              this.$notify(this.$t("Project deleted"));
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
