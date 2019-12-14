<template>
  <div class="project-dashboard">
    <div v-if="!$subReady.project">
      <v-progress-linear indeterminate />
    </div>
    <div
      v-if="$subReady.project"
      class="container-wrapper"
      :style="getBackgroundUrl(user)"
    >
      <v-container fluid class="left">
        <v-row dense>
          <v-col :cols="12">
            <project-card :project="project" :user="user" />
          </v-col>
          <v-col :cols="3">
            <canvas-card :project="project" />
          </v-col>
          <v-col :cols="3">
            <process-card :project="project" />
          </v-col>
          <v-col :cols="3">
            <process-card :project="project" />
          </v-col>
        </v-row>
      </v-container>

      <template v-if="!$vuetify.breakpoint.xsOnly">
        <div class="right">
          <div v-if="$subReady.user" class="tasks">
            <div class="tasks-title">
              {{ $t("Tasks") }}
            </div>
            <v-divider />

            <div class="tabs-wrapper">
              <v-tabs>
                <v-tabs-slider color="accent" />
                <v-tab>{{ $t("Recents") }}</v-tab>
                <v-tab>{{ $t("Assigned to me") }}</v-tab>
                <v-tab>{{ $t("Late") }}</v-tab>

                <v-tab-item>
                  <dashboard-task-list
                    :user="user"
                    type="recent"
                    :project-id="project._id"
                  />
                </v-tab-item>
                <v-tab-item>
                  <dashboard-task-list
                    :user="user"
                    type="assignedToMe"
                    :project-id="project._id"
                  />
                </v-tab-item>
                <v-tab-item>
                  <dashboard-task-list
                    :user="user"
                    type="late"
                    empty-illustration="celebration"
                    :project-id="project._id"
                  />
                </v-tab-item>
              </v-tabs>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import { Projects } from "/imports/api/projects/projects.js";
import ProjectCard from "/imports/ui/projects/info/ProjectCard";
import ProcessCard from "/imports/ui/projects/info/ProcessCard";
import CanvasCard from "/imports/ui/projects/info/CanvasCard";
import DashboardTaskList from "/imports/ui/dashboard/common/DashboardTaskList";

export default {
  components: {
    ProjectCard,
    ProcessCard,
    CanvasCard,
    DashboardTaskList
  },
  props: {
    projectId: {
      type: String,
      default: null
    }
  },
  data() {
    return {};
  },
  mounted() {
    this.$store.dispatch("setCurrentProjectId", this.projectId);
  },
  beforeDestroy() {
    this.$store.dispatch("setCurrentProjectId", null);
  },
  meteor: {
    // Subscriptions
    $subscribe: {
      project: function() {
        return [this.projectId];
      },
      user: function() {
        return [];
      }
    },
    project() {
      return Projects.findOne();
    },
    user() {
      return Meteor.user();
    }
  },
  methods: {
    getBackgroundUrl(user) {
      if (user && user.profile) {
        const { background } = user.profile;
        if (background) {
          return `background-image: url('${background}');`;
        }
      }
      return "";
    }
  }
};
</script>

<style scoped>
.container-wrapper {
  overflow-y: scroll;
  height: 100%;
  width: 100%;
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  -webkit-background-size: cover;
  -moz-background-size: cover;
  -o-background-size: cover;
  background-size: cover;
  /* box-shadow: inset 0 0 0 1000px rgba(0,0,0,.3); */
  background-repeat: no-repeat;
  background-position: center;
  background-attachment: fixed;
  display: flex;
  flex-direction: row;
}

/* .dashboard-desktop {
  display: flex;
  flex-direction: row;
  padding-left: 24px;
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  height: 100%;
} */

@media (max-width: 600px) {
  .container-wrapper {
    min-height: 100vh;
  }
}

.left {
  flex: 1;
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

.tasks-title {
  margin: 22px;
  text-transform: uppercase;
  font-weight: bold;
  letter-spacing: 0.08em;
  flex: 0;
}

</style>
