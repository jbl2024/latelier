<template>
  <div class="dashboard-projects">
    <new-organization ref="newOrganization" />
    <new-project ref="newProject" :organization-id="organizationId" />
    <projects-trashcan ref="projectsTrashcan" />
    <confirm-dialog
      :active.sync="showConfirmDialog"
      title="Confirmer la suppression ?"
      content="Le projet sera définitivement supprimé"
      confirm-text="Supprimer"
      cancel-text="Annuler"
      @cancel="onCancelDeleteProject"
      @confirm="onConfirmDeleteProject"
    />
    <confirm-dialog
      :active.sync="showConfirmCloneDialog"
      title="Confirmer le clonage ?"
      content="Le projet sera cloné"
      confirm-text="Confirmer"
      cancel-text="Annuler"
      @cancel="onCancelCloneProject"
      @confirm="onConfirmCloneProject"
    />
    <div v-if="!$subReady.allProjects">
      <v-progress-linear indeterminate />
    </div>
    <div v-if="$subReady.allProjects">
      <template v-if="projects.length == 0 && organizations.length == 0">
        <!-- eslint-disable -->
        <empty-state
          description="Vous n'avez encore aucun projet. Vous pouvez commencer par créer un projet ou alors une organisation qui pourra contenir des membres et des projets communs"
          illustration="project"
        >
          <v-btn text @click="newProject()">
            {{ $t("Create new project") }}
          </v-btn>
          <v-btn class="primary" @click="newOrganization()">
            {{ $t("Create new organization") }}
          </v-btn>
        </empty-state>
        <!-- eslint-enable -->
      </template>

      <template v-if="projects.length > 0 || organizations.length > 0">
        <v-list
          v-if="favorites.length > 0"
          two-line
          subheader
          class="elevation-1"
        >
          <v-toolbar class="pointer" color="primary" dark>
            <v-icon>mdi-star</v-icon>
            <v-toolbar-title>{{ $t("Favorites") }}</v-toolbar-title>
          </v-toolbar>
          <template v-for="item in favorites">
            <v-list-item :key="item._id" @click="openProject(item)">
              <v-list-item-avatar :color="getColor(item)">
                <v-icon :class="getVisibilityIconClass(item)">
                  {{ getVisibilityIcon(item) }}
                </v-icon>
              </v-list-item-avatar>
              <v-list-item-content class="pointer">
                <v-list-item-title>{{ item.name }}</v-list-item-title>
                <v-list-item-subtitle>
                  {{ formatProjectDates(item) }}
                </v-list-item-subtitle>
              </v-list-item-content>
              <v-list-item-action
                v-for="group in getProjectGroups(item)"
                :key="group._id"
                class="show-desktop"
                @click.stop="selectGroup(group)"
              >
                <v-chip small color="primary" text-color="white">
                  {{ group.name }}
                </v-chip>
              </v-list-item-action>
              <v-list-item-action
                v-if="canManageProject(item)"
                class="show-desktop"
              >
                <v-tooltip top>
                  <template v-slot:activator="{ on }">
                    <v-btn
                      icon
                      text
                      color="grey darken-1"
                      v-on="on"
                      @click.stop="openProjectSettings(item)"
                    >
                      <v-icon>mdi-settings</v-icon>
                    </v-btn>
                  </template>
                  <span>{{ $t("Settings") }}</span>
                </v-tooltip>
              </v-list-item-action>
              <v-list-item-action class="show-desktop">
                <v-tooltip top>
                  <template v-slot:activator="{ on }">
                    <v-btn
                      icon
                      text
                      color="grey darken-1"
                      @click.stop="cloneProject(item._id)"
                      v-on="on"
                    >
                      <v-icon>mdi-content-copy</v-icon>
                    </v-btn>
                  </template>
                  <span>{{ $t("Clone") }}</span>
                </v-tooltip>
              </v-list-item-action>
              <v-list-item-action
                v-if="canDeleteProject(item)"
                class="show-desktop"
              >
                <v-tooltip top>
                  <template v-slot:activator="{ on }">
                    <v-btn
                      icon
                      text
                      color="grey darken-1"
                      @click.stop="deleteProject(item._id)"
                      v-on="on"
                    >
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </template>
                  <span>{{ $t("Move to trash") }}</span>
                </v-tooltip>
              </v-list-item-action>
            </v-list-item>
            <v-divider :key="`divider-${item._id}`" inset />
          </template>
        </v-list>

        <v-list two-line subheader class="elevation-1">
          <v-toolbar class="pointer" color="primary" dark>
            <v-icon>mdi-account-circle</v-icon>
            <v-toolbar-title>{{ $t("Individuals") }}</v-toolbar-title>
            <v-spacer />

            <div>
              <v-tooltip top>
                <template v-slot:activator="{ on }">
                  <v-btn icon @click.stop="newProject()" v-on="on">
                    <v-icon>mdi-plus</v-icon>
                  </v-btn>
                </template>
                <span>{{ $t("New project") }}</span>
              </v-tooltip>
            </div>
          </v-toolbar>
          <template v-for="item in individuals">
            <v-list-item :key="item._id" @click="openProject(item)">
              <v-list-item-avatar :color="getColor(item)">
                <v-icon :class="getVisibilityIconClass(item)">
                  {{ getVisibilityIcon(item) }}
                </v-icon>
              </v-list-item-avatar>
              <v-list-item-content class="pointer">
                <v-list-item-title>{{ item.name }}</v-list-item-title>
                <v-list-item-subtitle>
                  {{ formatProjectDates(item) }}
                </v-list-item-subtitle>
              </v-list-item-content>
              <v-list-item-action
                v-for="group in getProjectGroups(item)"
                :key="group._id"
                class="show-desktop"
                @click.stop="selectGroup(group)"
              >
                <v-chip small color="primary" text-color="white">
                  {{ group.name }}
                </v-chip>
              </v-list-item-action>
              <v-list-item-action
                v-if="canManageProject(item)"
                class="show-desktop"
              >
                <v-tooltip top>
                  <template v-slot:activator="{ on }">
                    <v-btn
                      icon
                      text
                      color="grey darken-1"
                      v-on="on"
                      @click.stop="openProjectSettings(item)"
                    >
                      <v-icon>mdi-settings</v-icon>
                    </v-btn>
                  </template>
                  <span>{{ $t("Settings") }}</span>
                </v-tooltip>
              </v-list-item-action>
              <v-list-item-action class="show-desktop">
                <v-tooltip top>
                  <template v-slot:activator="{ on }">
                    <v-btn
                      icon
                      text
                      color="grey darken-1"
                      @click.stop="cloneProject(item._id)"
                      v-on="on"
                    >
                      <v-icon>mdi-content-copy</v-icon>
                    </v-btn>
                  </template>
                  <span>{{ $t("Clone") }}</span>
                </v-tooltip>
              </v-list-item-action>
              <v-list-item-action
                v-if="canDeleteProject(item)"
                class="show-desktop"
              >
                <v-tooltip top>
                  <template v-slot:activator="{ on }">
                    <v-btn
                      icon
                      text
                      color="grey darken-1"
                      @click.stop="deleteProject(item._id)"
                      v-on="on"
                    >
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </template>
                  <span>{{ $t("Move to trash") }}</span>
                </v-tooltip>
              </v-list-item-action>
            </v-list-item>
            <v-divider :key="`divider-${item._id}`" inset />
          </template>
        </v-list>

        <v-list
          v-show="organizations.length != 0"
          two-line
          subheader
          class="elevation-1"
        >
          <template v-for="organization in organizations">
            <v-toolbar
              :key="`${organization._id}-toolbar`"
              class="pointer"
              color="primary"
              dark
              @click="openOrganization(organization._id)"
            >
              <v-icon>mdi-domain</v-icon>

              <v-toolbar-title>{{ organization.name }}</v-toolbar-title>

              <v-spacer />

              <div>
                <v-tooltip top>
                  <template v-slot:activator="{ on }">
                    <v-btn
                      icon
                      @click.stop="newProject(organization._id)"
                      v-on="on"
                    >
                      <v-icon>mdi-plus</v-icon>
                    </v-btn>
                  </template>
                  <span>{{ $t("New project") }}</span>
                </v-tooltip>
              </div>

              <div>
                <v-tooltip top>
                  <template v-slot:activator="{ on }">
                    <v-btn
                      icon
                      @click.stop="openOrganizationTimeline(organization._id)"
                      v-on="on"
                    >
                      <v-icon>mdi-chart-timeline-variant</v-icon>
                    </v-btn>
                  </template>
                  <span>{{ $t("Timeline") }}</span>
                </v-tooltip>
              </div>

              <div>
                <v-tooltip top>
                  <template v-slot:activator="{ on }">
                    <v-btn
                      v-if="canManageOrganization(organization)"
                      icon
                      @click.stop="openOrganizationSettings(organization._id)"
                      v-on="on"
                    >
                      <v-icon>mdi-settings</v-icon>
                    </v-btn>
                  </template>
                  <span>{{ $t("Settings") }}</span>
                </v-tooltip>
              </div>

              <div>
                <v-tooltip top>
                  <template v-slot:activator="{ on }">
                    <v-btn
                      v-if="canDeleteOrganization(organization)"
                      icon
                      @click.stop="deleteOrganization(organization)"
                      v-on="on"
                    >
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </template>
                  <span>{{ $t("Delete") }}</span>
                </v-tooltip>
              </div>
            </v-toolbar>

            <empty-state
              v-if="projectsByOrganization(organization).length == 0"
              :key="`${organization._id}-empty`"
              small
              :description="`Aucun projet disponible`"
              illustration="project"
            >
              <v-btn class="primary" @click="newProject(organization._id)">
                {{ $t("Create new project") }}
              </v-btn>
            </empty-state>

            <template v-for="state in projectStates()">
              <v-subheader
                v-if="
                  filterProjectsByState(organization, projects, state.value)
                    .length > 0
                "
                :key="`${organization._id}-${state.value}`"
              >
                {{ state.label }}
              </v-subheader>
              <template
                v-for="item in filterProjectsByState(
                  organization,
                  projects,
                  state.value
                )"
              >
                <v-list-item :key="item._id" @click="openProject(item)">
                  <v-list-item-avatar :color="getColor(item)">
                    <v-icon :class="getVisibilityIconClass(item)">
                      {{ getVisibilityIcon(item) }}
                    </v-icon>
                  </v-list-item-avatar>
                  <v-list-item-content class="pointer">
                    <v-list-item-title>{{ item.name }}</v-list-item-title>
                    <v-list-item-subtitle>
                      {{ formatProjectDates(item) }}
                    </v-list-item-subtitle>
                  </v-list-item-content>
                  <v-list-item-action
                    v-for="group in getProjectGroups(item)"
                    :key="group._id"
                    class="show-desktop"
                    @click.stop="selectGroup(group)"
                  >
                    <v-chip small color="primary" text-color="white">
                      {{ group.name }}
                    </v-chip>
                  </v-list-item-action>
                  <v-list-item-action
                    v-if="canManageProject(item)"
                    class="show-desktop"
                  >
                    <v-tooltip top>
                      <template v-slot:activator="{ on }">
                        <v-btn
                          icon
                          text
                          color="grey darken-1"
                          v-on="on"
                          @click.stop="openProjectSettings(item)"
                        >
                          <v-icon>mdi-settings</v-icon>
                        </v-btn>
                      </template>
                      <span>{{ $t("Settings") }}</span>
                    </v-tooltip>
                  </v-list-item-action>
                  <v-list-item-action class="show-desktop">
                    <v-tooltip top>
                      <template v-slot:activator="{ on }">
                        <v-btn
                          icon
                          text
                          color="grey darken-1"
                          @click.stop="cloneProject(item._id)"
                          v-on="on"
                        >
                          <v-icon>mdi-content-copy</v-icon>
                        </v-btn>
                      </template>
                      <span>{{ $t("Clone") }}</span>
                    </v-tooltip>
                  </v-list-item-action>
                  <v-list-item-action
                    v-if="canDeleteProject(item)"
                    class="show-desktop"
                  >
                    <v-tooltip top>
                      <template v-slot:activator="{ on }">
                        <v-btn
                          icon
                          text
                          color="grey darken-1"
                          @click.stop="deleteProject(item._id)"
                          v-on="on"
                        >
                          <v-icon>mdi-delete</v-icon>
                        </v-btn>
                      </template>
                      <span>{{ $t("Move to trash") }}</span>
                    </v-tooltip>
                  </v-list-item-action>
                </v-list-item>
                <v-divider :key="`divider-${item._id}`" inset />
              </template>
            </template>
            <v-divider :key="`${organization._id}-divider`" />
          </template>

          <div class="bottom-buttons">
            <v-btn @click="newOrganization">
              {{ $t("Create new organization") }}
            </v-btn>
            <v-btn text @click="$refs.projectsTrashcan.open()">
              {{ $t("Trashcan") }}
            </v-btn>
          </div>
        </v-list>

        <empty-state
          v-if="organizations.length == 0"
          small
          :description="`Aucune organisation disponible`"
          illustration="empty"
        >
          <v-btn class="primary" @click="newOrganization">
            {{ $t("Create new organization") }}
          </v-btn>
        </empty-state>
      </template>
    </div>
  </div>
