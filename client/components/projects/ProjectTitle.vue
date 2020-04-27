<template>
  <div v-if="project" class="project-title">
    <v-toolbar-title v-show="!editProjectName" class="align-left">
      <div>
        <slot />
        <v-btn
          text
          icon
          color="white"
          :to="{ name: 'dashboard-page' }"
        >
          <v-icon>mdi-home</v-icon>
        </v-btn>
        <v-btn
          v-if="project.organizationId"
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
        <span class="title" @click="startUpdateProjectName">
          {{ truncatedTitle }}
        </span>
      </div>
    </v-toolbar-title>
    <div v-show="editProjectName" class="title edit align-left">
      <v-text-field
        ref="name"
        v-model="project.name"
        style="width: 500px"
        text
        hide-details
        prepend-inner-icon="mdi-pencil"
        label="Saisir un nom..."
        append-icon="mdi-check-circle"
        append-outer-icon="mdi-close-circle"
        @focus="$event.target.select()"
        @keyup.enter="updateProjectName"
        @click:append="updateProjectName"
        @click:append-outer="cancelUpdateProjectName"
      />
    </div>
  </div>
</template>

<script>
import { Projects } from "/imports/api/projects/projects.js";
import debounce from "lodash/debounce";
import { truncate } from '/imports/ui/utils/truncate';

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
      showMenu: true
    };
  },
  computed: {
    truncatedTitle() {
      if (!this.project?.name) return '';
      return truncate(this.project.name, 30);
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

</style>
