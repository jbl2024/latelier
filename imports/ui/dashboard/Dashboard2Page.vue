<template>
  <div class="dashboard2-page">
    <new-organization ref="newOrganization"></new-organization>
    <new-project ref="newProject" :organizationId="organizationId"></new-project>
    <div class="left" v-if="!$subReady.allProjects || !$subReady.organizations || !$subReady.user">
      <v-progress-linear indeterminate></v-progress-linear>
    </div>

    <div class="left" v-if="$subReady.allProjects && $subReady.organizations && $subReady.user">

      <template v-if="favorites.length > 0">
        <div class="header" >
          <div class="header-title">
            {{ $t('Favorites') }}
          </div>
        </div>
        <v-container fluid grid-list-xl class="projects">
          <v-layout row wrap>
            <v-flex v-for="project in favorites" :key="project._id" xs4>
              <dashboard-project-card :project="project" :user="user"></dashboard-project-card>
            </v-flex>
          </v-layout>
        </v-container>
      </template>

      <template v-if="individuals.length > 0">
        <div class="header">
          <div class="header-title">
            {{ $t('My projects') }}
          </div>
          <div class="header-action">
            <v-btn flat solo class="action-button" @click="newProject()">
              <v-icon left>add</v-icon>{{ $t('New project')}}
            </v-btn>
          </div>
        </div>
        <v-container fluid grid-list-xl class="projects">
          <v-layout row wrap>
            <v-flex v-for="project in individuals" :key="project._id" xs4>
              <dashboard-project-card :project="project" :user="user"></dashboard-project-card>
            </v-flex>
          </v-layout>
        </v-container>
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
              <v-icon left>add</v-icon>{{ $t('New project')}}
            </v-btn>
          </div>

        </div>
        <v-container fluid grid-list-xl class="projects" :key="`projects-${organization._id}`">
          <v-layout row wrap>
            <v-flex v-for="project in projectsByOrganization(organization)" :key="project._id" xs4>
              <dashboard-project-card :project="project" :user="user"></dashboard-project-card>
            </v-flex>
            <empty-state
              small
              :key="`${organization._id}-empty`"
              v-if="projectsByOrganization(organization).length == 0"
              :description="`Aucun projet disponible`"
              illustration="project"
            >
              <v-btn class="primary" @click="newProject(organization._id)">Créer un nouveau projet</v-btn>
            </empty-state>

          </v-layout>
        </v-container>
      </template>


    </div>
    <div class="right">
      <v-card class="tasks">
        <v-card-title>Tasks</v-card-title>
      </v-card>
    </div>
  </div>
</template>

<script>
import DashboardTaskList from "/imports/ui/dashboard/DashboardTaskList";
import DashboardProjects from "/imports/ui/dashboard/DashboardProjects";
import DashboardProjectCard from "/imports/ui/dashboard/DashboardProjectCard";
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
    DashboardProjects,
    DashboardProjectCard,
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
  i18n: {
    messages: {
      en: {
        "Updated recently": "Updated recently",
        Late: "Late",
        "Assigned to me": "Assigned to me"
      },
      fr: {
        "Updated recently": "Modifiées récemment",
        Late: "En retard",
        "Assigned to me": "Assignées à moi"
      }
    }
  },
  data() {
    return {
      user: null,
      tab: null,
      items: ["web", "shopping", "videos", "images", "news"],
      text: "foo",
      bottomNav: "organizations",
      filter: "",
      organizationId: ""
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
      'user': function() {
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
    user () {
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
    canManageOrganization(organization) {
      if (Permissions.isAdmin(Meteor.userId()) || organization.createdBy === Meteor.userId()) {
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
  }
};
</script>

<style scoped>
.dashboard2-page {
  display: flex;
  flex-direction: row;
  padding: 24px;
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
}

.header-title {
  flex: 1;
  font-size: 24px;
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
}

.right {
  display: flex;
  width: 320px;
}

.action-button {
  text-transform: none;
}

.tasks {
  width: 100%;
}

.projects {
  padding-left: 0;
  padding-right: 12px;
}


</style>

<style>
</style>