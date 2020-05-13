<template>
  <div class="project-dashboard">
    <div v-if="!currentProject">
      <v-progress-linear indeterminate />
    </div>
    <v-container
      v-if="currentProject && info"
      ref="cards"
      v-resize="onResize"
      :style="getBackgroundUrl(currentUser)"
      fluid
    >
      <v-row>
        <v-col cols="12">
          <project-card :project="currentProject" :user="currentUser" :info="info" />
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
</template>

<script>
import { Projects } from "/imports/api/projects/projects.js";
import ProjectCard from "/imports/ui/projects/info/ProjectCard";
import ProcessCard from "/imports/ui/projects/info/ProcessCard";
import CanvasCard from "/imports/ui/projects/info/CanvasCard";
import WeatherCard from "/imports/ui/projects/info/WeatherCard";
import BackgroundMixin from "/imports/ui/mixins/BackgroundMixin.js";
import { mapState } from "vuex";

export default {
  components: {
    ProjectCard,
    ProcessCard,
    CanvasCard,
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
      this.cardColumns = width > 600 ? 4 : 12;
    }
  }
};
</script>
