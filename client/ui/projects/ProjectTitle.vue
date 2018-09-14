<template>

  <div class="project-title md-layout md-gutter">
    <div class="md-layout-item md-toolbar-section-start">
      <span class="md-title" v-show="!editProjectName" @click="startUpdateProjectName">
        {{ project.name }}
      </span>
      <span class="md-title edit-project-name" v-show="editProjectName">
        <input @focus="$event.target.select()" type="text" ref="name" v-model="project.name" v-on:keyup.enter="updateProjectName">
        <md-button class="md-icon-button" @click.native="updateProjectName">
          <md-icon>check_circle</md-icon>
        </md-button>

        <md-button class="md-icon-button" @click.native="cancelUpdateProjectName">
          <md-icon>cancel</md-icon>
        </md-button>
      </span>
    </div>

    <div class="md-layout-item md-toolbar-section-end show-desktop">
      <md-field class="search" md-clearable>
        <md-icon>search</md-icon>
        <md-input placeholder="Rechercher..." v-on:input="debouncedFilter" />
      </md-field>
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
      default: 0
    }
  },
  created() {
    this.debouncedFilter = debounce(val => {
      this.$events.fire("filter-tasks", val);
    }, 400);
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
  data() {
    return {
      savedProjectName: "",
      editProjectName: false,
      debouncedFilter: ""
    };
  },
  methods: {
    startUpdateProjectName() {
      this.savedProjectName = this.project.name;
      this.editProjectName = true;
      this.$nextTick(() => this.$refs.name.focus());
    },

    updateProjectName() {
      this.editProjectName = false;
      Meteor.call("projects.updateName", this.project._id, this.project.name);
    },

    cancelUpdateProjectName() {
      this.editProjectName = false;
      this.project.name = this.savedProjectName;
    }
  }
};
</script>

<style scoped>
.edit-project-name input {
  font-size: 20px;
  font-weight: 400;
  letter-spacing: 0.02em;
  margin-top: 6px;
  padding: 0;
  font-family: Roboto, Noto Sans, -apple-system, BlinkMacSystemFont, sans-serif;
}

.edit-project-name .md-button {
  margin: 0;
}

.search input, .search input:focus {
  color: white !important;
}
input:focus {
  color: white !important;
}

.search .md-input {
  color: white !important;
}
</style>