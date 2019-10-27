<template>
  <div v-if="project" class="project-title">
    <v-toolbar-title v-show="!editProjectName" class="align-left">
      <div>
        <slot />
        <v-btn
          v-if="showKanbanLink"
          text
          icon
          color="white"
          :to="{ name: 'project', params: { projectId: project._id } }"
        >
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
        <v-btn
          v-if="!showKanbanLink"
          text
          icon
          color="white"
          :to="{ name: 'dashboard-page' }"
        >
          <v-icon>mdi-home</v-icon>
        </v-btn>
        <v-btn
          v-if="!showKanbanLink && project.organizationId"
          text
          icon
          color="white"
          :to="{
            name: 'dashboard-organization-page',
            params: { organizationId: project.organizationId }
          }"
        >
          <v-icon>mdi-view-dashboard</v-icon>
        </v-btn>
        <span class="title" @click="startUpdateProjectName">{{
          project.name
        }}</span>
      </div>
    </v-toolbar-title>
    <v-text-field
      v-show="!editProjectName"
      v-model="savedValue"
      solo-inverted
      color="primary"
      hide-details
      prepend-inner-icon="mdi-magnify"
      :label="$t('Search') + '...'"
      class="hidden-sm-and-down align-remaining"
      @input="debouncedFilter"
    />
    <div v-show="editProjectName" class="title edit align-left">
      <v-text-field
        ref="name"
        v-model="project.name"
        style="width: 500px"
        text
        solo-inverted
        color="primary"
        hide-details
        prepend-inner-icon="mdi-pencil"
        label="Saisir un nom..."
        @focus="$event.target.select()"
        @keyup.enter="updateProjectName"
      />
      <v-btn icon @click="updateProjectName">
        <v-icon>mdi-check-circle</v-icon>
      </v-btn>
      <v-btn icon @click="cancelUpdateProjectName">
        <v-icon>mdi-close-circle</v-icon>
      </v-btn>
    </div>
  </div>
</template>

<script>
import { Projects } from "/imports/api/projects/projects.js";
import debounce from "lodash/debounce";

export default {
  props: {
    projectId: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      savedProjectName: "",
      editProjectName: false,
      savedValue: "",
      debouncedFilter: "",
      showKanbanLink: false
    };
  },
  watch: {
    $route: {
      deep: true,
      immediate: true,
      handler: function () {
        const page = this.$router.currentRoute.name;
        if (page !== "project" && page !== "project-task") {
          this.showKanbanLink = true;
        } else {
          this.showKanbanLink = false;
        }
      }
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
  },
  methods: {
    startUpdateProjectName() {
      this.savedProjectName = this.project.name;
      this.editProjectName = true;
      if (this.$refs.name) {
        this.$nextTick(() => this.$refs.name.focus());
      }
    },

    updateProjectName() {
      this.editProjectName = false;
      Meteor.call("projects.updateName", {
        projectId: this.project._id,
        name: this.project.name
      });
    },

    cancelUpdateProjectName() {
      this.editProjectName = false;
      this.project.name = this.savedProjectName;
    }
  }
};
</script>

<style scoped>
.project-title {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  flex: 2;
}

.align-left {
  flex: 1;
}

.align-remaining {
  flex: 1;
}

.edit .v-text-field {
  float: left;
}

.title {
  position: relative;
  top: 3px;
}
</style>
