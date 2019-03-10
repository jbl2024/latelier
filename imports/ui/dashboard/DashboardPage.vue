<template>
  <div class="dashboard-page">
    <template v-if="user">
      <v-container grid-list-md>
        <v-layout row wrap>
          <v-flex xs-6>
            <v-card>
              <v-toolbar dense color="indigo" dark>
                <v-toolbar-title>{{ $t('Tasks') }}</v-toolbar-title>
              </v-toolbar>

              <v-tabs v-model="tab" icons-and-text dark color="indigo" centered>
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


export default {
  props: {},
  components: {
    DashboardTaskList
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

.dashboard-task-list {
  height: 420px;
  overflow-y: scroll;
}
</style>