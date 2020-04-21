<template>
  <div class="project-dashboard">
    <div v-if="!$subReady.project">
      <v-progress-linear indeterminate />
    </div>
    <container-wrapper v-if="$subReady.project && info" :style="getBackgroundUrl(user)">
      <template slot="left">
        <div v-if="$subReady.user" class="tasks">
          <div class="tasks-title">
            {{ $t("Tasks") }}
          </div>
          <v-divider />

          <div class="tabs-wrapper">
            <v-tabs grow class="sticky-tabs">
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
      </template>
      <template slot="right">
        <v-container ref="cards" v-resize="onResize" fluid>
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
      </template>
    </container-wrapper>
  </div>
</template>

<script>
import { Projects } from "/imports/api/projects/projects.js";
import ProjectCard from "/imports/ui/projects/info/ProjectCard";
import ProcessCard from "/imports/ui/projects/info/ProcessCard";
import CanvasCard from "/imports/ui/projects/info/CanvasCard";
import WeatherCard from "/imports/ui/projects/info/WeatherCard";
import DashboardTaskList from "/imports/ui/dashboard/common/DashboardTaskList";
import ContainerWrapper from '/imports/ui/ui/ContainerWrapper';

export default {
  components: {
    ProjectCard,
    ProcessCard,
    CanvasCard,
    WeatherCard,
    DashboardTaskList,
    ContainerWrapper
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
            this.$notifyError(error);
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
.tasks-title {
  margin: 15.5px;
  text-transform: uppercase;
  font-weight: bold;
  letter-spacing: 0.08em;
  flex: 0;
}
</style>
