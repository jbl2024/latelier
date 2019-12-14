<template>
  <div class="project-dashboard">
    <div v-if="!$subReady.project">
      <v-progress-linear indeterminate />
    </div>
    <div
      v-if="$subReady.project && info"
      class="container-wrapper"
      :style="getBackgroundUrl(user)"
    >
      <v-container ref="cards" v-resize="onResize" fluid class="left">
        <v-row>
          <v-col cols="12">
            <project-card :project="project" :user="user" :info="info" />
          </v-col>
          <v-col :cols="cardColumns">
            <canvas-card :project="project" :info="info" />
          </v-col>
          <v-col :cols="cardColumns">
            <process-card :project="project" :info="info" />
          </v-col>
          <v-col :cols="cardColumns">
            <weather-card :project="project" :info="info" />
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
              <v-tabs grow>
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
import WeatherCard from "/imports/ui/projects/info/WeatherCard";
import DashboardTaskList from "/imports/ui/dashboard/common/DashboardTaskList";

export default {
  components: {
    ProjectCard,
    ProcessCard,
    CanvasCard,
    WeatherCard,
    DashboardTaskList
  },
  props: {
    projectId: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      info: null,
      cardColumns: 4
    };
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
      this.refresh();
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
    },

    refresh() {
      Meteor.call(
        "projects.info",
        { projectId: this.projectId },
        (error, result) => {
          if (error) {
            this.$store.dispatch("notifyError", error);
            return;
          }
          this.info = result;
        }
      );
    },

    onResize() {
      const { cards } = this.$refs;
      const width = cards.offsetWidth;
      if (width > 600) {
        this.cardColumns = 4;
      } else {
        this.cardColumns = 12;
      }
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
  width: 360px;
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
