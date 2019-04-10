<template>
  <div class="dashboard-mobile">
    <new-organization ref="newOrganization"></new-organization>
    <template v-if="user">
      <div class="mobile" v-if="$vuetify.breakpoint.xsOnly">
        <v-bottom-nav :active.sync="bottomNav" :value="true" dark color="primary">
          <v-btn flat value="organizations">
            <span>{{ $t('Projects') }}</span>
            <v-icon>domain</v-icon>
          </v-btn>

          <v-btn flat value="tasks">
            <span>{{ $t('Tasks') }}</span>
            <v-icon>list</v-icon>
          </v-btn>
        </v-bottom-nav>
        <div class="mobile-organizations" v-if="bottomNav === 'organizations'">
          <v-card class="flex-container">
            <dashboard-projects></dashboard-projects>
          </v-card>
        </div>
        <div class="mobile-tasks" v-if="bottomNav === 'tasks'">
          <v-card class="flex-container">
            <div class="tabs-wrapper">
              <v-tabs v-model="tab" icons-and-text centered>
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
          </v-card>
        </div>
      </div>

    </template>
  </div>
</template>

<script>
import { Permissions } from "/imports/api/permissions/permissions";

import DashboardTaskList from "/imports/ui/dashboard/common/DashboardTaskList";
import DashboardProjects from "/imports/ui/dashboard/mobile/DashboardProjects";

export default {
  props: {},
  components: {
    DashboardTaskList,
    DashboardProjects
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
      bottomNav: "organizations"
    };
  },
  methods: {
    newOrganization() {
      this.$refs.newOrganization.open();
    },
    toggleTaskAssignedTo() {
      this.user.emailSettings.tasks.assignTo = !this.user.emailSettings.tasks
        .assignTo;
      Meteor.call("users.updateEmailPreferences", this.user.emailSettings);
    }
  }
};
</script>

<style scoped>
.dashboard-mobile {
  display: flex;
  min-height: 0;
  height: 100%;
  flex-direction: column;
  position: relative;
  flex: 1;
  position: relative;
}

.flex-container {
  display: flex;
  flex: 1;
  height: 100%;
  flex-direction: column;
  align-items: center;
}

.flex0 {
  flex: 0;
}

.flex1 {
  flex: 1;
}

.dashboard-projects {
  position: absolute;
  left: 0;
  top: 48px;
  right: 0;
  bottom: 0;
  overflow-y: scroll;
}


.tabs-wrapper {
  position: absolute;
  left: 0;
  top: 48px;
  right: 0;
  bottom: 0;
  overflow-y: scroll;
}

.mobile-organizations .dashboard-projects {
  top: 0;
}

.mobile-tasks .tabs-wrapper {
  top: 0;
}


@media (max-width: 601px) {
  .main-container {
    padding: 0;
  }
}

.mobile {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  right: 0;
}

.mobile-organizations {
  height: calc(100% - 56px);
}

.mobile-tasks {
  height: calc(100% - 56px);
}
</style>

<style>
</style>