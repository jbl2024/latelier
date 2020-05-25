<template>
  <div class="project-settings">
    <v-progress-linear v-if="!currentProject" indeterminate />
    <template v-else>
      <v-tabs ref="tabs" v-resize="centerTabs" centered class="sticky-tabs">
        <v-tabs-slider color="accent" />
        <v-tab id="tab-general">
          {{ $t("Settings") }}
        </v-tab>
        <v-tab id="tab-users">
          {{ $t("Users") }}
        </v-tab>
        <v-tab-item
          class="project-settings-tab-item"
          :transition="false"
          :reverse-transition="false"
        >
          <project-settings-general
            :project="currentProject"
          />
        </v-tab-item>
        <v-tab-item
          class="project-settings-tab-item"
          :transition="false"
          :reverse-transition="false"
        >
          <project-settings-manage-users
            :project="currentProject"
            class="users"
          />
        </v-tab-item>
      </v-tabs>
    </template>
  </div>
</template>

<script>
import { Projects } from "/imports/api/projects/projects.js";
import { mapState } from "vuex";

export default {
  props: {
    projectId: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      title: this.$t("Settings")
    };
  },
  computed: {
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
      const project = Projects.findOne();
      if (project) {
        this.$store.dispatch("project/setCurrentProject", project);
      }
      return project;
    }
  },
  methods: {
    centerTabs() {
      setTimeout(() => {
        this.$refs.tabs.onResize();
      }, 500);
    }
  }
};
</script>

<style scoped>

.search {
  max-width: 300px;
}

.project-settings {
  height: 400px; /* fix sticky on webkit */
}

.users {
  overflow-y: scroll;
}
</style>
