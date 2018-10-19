<template>

  <div class="project-title ml-0 pl-3">
    <v-toolbar-title class="align-left">
      <slot></slot>
      <v-btn flat icon color="white" v-if="project && project.organizationId" class="md-icon-button" :to="{ name: 'projects-page', params: {organizationId: project.organizationId} }">
        <v-icon>domain</v-icon>
      </v-btn>
      <span class="title ml-3 mr-5" v-show="!editProjectName" @click="startUpdateProjectName">
          {{ project.name }}
      </span>
      <span class="title edit-project-name" v-show="editProjectName">
        <input @focus="$event.target.select()" type="text" ref="name" v-model="project.name" v-on:keyup.enter="updateProjectName">
        <v-btn @click="updateProjectName">
          <v-icon>check_circle</v-icon>
        </v-btn>

        <v-btn @click="cancelUpdateProjectName">
          <v-icon>cancel</v-icon>
        </v-btn>
      </span>
    </v-toolbar-title>

    <v-text-field
        style="width: 500px"
        flat
        solo-inverted
        hide-details
        prepend-inner-icon="search"
        label="Rechercher..."
        class="hidden-sm-and-down"
        v-on:input="debouncedFilter"
    ></v-text-field>

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

.project-title {
}

.align-left {
  float: left;
}
</style>