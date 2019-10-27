<template>
  <div class="projects">
    <new-project ref="newProject" :organization-id="organizationId" />
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
    <div v-if="!$subReady.projects">
      <v-progress-linear indeterminate />
    </div>
    <div v-if="$subReady.projects">
      <empty-state
        v-if="projects.length == 0"
        :description="`Aucun projet disponible`"
        illustration="project"
      >
        <v-btn class="primary" @click="newProject">
          {{ $t("Create new project") }}
        </v-btn>
      </empty-state>
      <v-list
        v-show="projects.length != 0"
        two-line
        subheader
        class="elevation-1"
      >
        <v-subheader>
          <router-link class="link" :to="{ name: 'dashboard-page' }">
            {{ organization.name }}
          </router-link>
          &nbsp;> Projets
          <v-btn fab dark small color="pink" @click="newProject">
            <v-icon>mdi-plus</v-icon>
          </v-btn>
        </v-subheader>

        <template v-for="state in projectStates()">
          <v-subheader :key="state.value">
            {{ state.label }}
          </v-subheader>
          <template v-for="item in filterProjectsByState(projects, state.value)">
            <v-list-item :key="item._id" @click="openProject(item._id)">
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
                <v-btn
                  icon
                  text
                  color="grey darken-1"
                  @click.stop="openProjectSettings(item._id)"
                >
                  <v-icon>mdi-settings</v-icon>
                </v-btn>
              </v-list-item-action>
              <v-list-item-action class="show-desktop">
                <v-btn
                  icon
                  text
                  color="grey darken-1"
                  @click.stop="cloneProject(item._id)"
                >
                  <v-icon>mdi-content-copy</v-icon>
                </v-btn>
              </v-list-item-action>
              <v-list-item-action
                v-if="canDeleteProject(item)"
                class="show-desktop"
              >
                <v-btn
                  icon
                  text
                  color="grey darken-1"
                  @click.stop="deleteProject(item._id)"
                >
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </v-list-item-action>
            </v-list-item>
          </template>
        </template>
      </v-list>
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
import { mapState } from "vuex";

import { Permissions } from "/imports/api/permissions/permissions";

export default {
  mixins: [DatesMixin],
  props: {
    organizationId: {
      type: String,
      default: "0"
    }
  },
  data() {
    return {
      filter: "",
      selected: [],
      filteredProjects: [],
      showConfirmDialog: false,
      showConfirmCloneDialog: false,
      currentSort: "name",
      currentSortOrder: "asc",
      projectId: ""
    };
  },
  computed: {
    ...mapState(["selectedGroup"])
  },
  mounted() {
    this.$events.listen("filter-projects", (name) => {
      this.filter = name;
    });
    this.$store.dispatch("setShowCategories", true);
  },
  beforeDestroy() {
    this.$events.off("filter-projects");
    this.$store.dispatch("setShowCategories", false);
  },
  meteor: {
    // Subscriptions
    $subscribe: {
      // Subscribes to the 'threads' publication with no parameters
      projects() {
        // Here you can use Vue reactive properties
        return [
          this.organizationId,
          this.filter,
          this.$store.state.selectedGroup._id
        ]; // Subscription params
      },
      organization() {
        // Here you can use Vue reactive properties
        return [this.organizationId]; // Subscription params
      },
      projectGroups() {
        return [this.organizationId];
      }
    },
    projects() {
      this.$events.fire("projects-loaded");
      return Projects.find(
        {},
        {
          sort: { state: 1, name: 1 }
        }
      );
    },
    organization() {
      return Organizations.findOne();
    }
  },
  methods: {
    newProject() {
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

    openProject(id) {
      this.$router.push({ name: "project", params: { projectId: id } });
    },

    openProjectSettings(id) {
      this.$router.push({
        name: "project-settings",
        params: { projectId: id }
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

    filterProjectsByState(projects, state) {
      return projects.filter((project) => project.state === state);
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
    }
  }
};
</script>

<style scoped>
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
</style>
