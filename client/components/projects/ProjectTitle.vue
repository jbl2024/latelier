<template>

  <div class="project-title">
    <v-toolbar-title class="align-left" v-show="!editProjectName">
      <div>
        <slot></slot>
        <v-btn flat icon color="white" v-if="project && project.organizationId" :to="{ name: 'projects-page', params: {organizationId: project.organizationId} }">
          <v-icon>domain</v-icon>
        </v-btn>
        <span class="title" @click="startUpdateProjectName">
            {{ project.name }}
        </span>
      </div>
    </v-toolbar-title>
    <v-text-field v-show="!editProjectName"
        flat
        solo-inverted
        hide-details
        prepend-inner-icon="search"
        label="Rechercher..."
        class="hidden-sm-and-down align-remaining"
        v-on:input="debouncedFilter"
    ></v-text-field>
    <div class="title edit align-left" v-show="editProjectName">
      <v-text-field @focus="$event.target.select()" style="width: 500px" flat solo-inverted hide-details prepend-inner-icon="edit" label="Saisir un nom..." ref="name" v-model="project.name" v-on:keyup.enter="updateProjectName"></v-text-field>
      <v-btn icon @click="updateProjectName">
        <v-icon>check_circle</v-icon>
      </v-btn>
      <v-btn icon @click="cancelUpdateProjectName">
        <v-icon>cancel</v-icon>
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
      if (this.$refs.name) {
        this.$nextTick(() => this.$refs.name.focus());
      }
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