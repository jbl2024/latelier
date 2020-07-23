<template>
  <div class="project-info">
    <div v-if="!currentProject">
      <v-progress-linear indeterminate />
    </div>
    <div
      v-if="currentProject && info"
      ref="cards"
      v-resize="onResize"
      class="container-wrapper"
      :style="getBackgroundUrl(currentUser)"
    >
      <v-container fluid>
        <v-row>
          <v-col cols="12">
            <project-card :project="currentProject" :user="currentUser" :info="info" />
          </v-col>
          <v-col :cols="cardColumns">
            <meeting-card :project="currentProject" :info="info" />
          </v-col>
          <v-col :cols="cardColumns">
            <canvas-card :project="currentProject" :info="info" />
          </v-col>
          <v-col :cols="cardColumns">
            <process-card :project="currentProject" :info="info" />
          </v-col>
          <v-col :cols="cardColumns">
            <weather-card :project="currentProject" :info="info" />
          </v-col>
        </v-row>
      </v-container>
    </div>
  </div>
</template>

<script>
import { Projects } from "/imports/api/projects/projects.js";
import ProjectCard from "/imports/ui/projects/info/ProjectCard";
import ProcessCard from "/imports/ui/projects/info/ProcessCard";
import CanvasCard from "/imports/ui/projects/info/CanvasCard";
import WeatherCard from "/imports/ui/projects/info/WeatherCard";
import MeetingCard from "/imports/ui/projects/info/MeetingCard";
import BackgroundMixin from "/imports/ui/mixins/BackgroundMixin.js";
import { mapState } from "vuex";

export default {
  components: {
    ProjectCard,
    ProcessCard,
    CanvasCard,
    MeetingCard,
    WeatherCard
  },
  mixins: [BackgroundMixin],
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
  computed: {
    ...mapState(["currentUser"]),
    ...mapState("project", ["currentProject"])
  },
  mounted() {
    this.$store.dispatch("project/setCurrentProjectId", this.projectId);
  },
  beforeDestroy() {
    this.$store.dispatch("project/setCurrentProjectId", null);
  },
  meteor: {
    // Subscriptions
    $subscribe: {
      project() {
        return [this.projectId];
      }
    },
    project() {
      this.refresh();
      const project = Projects.findOne();
      if (project) {
        this.$store.dispatch("project/setCurrentProject", project);
      }
      return project;
    }
  },
  methods: {
    refresh() {
      Meteor.call("projects.info",
        { projectId: this.projectId },
        (error, result) => {
          if (error) {
            this.$notifyError(error);
            return;
          }
          this.info = result;
        });
    },
    onResize() {
      const { cards } = this.$refs;
      const width = cards.offsetWidth;
      this.cardColumns = width > 600 ? 3 : 12;
    }
  }
};
</script>

<style lang="scss" scoped>
@import "/imports/ui/styles/mixins/breakpoint";

.container-wrapper {
  overflow-y: auto;
  height: calc(100vh - 64px);
  @include media-query("sm-and-down") {
    height: calc(100vh - 112px);
  }
  width: 100%;
  -webkit-background-size: cover;
  -moz-background-size: cover;
  -o-background-size: cover;
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  background-attachment: fixed;
  display: flex;
  flex-direction: row;
}
</style>
