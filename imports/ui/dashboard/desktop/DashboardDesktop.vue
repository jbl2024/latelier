<template>
  <div class="dashboard-desktop">
    <new-organization ref="newOrganization"></new-organization>
    <new-project ref="newProject" :organizationId="selectedOrganizationId"></new-project>
    <projects-trashcan ref="projectsTrashcan"></projects-trashcan>

    <div class="left" v-if="!$subReady.allProjects || !$subReady.organizations || !$subReady.user">
      <v-progress-linear indeterminate></v-progress-linear>
    </div>

    <div class="left" v-if="$subReady.allProjects && $subReady.organizations && $subReady.user">
      <div class="projects-title">
        <v-layout align-center>
          <v-flex grow>
            <v-btn class="back-button" small icon :to="{name: 'dashboard-page'}" v-if="organizationId">
              <v-icon>arrow_back</v-icon>
            </v-btn>

            <template v-if="!organizationId">{{ $t('Organizations & Projects')}}</template>
            <template v-if="organizationId">{{ organization.name }}</template>
          </v-flex>
          <v-flex shrink>
            <v-menu bottom left class="menu">
              <template v-slot:activator="{ on }">
                <v-btn small v-on="on" icon>
                  <v-icon>more_vert</v-icon>
                </v-btn>
              </template>
              <v-list>
                <template v-if="!organizationId">
                  <v-list-item @click="newProject()">
                    <v-list-item-action>
                      <v-icon>list</v-icon>
                    </v-list-item-action>
                    <v-list-item-title>{{ $t('New project') }}</v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="newOrganization()">
                    <v-list-item-action>
                      <v-icon>domain</v-icon>
                    </v-list-item-action>
                    <v-list-item-title>{{ $t('New organization') }}</v-list-item-title>
                  </v-list-item>
                  <v-divider></v-divider>
                </template>
                <v-list-item @click="$refs.projectsTrashcan.open()">
                  <v-list-item-action>
                    <v-icon>delete</v-icon>
                  </v-list-item-action>
                  <v-list-item-title>{{ $t('Trashcan') }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </v-flex>
        </v-layout>
      </div>
      <v-divider></v-divider>

      <template v-if="projects.length == 0 && organizations.length == 0">
        <empty-state
          class="main-empty-state"
          :description="$t('You don\'t have any project yet. You can start by creating a project or an organization that may contain members and different projects.')"
          illustration="project"
        >
          <v-btn text @click="newProject()">{{ $t('Create new project') }}</v-btn>
          <v-btn class="primary" @click="newOrganization()">{{ $t('Create new organization')}}</v-btn>
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
              <v-btn text solo class="action-button" @click="newProject()">
                <v-icon left>add</v-icon>
                {{ $t('New project')}}
              </v-btn>
            </div>
          </div>
          <v-list two-line class="list">
            <template v-for="project in individuals">
              <dashboard-project-list :key="project._id" :project="project" :user="user"></dashboard-project-list>
            </template>
          </v-list>
        </template>

        <template v-for="organization in organizations">
          <div class="header" :key="`header-${organization._id}`">
            <div class="header-title" @click="openOrganization(organization._id)">
              <router-link
                v-if="!organizationId"
                class="link"
                :to="{name: 'dashboard-organization-page', params: {organizationId: organization._id}}"
              >{{ organization.name }}</router-link>
              <template v-if="organizationId">{{ organization.name }}</template>
              <v-tooltip top>
                <template v-slot:activator="{ on }">
                  <v-btn
                  icon
                  small
                  text
                  color="grey darken-1"
                  @click.stop="openOrganizationTimeline(organization._id)"
                  v-on="on"
                  >
                    <v-icon>timeline</v-icon>
                  </v-btn>
                </template>
                <span>{{ $t('Timeline') }}</span>
              </v-tooltip>
              <v-tooltip top v-if="canManageOrganization(organization)">
                <template v-slot:activator="{ on }">
                  <v-btn
                  icon
                  small
                  text
                  color="grey darken-1"
                  @click.stop="openOrganizationSettings(organization._id)"
                  v-on="on"
                  >
                    <v-icon>settings</v-icon>
                  </v-btn>
                </template>
                <span>{{ $t('Settings') }}</span>
              </v-tooltip>
              <v-tooltip top>
                <template v-slot:activator="{ on }">                
                  <v-btn
                    icon
                    small
                    text
                    color="grey darken-1"
                    @click.stop="deleteOrganization(organization)"
                    v-if="canDeleteOrganization(organization)"
                    v-on="on"
                  >
                    <v-icon>delete</v-icon>
                  </v-btn>
                </template>
                <span>{{ $t('Delete') }}</span>
              </v-tooltip>
            </div>
            <div class="header-action">
              <v-btn text solo class="action-button" @click="newProject(organization._id)">
                <v-icon left>add</v-icon>
                {{ $t('New project')}}
              </v-btn>
            </div>
          </div>
          <v-list
            :key="`projects-${organization._id}`"
            two-line
            class="list"
            v-if="projectsByOrganization(organization, dashboardFilter).length > 0"
          >
            <template v-for="project in projectsByOrganization(organization, dashboardFilter)">
              <dashboard-project-list :key="project._id" :project="project" :user="user"></dashboard-project-list>
            </template>
          </v-list>

          <empty-state
            small
            :key="`${organization._id}-empty`"
            v-if="dashboardFilter === '' && projectsByOrganization(organization).length == 0"
            :description="`Aucun projet disponible`"
            illustration="project"
          >
            <v-btn class="primary" @click="newProject(organization._id)">{{ $t('Create new project') }}</v-btn>
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
            <v-tabs-slider color="accent"></v-tabs-slider>
            <v-tab>{{ $t('Recents') }}</v-tab>
            <v-tab>{{ $t('Assigned to me') }}</v-tab>
            <v-tab>{{ $t('Late') }}</v-tab>

            <v-tab-item>
              <dashboard-task-list :user="user" type="recent" :organization-id="organizationId"></dashboard-task-list>
            </v-tab-item>
            <v-tab-item>
              <dashboard-task-list :user="user" type="assignedToMe" :organization-id="organizationId"></dashboard-task-list>
            </v-tab-item>
            <v-tab-item>
              <dashboard-task-list :user="user" type="late" empty-illustration="celebration" :organization-id="organizationId"></dashboard-task-list>
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
  props: {
    organizationId: String
  },
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
  computed: {
    ...mapState([
      "dashboardFilter",
    ])
  },
  data() {
    return {
      user: null,
      tab: null,
      selectedOrganizationId: "",
      cardClass: "card1"
    };
  },
  meteor: {
    $subscribe: {
      allProjects: function() {
        return ["", this.organizationId];
      },
      organizations: function() {
        return ["", this.organizationId];
      },
      user: function() {
        return [];
      }
    },
    projects: {
      params() {
        return {
          name: this.dashboardFilter
        };
      },
      deep: false,
      update({ name }) {  
        const query = {};    
        if (name && name.length > 0) {
          query['name'] = { $regex: ".*" + name + ".*", $options: "i" };
        }
        return Projects.find(
          query,
          {
            sort: { organizationId: 1, state: 1, name: 1 }
          }
        );
      }
    },
    organizations() {
      return Organizations.find({}, { sort: { name: 1 } });
    },
    organization() {
      return Organizations.findOne();
    },
    favorites: {
      params() {
        return {
          name: this.dashboardFilter
        };
      },
      deep: false,
      update({ name }) {  
        const user = Meteor.user() || { profile: {} };
        let favorites = [];
        if (user && user.profile) {
          favorites = user.profile.favoriteProjects || [];
        }
        let query = { _id: { $in: favorites } }         
        if (name && name.length > 0) {
          query['name'] = { $regex: ".*" + name + ".*", $options: "i" };
        }
        return Projects.find(
          query,
          {
            sort: { organizationId: 1, state: 1, name: 1 }
          }
        );
      }
    },
    individuals: {
      params() {
        return {
          name: this.dashboardFilter
        };
      },
      deep: false,
      update({ name }) {  
        const organizationIds = [];
        Organizations.find({})
          .fetch()
          .map(organization => {
            organizationIds.push(organization._id);
          });
        let query = { organizationId: { $nin: organizationIds } }         
        if (name && name.length > 0) {
          query['name'] = { $regex: ".*" + name + ".*", $options: "i" };
        }
        return Projects.find(query, { sort: { state: 1, name: 1 }});
      }
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
      this.selectedOrganizationId = organizationId;
      this.$refs.newProject.open();
    },
    projectsByOrganization(organization, name) {
      let query = { organizationId: organization._id };         
      if (name && name.length > 0) {
        query['name'] = { $regex: ".*" + name + ".*", $options: "i" };
      }
      return Projects.find(query, {sort: { name: 1 }}).fetch();
    },
    openOrganization(id) {
      this.$router.push({
        name: "dashboard-organization-page",
        params: { organizationId: id }
      });
    },
    openOrganizationTimeline(id) {
      this.$router.push({
        name: "projects-timeline",
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
        Permissions.isAdmin(Meteor.userId(), organization._id) ||
        Permissions.isAdmin(Meteor.userId())
      ) {
        return true;
      }
      return false;
    },
    canDeleteOrganization(organization) {
      if (
        Permissions.isAdmin(Meteor.userId(), organization._id) ||
        Permissions.isAdmin(Meteor.userId())
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
.link {
  text-decoration: none;
  color: black;
}

.link:hover {
  text-decoration: underline;
}

.back-button {
  margin-right: 12px;
}

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