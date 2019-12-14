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

      <div class="right">
        coucou
      </div>
    </div>
  </div>
</template>

<script>
import { Projects } from "/imports/api/projects/projects.js";
import ProjectCard from "/imports/ui/projects/info/ProjectCard";
import ProcessCard from "/imports/ui/projects/info/ProcessCard";
import CanvasCard from "/imports/ui/projects/info/CanvasCard";

export default {
  components: {
    ProjectCard,
    ProcessCard,
    CanvasCard
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
  position: relative;
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
  flex-direction: column;
  overflow-y: auto;
  margin-right: 24px;
  margin-top: 12px;
  display: flex;
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

</style>
