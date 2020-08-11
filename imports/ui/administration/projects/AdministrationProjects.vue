<template>
  <div class="projects">
    <v-card class="center">
      <v-card-text>
        <v-container>
          <v-row>
            <v-col cols="12" sm="12" lg="10">
              <v-text-field
                :label="$t('Search') + '...'"
                single-line
                append-icon="mdi-magnify"
                clearable
                @input="debouncedFilter"
              />
            </v-col>
            <v-col sm="6" md="6" lg="2">
              <v-switch
                v-model="filterDeleted"
                color="accent"
                :label="$t('Deleted')"
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-btn
                :loading="migrating"
                :disabled="migrating"
                @click="migrateToFeatures()"
              >
                {{ $t("Migrate to features") }}
              </v-btn>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-list subheader>
                <v-subheader inset>
                  {{ pagination.totalItems }} {{ $t("Projects") }}
                </v-subheader>
                <template v-for="project in projects">
                  <v-list-item :key="project._id" @click="openDetail(project)">
                    <v-list-item-avatar :color="getColor(project)">
                      <v-icon :class="getVisibilityIconClass(project)">
                        {{ getVisibilityIcon(project) }}
                      </v-icon>
                    </v-list-item-avatar>
                    <v-list-item-content>
                      <v-list-item-title :class="getClass(project)">
                        {{ project.name }}
                      </v-list-item-title>
                      <v-list-item-subtitle>
                        <author-line
                          :user-id="project.createdBy"
                          :date="project.createdAt"
                          class="author"
                          :prefix="$t('Created by')"
                        />
                      </v-list-item-subtitle>
                    </v-list-item-content>
                    <v-list-item-action v-if="project.deleted">
                      <v-btn
                        color="red"
                        icon
                        ripple
                        @click.stop="deleteForever(project)"
                      >
                        <v-icon>mdi-delete-forever</v-icon>
                      </v-btn>
                    </v-list-item-action>
                    <v-list-item-action v-if="project.deleted">
                      <v-btn
                        color="blue"
                        icon
                        ripple
                        @click.stop="restoreProject(project)"
                      >
                        <v-icon>mdi-delete-restore</v-icon>
                      </v-btn>
                    </v-list-item-action>
                    <v-list-item-action v-if="!project.deleted">
                      <v-btn icon ripple @click.stop="removeProject(project)">
                        <v-icon>mdi-delete</v-icon>
                      </v-btn>
                    </v-list-item-action>
                  </v-list-item>
                </template>
              </v-list>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <div class="text-xs-center">
                <v-pagination
                  v-if="pagination.totalPages > 0"
                  v-model="page"
                  :length="pagination.totalPages"
                />
              </div>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import { Meteor } from "meteor/meteor";
import { ProjectAccessRights } from "/imports/api/projects/projects.js";

import debounce from "lodash/debounce";

export default {
  name: "AdministrationProjects",
  data() {
    return {
      search: "",
      debouncedFilter: null,
      projects: [],
      showProjectDetail: false,
      page: 1,
      pagination: {
        totalItems: 0,
        rowsPerPage: 0,
        totalPages: 0
      },
      filterDeleted: false,
      migrating: false
    };
  },
  watch: {
    page() {
      this.refresh();
    },
    filterDeleted() {
      if (this.page !== 1) {
        this.page = 1;
      } else {
        this.refresh();
      }
    },
    search() {
      if (this.page > 1) {
        this.page = 1;
      } else {
        this.refresh();
      }
    }
  },
  mounted() {
    this.refresh();
  },
  created() {
    this.debouncedFilter = debounce((val) => {
      this.search = val;
    }, 400);
  },
  methods: {
    refresh() {
      Meteor.call(
        "admin.findProjects",
        {
          page: this.page,
          filter: this.search,
          isDeleted: this.filterDeleted
        },
        (error, result) => {
          if (error) {
            this.$notifyError(error);
            return;
          }
          this.pagination.totalItems = result.totalItems;
          this.pagination.rowsPerPage = result.rowsPerPage;
          this.pagination.totalPages = result.totalPages;

          this.projects = result.data;
          this.projects.forEach((project) => {
            if (!project.profile) {
              project.profile = {
                firstName: "",
                lastName: ""
              };
            }
          });
        }
      );
    },

    removeProject(project) {
      this.$confirm(this.$t("Delete project?"), {
        title: project.name,
        cancelText: this.$t("Cancel"),
        confirmText: this.$t("Delete")
      }).then((res) => {
        if (res) {
          Meteor.call(
            "projects.remove",
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
    },

    restoreProject(project) {
      Meteor.call("projects.restore", { projectId: project._id }, (error) => {
        if (error) {
          this.$notifyError(error);
          return;
        }
        this.$notify(this.$t("Project restored"));
        this.refresh();
      });
    },

    openDetail(project) {
      this.$router.push({
        name: "project",
        params: { projectId: project._id }
      });
    },

    getClass(project) {
      if (project.deleted) {
        return "deleted";
      }
      return "";
    },

    getVisibilityIcon(project) {
      if (project.accessRights === ProjectAccessRights.ORGANIZATION) {
        return "mdi-eye";
      }
      return "mdi-eye-off";
    },

    getVisibilityIconClass(project) {
      if (project.accessRights === ProjectAccessRights.ORGANIZATION) {
        return "";
      }
      return "";
    },

    getColor(project) {
      return project.color;
    },

    migrateToFeatures() {
      this.migrating = true;
      Meteor.call("admin.projectsMigrateFeatures", {}, (error) => {
        this.migrating = false;
        if (error) {
          this.$notifyError(error);
          return;
        }
        this.$notify(this.$t("Migration finished"));
      });
    }
  }
};
</script>

<style scoped>
.projects {
  background-color: #e5e5e5;
}

.deleted {
  text-decoration: line-through;
}

.center {
  max-width: 800px;
  margin: 0 auto;
  margin-top: 24px;
}
</style>
