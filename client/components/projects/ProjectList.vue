<template>
  <div v-if="projects" class="project-list">
    <empty-state
      v-if="!projects.length && emptyIllustration"
      :illustration="emptyIllustration"
      small
      :label="$t('No project')"
    />
    <v-list v-else-if="projects.length > 0">
      <v-list-item v-for="project in projects" :key="project._id" @click="selectProject(project)">
        <v-list-item-icon>
          <v-badge
            :value="favoriteProjects.includes(project._id)"
            bordered
            overlap
            icon="mdi-star"
            color="yellow darken-3"
          >
            <v-icon :class="getVisibilityIconClass(project)" :color="getColor(project)">
              {{ getVisibilityIcon(project) }}
            </v-icon>
          </v-badge>
        </v-list-item-icon>
        <v-list-item-content class="pointer">
          <v-list-item-title>{{ project.name }}</v-list-item-title>
          <v-list-item-subtitle>
            {{ formatProjectDates(project) }}
            <v-chip v-if="isArchived(project)" x-small>
              {{ $t('Archived') }}
            </v-chip>
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </div>
</template>

<script>
import { ProjectAccessRights, ProjectStates } from "/imports/api/projects/projects";
import DatesMixin from "/imports/ui/mixins/DatesMixin.js";
import { mapState } from "vuex";

export default {
  name: "ProjectList",
  mixins: [DatesMixin],
  props: {
    projects: {
      type: Array,
      default: null
    },
    emptyIllustration: {
      type: String,
      default: null
    }
  },
  computed: {
    ...mapState(["currentUser"]),
    favoriteProjects() {
      let favorites = [];
      if (this.currentUser && this.currentUser.profile) {
        favorites = this.currentUser.profile.favoriteProjects || [];
      }
      return favorites;
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
    getVisibilityIconClass(project) {
      if (project.accessRights === ProjectAccessRights.ORGANIZATION) {
        return "";
      }
      return "";
    },
    selectProject(project) {
      this.$emit("select", project);
    },
    isArchived(project) {
      return project.state === ProjectStates.ARCHIVED;
    }
  }
};
</script>
<style scoped>
  .empty-state {
    padding: 2rem;
  }
</style>
