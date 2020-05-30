<template>
  <div>
    <div v-if="!currentProject">
      <v-progress-linear indeterminate />
    </div>
    <v-container
      v-if="currentProject"
      ref="cards"
      class="container-wrapper"
      :style="getBackgroundUrl(currentUser)"
      fluid
    >
      <v-row>
        <v-col cols="12">
          Hello, world
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import { Projects } from "/imports/api/projects/projects.js";
import BackgroundMixin from "/imports/ui/mixins/BackgroundMixin.js";
import { mapState } from "vuex";

export default {
  mixins: [BackgroundMixin],
  props: {
    projectId: {
      type: String,
      default: null
    }
  },
  data() {
    return {
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
