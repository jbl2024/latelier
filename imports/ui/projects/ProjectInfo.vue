<template>
  <div class="project-dashboard">
    <div v-if="!currentProject">
      <v-progress-linear indeterminate />
    </div>
    <v-container v-if="currentProject && info" :style="getBackgroundUrl(currentUser)" ref="cards" v-resize="onResize" fluid>
      <v-row>
        <v-col cols="12">
          <project-card :project="currentProject" :user="currentUser" :info="info" />
        </v-col>
        <v-col :cols="cardColumns">
          <canvas-card :project="currentProject" :info="info"/>
        </v-col>
        <v-col :cols="cardColumns">
          <process-card :project="currentProject" :info="info"/>
        </v-col>
        <v-col :cols="cardColumns">
          <weather-card :project="currentProject" :info="info"/>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import ProjectCard from "/imports/ui/projects/info/ProjectCard";
import ProcessCard from "/imports/ui/projects/info/ProcessCard";
import CanvasCard from "/imports/ui/projects/info/CanvasCard";
import WeatherCard from "/imports/ui/projects/info/WeatherCard";
import DashboardTaskList from "/imports/ui/dashboard/common/DashboardTaskList";
import { mapState } from "vuex";
import BackgroundMixin from "/imports/ui/mixins/BackgroundMixin.js";
export default {
  mixins: [BackgroundMixin],
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
  computed: {
    ...mapState(["currentUser"]),
    ...mapState("project", ["currentProject"])
  },
  watch: {
    projectId: {
      immediate: true,
      handler() {
        this.$store.dispatch("project/setCurrentProjectId", this.projectId);
        this.refresh();
      }
    },
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
