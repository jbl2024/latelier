<template>
  <div class="project-list">
    <v-list v-if="projects" two-line>
      <empty-state
        v-if="projects.length == 0"
        :illustration="emptyIllustration"
        small
        :label="$t('No project')"
      />

      <template v-for="project in projects">
        <v-list-item :key="project._id" @click="selectProject(project)">
          <v-list-item-avatar :color="getColor(project)">
            <v-icon :class="getVisibilityIconClass(project)">
              {{ getVisibilityIcon(project) }}
            </v-icon>
          </v-list-item-avatar>
          <v-list-item-content class="pointer">
            <v-list-item-title>{{ project.name }}</v-list-item-title>
            <v-list-item-subtitle>
              {{ formatProjectDates(project) }}
            </v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </template>
    </v-list>
  </div>
</template>

<script>
import { ProjectAccessRights } from "/imports/api/projects/projects";
import DatesMixin from "/imports/ui/mixins/DatesMixin.js";

export default {
  name: "ProjectList",
  mixins: [DatesMixin],
  props: {
    projects: {
      type: Array,
      default: () => []
    },
    emptyIllustration: {
      type: String,
      default: "empty"
    }
  },
  methods: {
    getVisibilityIcon(project) {
      if (project.accessRights === ProjectAccessRights.ORGANIZATION) {
        return "mdi-eye";
      }
      return "mdi-eye-off";
    },
    getColor(project) {
      return project.color;
    },

    formatProjectDates(project) {
      if (project.startDate && project.endDate) {
        return `Du ${this.formatDate(project.startDate)} au ${this.formatDate(project.endDate)}`;
      }
      if (project.startDate) {
        return `A partir du ${this.formatDate(project.startDate)}`;
      }
      if (project.endtDate) {
        return `Jusqu'au ${this.formatDate(project.endDate)}`;
      }
      return "";
    },

    getVisibilityIconClass(project) {
      if (project.accessRights === ProjectAccessRights.ORGANIZATION) {
        return "";
      }
      return "";
    },

    selectProject(project) {
      this.$emit("select", project);
    }
  }
};
</script>

<style scoped>
.empty-state {
  margin-top: 24px;
}
</style>
