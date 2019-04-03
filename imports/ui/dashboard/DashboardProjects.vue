<template>
  <div class="dashboard-projects">
    <new-organization ref="newOrganization"></new-organization>
    <new-project ref="newProject" :organizationId="organizationId"></new-project>
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
      <v-progress-linear indeterminate></v-progress-linear>
    </div>
    <div v-if="$subReady.allProjects">
      <empty-state
        v-if="organizations.length == 0"
        :description="`Aucune organisation disponible`"
        illustration="empty"
      >
        <v-btn class="primary" @click="newOrganization">Créer une organisation</v-btn>
      </empty-state>

      <v-list two-line subheader class="elevation-1" dense v-if="favorites.length > 0">
          <v-toolbar
            class="pointer"
            color="primary"
            dark
            dense
            @click="openOrganization(organization._id)"
          >
            <v-icon>star</v-icon>
            <v-toolbar-title>{{ $t('Favorites')}}</v-toolbar-title>
          </v-toolbar>
        <template v-for="item in favorites">
          <v-list-tile :key="item._id" @click="openProject(item)">
            <v-list-tile-avatar :color="getColor(item)">
              <v-icon :class="getVisibilityIconClass(item)">{{ getVisibilityIcon(item) }}</v-icon>
            </v-list-tile-avatar>
            <v-list-tile-content class="pointer">
              <v-list-tile-title>{{ item.name }}</v-list-tile-title>
              <v-list-tile-sub-title>{{ formatProjectDates(item) }}</v-list-tile-sub-title>
            </v-list-tile-content>
            <v-list-tile-action
              v-for="group in getProjectGroups(item)"
              class="show-desktop"
              :key="group._id"
              @click.stop="selectGroup(group)"
            >
              <v-chip small color="primary" text-color="white">{{ group.name }}</v-chip>
            </v-list-tile-action>
            <v-list-tile-action class="show-desktop" v-if="canManageProject(item)">
              <v-tooltip top slot="activator">
                <v-btn
                  icon
                  flat
                  slot="activator"
                  color="grey darken-1"
                  @click.stop="openProjectSettings(item)"
                >
                  <v-icon>settings</v-icon>
                </v-btn>
                <span>{{ $t('Settings') }}</span>
              </v-tooltip>
            </v-list-tile-action>
            <v-list-tile-action class="show-desktop">
              <v-tooltip top slot="activator">
                <v-btn
                  icon
                  flat
                  color="grey darken-1"
                  @click.stop="cloneProject(item._id)"
                  slot="activator"
                >
                  <v-icon>file_copy</v-icon>
                </v-btn>
                <span>{{ $t('Clone') }}</span>
              </v-tooltip>
            </v-list-tile-action>
            <v-list-tile-action class="show-desktop" v-if="canDeleteProject(item)">
              <v-tooltip top slot="activator">
                <v-btn
                  icon
                  flat
                  color="grey darken-1"
                  @click.stop="deleteProject(item._id)"
                  slot="activator"
                >
                  <v-icon>delete</v-icon>
                </v-btn>
                <span>{{ $t('Delete') }}</span>
              </v-tooltip>
            </v-list-tile-action>
          </v-list-tile>
          <v-divider inset :key="`divider-${item._id}`"></v-divider>
        </template>
      </v-list>

      <v-list two-line subheader v-show="organizations.length != 0" class="elevation-1" dense>
        <template v-for="organization in organizations">
          <v-toolbar
            :key="`${organization._id}-toolbar`"
            class="pointer"
            color="primary"
            dark
            dense
            @click="openOrganization(organization._id)"
          >
            <v-icon>domain</v-icon>

            <v-toolbar-title>{{ organization.name}}</v-toolbar-title>

            <v-spacer></v-spacer>

            <div>
              <v-tooltip top slot="activator">
                <v-btn icon @click.stop="newProject(organization._id)" slot="activator">
                  <v-icon>add</v-icon>
                </v-btn>
                <span>{{ $t('New project') }}</span>
              </v-tooltip>
            </div>

            <div>
              <v-tooltip top slot="activator">
                <v-btn
                  icon
                  @click.stop="openOrganizationSettings(organization._id)"
                  v-if="canManageOrganization(organization)"
                  slot="activator"
                >
                  <v-icon>settings</v-icon>
                </v-btn>
                <span>{{ $t('Settings') }}</span>
              </v-tooltip>
            </div>

            <div>
              <v-tooltip top slot="activator">
                <v-btn
                  icon
                  @click.stop="deleteOrganization(organization)"
                  v-if="canDeleteOrganization(organization)"
                  slot="activator"
                >
                  <v-icon>delete</v-icon>
                </v-btn>
                <span>{{ $t('Delete') }}</span>
              </v-tooltip>
            </div>
          </v-toolbar>

          <empty-state
            small
            :key="`${organization._id}-empty`"
            v-if="projectsByOrganization(organization).length == 0"
            :description="`Aucun projet disponible`"
            illustration="project"
          >
            <v-btn class="primary" @click="newProject(organization._id)">Créer un nouveau projet</v-btn>
          </empty-state>

          <template v-for="item in projectStates()">
            <v-subheader
              :key="`${organization._id}-${item.value}`"
              v-if="filterProjectsByState(organization, projects, item.value).length > 0"
            >{{ item.label }}</v-subheader>
            <template v-for="item in filterProjectsByState(organization, projects, item.value)">
              <v-list-tile :key="item._id" @click="openProject(item)">
                <v-list-tile-avatar :color="getColor(item)">
                  <v-icon :class="getVisibilityIconClass(item)">{{ getVisibilityIcon(item) }}</v-icon>
                </v-list-tile-avatar>
                <v-list-tile-content class="pointer">
                  <v-list-tile-title>{{ item.name }}</v-list-tile-title>
                  <v-list-tile-sub-title>{{ formatProjectDates(item) }}</v-list-tile-sub-title>
                </v-list-tile-content>
                <v-list-tile-action
                  v-for="group in getProjectGroups(item)"
                  class="show-desktop"
                  :key="group._id"
                  @click.stop="selectGroup(group)"
                >
                  <v-chip small color="primary" text-color="white">{{ group.name }}</v-chip>
                </v-list-tile-action>
                <v-list-tile-action class="show-desktop" v-if="canManageProject(item)">
                  <v-tooltip top slot="activator">
                    <v-btn
                      icon
                      flat
                      slot="activator"
                      color="grey darken-1"
                      @click.stop="openProjectSettings(item)"
                    >
                      <v-icon>settings</v-icon>
                    </v-btn>
                    <span>{{ $t('Settings') }}</span>
                  </v-tooltip>
                </v-list-tile-action>
                <v-list-tile-action class="show-desktop">
                  <v-tooltip top slot="activator">
                    <v-btn
                      icon
                      flat
                      color="grey darken-1"
                      @click.stop="cloneProject(item._id)"
                      slot="activator"
                    >
                      <v-icon>file_copy</v-icon>
                    </v-btn>
                    <span>{{ $t('Clone') }}</span>
                  </v-tooltip>
                </v-list-tile-action>
                <v-list-tile-action class="show-desktop" v-if="canDeleteProject(item)">
                  <v-tooltip top slot="activator">
                    <v-btn
                      icon
                      flat
                      color="grey darken-1"
                      @click.stop="deleteProject(item._id)"
                      slot="activator"
                    >
                      <v-icon>delete</v-icon>
                    </v-btn>
                    <span>{{ $t('Delete') }}</span>
                  </v-tooltip>
                </v-list-tile-action>
              </v-list-tile>
              <v-divider inset :key="`divider-${item._id}`"></v-divider>
            </template>
          </template>
          <v-divider :key="`${organization._id}-divider`"></v-divider>
        </template>

        <div class="bottom-buttons">
          <v-btn @click="newOrganization">{{ $t('Create new organization') }}</v-btn>
        </div>
      </v-list>
    </div>
  </div>
