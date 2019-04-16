<template>
  <div class="dashboard-desktop">
    <new-organization ref="newOrganization"></new-organization>
    <new-project ref="newProject" :organizationId="organizationId"></new-project>

    <div class="left" v-if="!$subReady.allProjects || !$subReady.organizations || !$subReady.user">
      <v-progress-linear indeterminate></v-progress-linear>
    </div>

    <div class="left" v-if="$subReady.allProjects && $subReady.organizations && $subReady.user">
      <div class="projects-title">
        <v-layout align-center>
          <v-flex grow>{{ $t('Organizations & Projects')}}</v-flex>
          <v-flex shrink>
            <v-menu bottom left class="menu">
              <v-btn small slot="activator" icon>
                <v-icon>more_vert</v-icon>
              </v-btn>
              <v-list dense>
                <v-list-tile @click="newProject()">
                  <v-list-tile-title>{{ $t('New project') }}</v-list-tile-title>
                </v-list-tile>
                <v-list-tile @click="newOrganization()">
                  <v-list-tile-title>{{ $t('New organization') }}</v-list-tile-title>
                </v-list-tile>
              </v-list>
            </v-menu>
          </v-flex>
        </v-layout>
      </div>
      <v-divider></v-divider>

      <template v-if="projects.length == 0 && organizations.length == 0">
        <empty-state
          class="main-empty-state"
          description="Vous n'avez encore aucun projet. Vous pouvez commencer par créer un projet ou alors une organisation qui pourra contenir des membres et des projets communs"
          illustration="project"
        >
          <v-btn flat @click="newProject()">Créer un nouveau projet</v-btn>
          <v-btn class="primary" @click="newOrganization()">Créer une organisation</v-btn>
        </empty-state>
      </template>

      <div class="projects-wrapper">
        <template v-if="favorites.length > 0">
          <div class="header">
            <div class="header-title">{{ $t('Favorites') }}</div>
          </div>
          <v-container
            fluid
            grid-list-xl
            class="projects"
            v-resize="onResizeProjects"
            ref="projects"
          >
            <v-layout row wrap>
              <v-flex v-for="project in favorites" :key="project._id" :class="cardClass">
                <dashboard-project-card :project="project" :user="user"></dashboard-project-card>
              </v-flex>
            </v-layout>
          </v-container>
        </template>

        <template v-if="individuals.length > 0">
          <div class="header">
            <div class="header-title">{{ $t('Individuals') }}</div>
            <div class="header-action">
              <v-btn flat solo class="action-button" @click="newProject()">
                <v-icon left>add</v-icon>
                {{ $t('New project')}}
              </v-btn>
            </div>
          </div>
          <v-list dense two-line class="list">
            <template v-for="project in individuals">
              <dashboard-project-list :key="project._id" :project="project" :user="user"></dashboard-project-list>
            </template>
          </v-list>
        </template>

        <template v-for="organization in organizations">
          <div class="header" :key="`header-${organization._id}`">
            <div class="header-title">
              {{ organization.name }}
              <v-tooltip top slot="activator">
                <v-btn
                  icon
                  small
                  flat
                  color="grey darken-1"
                  @click.stop="openOrganizationTimeline(organization._id)"
                  slot="activator"
                >
                  <v-icon>timeline</v-icon>
                </v-btn>
                <span>{{ $t('Timeline') }}</span>
              </v-tooltip>
              <v-tooltip top slot="activator" v-if="canManageOrganization(organization)">
                <v-btn
                  icon
                  small
                  flat
                  color="grey darken-1"
                  @click.stop="openOrganizationSettings(organization._id)"
                  slot="activator"
                >
                  <v-icon>settings</v-icon>
                </v-btn>
                <span>{{ $t('Settings') }}</span>
              </v-tooltip>
              <v-tooltip top slot="activator">
                <v-btn
                  icon
                  small
                  flat
                  color="grey darken-1"
                  @click.stop="deleteOrganization(organization)"
                  v-if="canDeleteOrganization(organization)"
                  slot="activator"
                >
                  <v-icon>delete</v-icon>
                </v-btn>
                <span>{{ $t('Delete') }}</span>
              </v-tooltip>
            </div>
            <div class="header-action">
              <v-btn flat solo class="action-button" @click="newProject(organization._id)">
                <v-icon left>add</v-icon>
                {{ $t('New project')}}
              </v-btn>
            </div>
          </div>
          <v-list
            :key="`projects-${organization._id}`"
            dense
            two-line
            class="list"
            v-if="projectsByOrganization(organization).length > 0"
          >
            <template v-for="project in projectsByOrganization(organization)">
              <dashboard-project-list :key="project._id" :project="project" :user="user"></dashboard-project-list>
            </template>
          </v-list>

          <empty-state
            small
            :key="`${organization._id}-empty`"
            v-if="projectsByOrganization(organization).length == 0"
            :description="`Aucun projet disponible`"
            illustration="project"
          >
            <v-btn class="primary" @click="newProject(organization._id)">Créer un nouveau projet</v-btn>
          </empty-state>
        </template>
      </div>
    </div>
    <div class="right">
      <div class="tasks" v-if="$subReady.user">
        <div class="tasks-title">{{ $t('Tasks') }}</div>
        <v-divider></v-divider>

        <div class="tabs-wrapper">
          <v-tabs v-model="tab">
            <v-tab>{{ $t('Recents') }}</v-tab>
            <v-tab>{{ $t('Assigned to me') }}</v-tab>
            <v-tab>{{ $t('Late') }}</v-tab>

            <v-tab-item>
              <dashboard-task-list :user="user" type="recent"></dashboard-task-list>
            </v-tab-item>
            <v-tab-item>
              <dashboard-task-list :user="user" type="assignedToMe"></dashboard-task-list>
            </v-tab-item>
            <v-tab-item>
              <dashboard-task-list :user="user" type="late" empty-illustration="celebration"></dashboard-task-list>
            </v-tab-item>
          </v-tabs>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import DashboardTaskList from "/imports/ui/dashboard/common/DashboardTaskList";
