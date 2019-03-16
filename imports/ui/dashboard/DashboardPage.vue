<template>
  <div class="dashboard-page">
    <template v-if="user">
      <v-container grid-list-md fluid>
        <v-layout row wrap fill-height>
          <v-flex xs12 md6>
            
            <v-card class="flex-container">
              <v-toolbar dense color="indigo" dark>
                <v-toolbar-title>{{ $t('Projects') }}</v-toolbar-title>
              </v-toolbar>
              <dashboard-projects></dashboard-projects>
            </v-card>
          </v-flex>
          <v-flex xs12 md6>
            <v-card class="flex-container">
              <v-toolbar dense color="indigo" dark>
                <v-toolbar-title>{{ $t('Tasks') }}</v-toolbar-title>
              </v-toolbar>

              <div class="tabs-wrapper">
              <v-tabs v-model="tab" icons-and-text centered>
                <v-tab>
                  {{ $t('Updated recently') }}
                  <v-icon>today</v-icon>
                </v-tab>
                <v-tab>
                  {{ $t('Assigned to me') }}
                  <v-icon>account_circle</v-icon>
                </v-tab>

                <v-tab>
                  {{ $t('Late') }}
                  <v-icon>alarm_on</v-icon>
                </v-tab>

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
          </v-flex>
        </v-layout>
      </v-container>
    </template>
  </div>
</template>

<script>
import { Permissions } from "/imports/api/users/permissions";
import DashboardTaskList from "/imports/ui/dashboard/DashboardTaskList";
import DashboardProjects from "/imports/ui/dashboard/DashboardProjects";

export default {
  props: {},
  components: {
    DashboardTaskList,
    DashboardProjects,
  },
  mounted() {
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
        "Late": "Late",
        "Assigned to me": "Assigned to me",
      },
      fr: {
        "Updated recently": "Modifiées récemment",
        "Late": "En retard",
        "Assigned to me": "Assignées à moi",
      }
    }
  },
  data() {
    return {
      user: null,
      tab: null,
      items: ["web", "shopping", "videos", "images", "news"],
      text: 'foo'
    };
  },
  methods: {
    toggleTaskAssignedTo() {
      this.user.emailSettings.tasks.assignTo = !this.user.emailSettings.tasks
        .assignTo;
      Meteor.call("users.updateEmailPreferences", this.user.emailSettings);
    }
  }
};
</script>

<style scoped>
.dashboard-page {
  display: flex;
  min-height:0;
  height: 100%;
  flex-direction: column;
  position: relative;
  flex: 1;
}

.flex-container {
  display:flex;
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

</style>

<style>
</style>