</template>

<script>
import {
  Projects,
  ProjectStates,
  ProjectAccessRights
} from "/imports/api/projects/projects.js";
import { ProjectGroups } from "/imports/api/projectGroups/projectGroups.js";
import { Organizations } from "/imports/api/organizations/organizations.js";
import DatesMixin from "/imports/ui/mixins/DatesMixin.js";

import { Permissions } from "/imports/api/permissions/permissions";

export default {
  mixins: [DatesMixin],
  data() {
    return {
      on: false,
      filter: "",
      selected: [],
      filteredProjects: [],
      showConfirmDialog: false,
      showConfirmCloneDialog: false,
      currentSort: "name",
      currentSortOrder: "asc",
      projectId: "",
      organizationId: null
    };
  },
  mounted() {
    this.$events.listen("filter-projects", (name) => {
      this.filter = name;
    });
  },
  beforeDestroy() {
    this.$events.off("filter-projects");
  },
  meteor: {
    $subscribe: {
      allProjects: function() {
        return [this.filter];
      },
      organizations: function() {
        return [this.filter];
      }
    },
    projects() {
      return Projects.find(
        {},
        {
          sort: { organizationId: 1, state: 1, name: 1 }
        }
      );
    },
    organizations() {
      return Organizations.find({}, { sort: { name: 1 } });
    },
    favorites() {
      const user = Meteor.user() || { profile: {} };
      let favorites = [];
      if (user && user.profile) {
        favorites = user.profile.favoriteProjects || [];
      }
      return Projects.find(
        { _id: { $in: favorites } },
        {
          sort: { organizationId: 1, state: 1, name: 1 }
        }
      );
    },
    individuals() {
      const organizationIds = [];
      Organizations.find({})
        .fetch()
        .forEach((organization) => {
          organizationIds.push(organization._id);
        });
      return Projects.find(
        {
          organizationId: {
            $nin: organizationIds
          }
        },
        {
          sort: { state: 1, name: 1 }
        }
      );
    }
  },
  methods: {
    newOrganization() {
      this.$refs.newOrganization.open();
    },
    newProject(organizationId) {
      this.organizationId = organizationId;
      this.$refs.newProject.open();
    },
    deleteProject(projectId) {
      this.projectId = projectId;
      this.showConfirmDialog = true;
    },

    onConfirmDeleteProject() {
      this.showConfirmDialog = false;
      Meteor.call("projects.remove", { projectId: this.projectId });
    },

    onCancelDeleteProject() {
      this.showConfirmDialog = false;
    },

    cloneProject(projectId) {
      this.projectId = projectId;
      this.showConfirmCloneDialog = true;
    },

    onConfirmCloneProject() {
      this.showConfirmCloneDialog = false;
      Meteor.call(
        "projects.clone",
        { projectId: this.projectId },
        (error) => {
          if (error) {
            this.$store.dispatch("notifyError", error);
          } else {
            this.$store.dispatch(
              "notify",
              this.$t("Project cloned successfully")
            );
          }
        }
      );
    },

    onCancelCloneProject() {
      this.showConfirmCloneDialog = false;
    },

    openProject(project) {
      this.$router.push({
        name: "project",
        params: {
          projectId: project._id
        }
      });
    },

    openProjectSettings(project) {
      this.$router.push({
        name: "project-settings",
        params: {
          organizationId: project.organizationId,
          projectId: project._id
        }
      });
    },

    customSort(value) {
      return value.sort((a, b) => {
        const sortBy = this.currentSort;

        if (this.currentSortOrder === "desc") {
          if (a[sortBy] instanceof Date) {
            return a[sortBy] > b[sortBy];
          }
          return a[sortBy].localeCompare(b[sortBy]);
        }
        if (b[sortBy] instanceof Date) {
          return b[sortBy] > a[sortBy];
        }

        return b[sortBy].localeCompare(a[sortBy]);
      });
    },
    getDescription() {
      if (this.filter.length === 0) {
        return "";
      }
      return `Aucun projet trouvé pour '${this.filter}'. Essayer avec un autre terme ou créer un projet`;
    },
    deselectGroup() {
      this.$store.dispatch("setSelectedGroup", null);
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

    getColor(item) {
      return item.color;
    },

    formatProjectDates(project) {
      if (project.startDate && project.endDate) {
        return `Du ${this.formatDate(project.startDate)} au ${this.formatDate(project.endDate)}`;
      }
      if (project.startDate) {
        return `A partir du ${this.formatDate(project.startDate)}`;
      }
      if (project.endtDate) {
        return `Jusqu'au ${this.formatDate(project.endDate)}`;
      }
      return "";
    },

    getProjectGroups(project) {
      return ProjectGroups.find(
        { projects: project._id },
        { sort: { name: 1 } }
      ).fetch();
    },
    selectGroup(group) {
      const { selectedGroup } = this.$store.state;
      if (selectedGroup && selectedGroup._id === group._id) {
        this.$store.dispatch("setSelectedGroup", null);
      } else {
        this.$store.dispatch("setSelectedGroup", group);
      }
    },
    projectStates() {
      const states = [];
      Object.keys(ProjectStates).forEach((state) => {
        states.push({
          value: ProjectStates[state],
          label: this.$t(`projects.state.${state}`)
        });
      });
      return states;
    },

    filterProjectsByState(organization, projects, state) {
      return projects.filter(
        (project) => project.state === state && project.organizationId === organization._id
      );
    },

    projectsByOrganization(organization) {
      return Projects.find({ organizationId: organization._id }).fetch();
    },

    deleteOrganization(organization) {
      this.$confirm(this.$t("Delete organization?"), {
        title: organization.name,
        cancelText: this.$t("Cancel"),
        confirmText: this.$t("Delete")
      }).then((res) => {
        if (res) {
          Meteor.call(
            "organizations.remove",
            organization._id,
            (error) => {
              if (error) {
                this.$store.dispatch("notifyError", error);
                return;
              }
              this.$store.dispatch("notify", this.$t("Organization deleted"));
            }
          );
        }
      });
    },

    canDeleteProject(project) {
      if (
        Permissions.isAdmin(Meteor.userId())
        || project.createdBy === Meteor.userId()
      ) {
        return true;
      }
      return false;
    },

    canManageProject(project) {
      return (
        Permissions.isAdmin(Meteor.userId(), project._id)
        || Permissions.isAdmin(Meteor.userId())
      );
    },

    canDeleteOrganization(organization) {
      if (
        Permissions.isAdmin(Meteor.userId(), organization._id)
        || Permissions.isAdmin(Meteor.userId())
      ) {
        return true;
      }
      return false;
    },

    canManageOrganization(organization) {
      if (
        Permissions.isAdmin(Meteor.userId(), organization._id)
        || Permissions.isAdmin(Meteor.userId())
      ) {
        return true;
      }
      return false;
    },

    openOrganization(id) {
      this.$router.push({
        name: "projects-page",
        params: { organizationId: id }
      });
    },

    openOrganizationSettings(id) {
      this.$router.push({
        name: "organization-settings",
        params: { organizationId: id }
      });
    },

    openOrganizationTimeline(id) {
      this.$router.push({
        name: "projects-timeline",
        params: { organizationId: id }
      });
    }
  }
};
</script>

<style scoped>
.pointer {
  cursor: pointer;
}
.project-name {
  color: black !important;
  font-weight: normal;
}

.row {
  cursor: pointer;
}

.title {
  font-size: 20px;
  font-weight: normal;
  margin-right: 12px;
}

.pointer {
  cursor: pointer;
}

@media (min-width: 601px) {
  .fap-list {
    margin-right: 92px;
    margin-left: 48px;
  }
}

@media (max-width: 600px) {
  .fap-list {
    margin-right: auto;
    margin-left: auto;
  }
}

.link {
  text-decoration: none;
}

.bottom-buttons {
  border-top: 1px solid #455a64;
  margin: 0px;
  padding: 24px;
  text-align: center;
}

.empty-state {
  margin-top: 24px;
}
</style>