import DashboardProjectCard from "/imports/ui/dashboard/desktop/DashboardProjectCard";
import DashboardProjectList from "/imports/ui/dashboard/desktop/DashboardProjectList";
import { Projects } from "/imports/api/projects/projects.js";
import { ProjectGroups } from "/imports/api/projectGroups/projectGroups.js";
import { Organizations } from "/imports/api/organizations/organizations.js";
import DatesMixin from "/imports/ui/mixins/DatesMixin.js";
import { mapState } from "vuex";
import { ProjectStates } from "/imports/api/projects/projects.js";
import { Permissions } from "/imports/api/permissions/permissions";

export default {
  mixins: [DatesMixin],
  props: {},
  components: {
    DashboardTaskList,
    DashboardProjectCard,
    DashboardProjectList
  },
  mounted() {
    this.$store.dispatch("setWindowTitle", this.$t("Dashboard"));
    Meteor.call("users.getEmailPreferences", (error, result) => {
      if (error) {
        this.$store.dispatch("notifyError", error);
        return;
      }
      this.user = result;
    });
  },
  data() {
    return {
      user: null,
      tab: null,
      filter: "",
      organizationId: "",
      cardClass: "card1"
    };
  },
  meteor: {
    $subscribe: {
      allProjects: function() {
        return [this.filter];
      },
      organizations: function() {
        return [this.filter];
      },
      user: function() {
        return [];
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
        .map(organization => {
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
    },
    user() {
      return Meteor.user();
    }
  },
  methods: {
    newOrganization() {
      this.$refs.newOrganization.open();
    },
    toggleTaskAssignedTo() {
      this.user.emailSettings.tasks.assignTo = !this.user.emailSettings.tasks
        .assignTo;
      Meteor.call("users.updateEmailPreferences", this.user.emailSettings);
    },
    newProject(organizationId) {
      this.organizationId = organizationId;
      this.$refs.newProject.open();
    },
    projectsByOrganization(organization) {
      return Projects.find({ organizationId: organization._id }).fetch();
    },
    openOrganizationTimeline(id) {
      this.$router.push({
        name: "projects-timeline",
        params: { organizationId: id }
      });
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
    canManageOrganization(organization) {
      if (
        Permissions.isAdmin(Meteor.userId()) ||
        organization.createdBy === Meteor.userId()
      ) {
        return true;
      }
      return false;
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
    deleteOrganization(organization) {
      this.$confirm(this.$t("Delete organization?"), {
        title: organization.name,
        cancelText: this.$t("Cancel"),
        confirmText: this.$t("Delete")
      }).then(res => {
        if (res) {
          Meteor.call(
            "organizations.remove",
            organization._id,
            (error, result) => {
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

    onResizeProjects() {
      const projects = this.$refs.projects;
      const width = projects.offsetWidth;
      if (width > 600) {
        this.cardClass = "card3";
      } else if (width <= 600 && width > 400) {
        this.cardClass = "card2";
      } else {
        this.cardClass = "card1";
      }
    }
  }
};
</script>

<style scoped>
.dashboard-desktop {
  display: flex;
  flex-direction: row;
  padding-left: 24px;
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  height: 100%;
}

.header {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.header-title {
  flex: 1;
  font-size: 20px;
  font-weight: lighter;
}

.header-action {
  flex: 0;
}

.left {
  flex: 1;
  flex-direction: column;
  overflow-y: auto;
  margin-right: 24px;
  margin-top: 12px;
  display: flex;
}

.right {
  flex-direction: column;
  overflow-y: auto;
  width: 340px;
  background-color: white;
  border-left: 1px solid #ddd;
  display: flex;
  position: relative;
}

.action-button {
  text-transform: none;
  color: #777;
  font-size: 12px;
}

.tasks {
  width: 100%;
}

.projects {
  padding-left: 0;
  padding-right: 12px;
}

.tasks-title {
  margin: 22px;
  text-transform: uppercase;
  font-weight: bold;
  letter-spacing: 0.08em;
  flex: 0;
}

.projects-title {
  text-transform: uppercase;
  font-weight: bold;
  margin-bottom: 12px;
  letter-spacing: 0.08em;
  flex: 0;
}

.projects-wrapper {
  flex: 1;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: auto;
}

.projects-wrapper > .header:first-child {
  margin-top: 24px;
}

.main-empty-state {
  margin-top: 24px;
}

.tabs-wrapper {
  flex: 1;
  flex-direction: column;
  overflow-y: auto;
  display: flex;
  position: absolute;
  left: 0;
  right: 0;
  top: 66px;
  bottom: 0;
}

.card3 {
  flex-basis: calc(100% / 3);
  flex-grow: 0;
  max-width: calc(100% / 3);
}
.card2 {
  flex-basis: calc(100% / 2);
  flex-grow: 0;
  max-width: calc(100% / 2);
}

.card1 {
  flex-basis: 100%;
  flex-grow: 0;
  max-width: 100%;
}

.list {
  border-radius: 4px;
  border: 1px solid #ddd;
  margin-bottom: 24px;
}
</style>

<style>
</style>