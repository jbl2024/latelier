<template>
  <div v-if="user" class="dashboard-mobile">
    <new-organization ref="newOrganization" />
    <div class="mobile">
      <v-card class="flex-container">
        <dashboard-projects />
      </v-card>
    </div>
  </div>
</template>

<script>
import DashboardProjects from "/imports/ui/dashboard/mobile/DashboardProjects";
import { mapState } from "vuex";

export default {
  components: {
    DashboardProjects
  },
  data() {
    return {
      user: null,
      tab: null
    };
  },
  computed: {
    ...mapState([
      "currentUser"
    ]),
    ...mapState("organization", ["currentOrganizationId"]),
    ...mapState("project", ["currentProjectId"])
  },
  mounted() {
    this.$store.dispatch("setWindowTitle", this.$t("Dashboard"));
    Meteor.call("users.getEmailPreferences", (error, result) => {
      if (error) {
        this.$notifyError(error);
        return;
      }
      this.user = result;
    });
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

<style lang="scss" scoped>

@import "/imports/ui/styles/mixins/breakpoint";

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

<style></style>
