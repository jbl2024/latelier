<template>
  <div class="project-title">
    <v-toolbar-title>
      <v-btn text icon color="white" @click="$router.push({ name: 'dashboard-page' })">
        <v-icon>mdi-home</v-icon>
      </v-btn>
      <project-selector :key="projectId">
        <template v-slot:activator="{ on }">
          <v-btn color="white" text dark v-on="on">
            <span>{{ truncatedTitle }}</span>
            <v-icon class="ml-1">
              mdi-chevron-down
            </v-icon>
          </v-btn>
        </template>
      </project-selector>
    </v-toolbar-title>
  </div>
</template>

<script>
import { Projects } from "/imports/api/projects/projects.js";
import debounce from "lodash/debounce";
import { truncate } from '/imports/ui/utils/truncate';
import ProjectSelector from "/imports/ui/projects/ProjectSelector";

export default {
  components: {
    ProjectSelector
  },
  props: {
    projectId: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      savedProjectName: "",
      editProjectName: false,
      savedValue: "",
      debouncedFilter: "",
      showMenu: true
    };
  },
  computed: {
    truncatedTitle() {
      if (this.project?.name) {
        return truncate(this.project.name, 30);
      }
    }
  },
  created() {
    this.debouncedFilter = debounce((val) => {
      this.showMenu = true;
      this.$events.fire("filter-tasks", val);
    }, 400);
  },
  mounted() {
    this.$events.listen("reset-filter-tasks", () => {
      this.savedValue = "";
      this.$events.fire("filter-tasks", this.savedValue);
    });
  },
  beforeDestroy() {
    this.$events.off("reset-filter-tasks");
  },
  meteor: {
    project: {
      params() {
        return {
          id: this.projectId
        };
      },
      deep: false,
      update({ id }) {
        return Projects.findOne({ _id: id }) || {};
      }
    }
  }
};
</script>

<style scoped>
.project-title {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
}
</style>