</template>

<script>
import { Projects } from "/imports/api/projects/projects.js";
import { ProjectGroups } from "/imports/api/projectGroups/projectGroups.js";
import { Organizations } from "/imports/api/organizations/organizations.js";
import DatesMixin from "/imports/ui/mixins/DatesMixin.js";
import { mapState } from "vuex";
import { ProjectStates } from "/imports/api/projects/projects.js";
import { Permissions } from "/imports/api/permissions/permissions";


export default {
  mixins: [DatesMixin],
  mounted() {
    this.$events.listen("filter-projects", name => {
      this.filter = name;
    });
  },
  beforeDestroy() {
    this.$events.off("filter-projects");
  },
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
  meteor: {
    // Subscriptions
    $subscribe: {
      // Subscribes to the 'threads' publication with no parameters
      allProjects: function() {
        // Here you can use Vue reactive properties
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
      const user = Meteor.user() || {profile: {}};
      let favorites = [];
      if (user && user.profile) {
        favorites = user.profile.favoriteProjects || [];
      }
      return Projects.find(
        {_id: {$in: favorites}}, 
        {
          sort: { organizationId: 1, state: 1, name: 1 }
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
      Meteor.call("projects.remove", {projectId: this.projectId});
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
      Meteor.call("projects.clone", {projectId: this.projectId});
    },

    onCancelCloneProject() {
      this.showConfirmCloneDialog = false;
    },

    openProject(project) {
      this.$router.push({
        name: "project",
        params: {
          organizationId: project.organizationId,
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
      if (this.filter.length == 0) {
        return "";
      } else {
        return `Aucun projet trouvé pour '${
          this.filter
        }'. Essayer avec un autre terme ou créer un projet`;
      }
    },
    deselectGroup(str, index) {
      this.$store.dispatch("setSelectedGroup", null);
    },

    getVisibilityIcon(project) {
      if (project.isPublic) {
        return "visibility";
      }
      return "visibility_off";
    },

    getVisibilityIconClass(project) {
      if (project.isPublic) {
        return "";
      }
      return "";
    },

    getColor(item) {
      return item.color;
    },

    formatProjectDates(project) {
      if (project.startDate && project.endDate) {
        return (
          "Du  " +
          this.formatDate(project.startDate) +
          " au " +
          this.formatDate(project.endDate)
        );
      } else if (project.startDate) {
        return "A partir du " + this.formatDate(project.startDate);
      } else if (project.endtDate) {
        return "Jusqu'au " + this.formatDate(project.endDate);
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
      var selectedGroup = this.$store.state.selectedGroup;
      if (selectedGroup && selectedGroup._id === group._id) {
        this.$store.dispatch("setSelectedGroup", null);
      } else {
        this.$store.dispatch("setSelectedGroup", group);
      }
    },
    projectStates() {
      const states = [];
      Object.keys(ProjectStates).map(state => {
        states.push({
          value: ProjectStates[state],
          label: this.$t(`projects.state.${state}`)
        });
      });
      return states;
    },

    filterProjectsByState(organization, projects, state) {
      return projects.filter(project => {
        return (
          project.state === state && project.organizationId === organization._id
        );
      });
    },

    projectsByOrganization(organization) {
      return Projects.find({ organizationId: organization._id }).fetch();
    },

    deleteOrganization(organization) {
      this.$confirm(this.$t("Delete organization?"), {
        title: organization.name,
        cancelText: this.$t("Cancel"),
        confirmText: this.$t("Delete")
      }).then(res => {
        if (res) {
          Meteor.call("organizations.remove", organization._id, (error, result) => {
            if (error) {
              this.$store.dispatch("notifyError", error);
              return;
            }
            this.$store.dispatch("notify", this.$t('Organization deleted'));
          });
        }
      });
      
      
    },


    canDeleteProject(project) {
      if (
        Permissions.isAdmin(Meteor.userId()) ||
        project.createdBy === Meteor.userId()
      ) {
        return true;
      }
      return false;
    },

    canManageProject(project) {
      return Permissions.isAdmin(Meteor.userId(), project._id) || Permissions.isAdmin(Meteor.userId());
    },

    canDeleteOrganization(organization) {
      if (
        Permissions.isAdmin(Meteor.userId()) ||
        organization.createdBy === Meteor.userId()
      ) {
        return true;
      }
      return false;
    },

    canManageOrganization(organization) {
      if (
        Permissions.isAdmin(Meteor.userId()) ||
        organization.createdBy === Meteor.userId()
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