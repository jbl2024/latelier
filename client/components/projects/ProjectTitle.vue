<template>
  <div class="project-title">
    <project-selector :key="projectId">
      <template v-slot:activator="{ on }">
        <v-btn text v-on="on">
          <span class="title title-selector">{{ truncatedTitle }}</span>
          <v-icon class="ml-1">
            mdi-chevron-down
          </v-icon>
        </v-btn>
      </template>
    </project-selector>
  </div>
</template>

<script>
import debounce from "lodash/debounce";
import { truncate } from "/imports/ui/utils/truncate";
import ProjectSelector from "/imports/ui/projects/ProjectSelector";

export default {
  components: {
    ProjectSelector
  },
  props: {
    project: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      savedValue: "",
      debouncedFilter: ""
    };
  },
  computed: {
    projectId() {
      if (!this.project) return null;
      return this.project._id;
    },
    truncatedTitle() {
      return this.project?.name ? truncate(this.project.name, 30) : "";
    }
  },
  created() {
    this.debouncedFilter = debounce((val) => {
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
  }
};
</script>
