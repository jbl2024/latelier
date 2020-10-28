<template>
  <div v-if="project" class="project-export">
    <div class="wrapper">
      <v-subheader>
        {{ $t("project.export.itemsToExport") }}
      </v-subheader>
      <v-list v-if="availableItems && availableItems.length > 0" dense>
        <v-list-item v-for="item in availableItems" :key="item">
          <v-list-item-action>
            <v-checkbox color="accent" v-model="enabledItems[item]" />
          </v-list-item-action>
          <v-list-item-title>
            {{ $t(`project.export.items.${item}`) }}
          </v-list-item-title>
        </v-list-item>
      </v-list>

      <v-row justify="center">
        <v-col cols="6">
          <v-btn color="success" block @click.stop="exportProject">
            Procéder à l'export du projet
          </v-btn>
        </v-col>
      </v-row>
    </div>
  </div>
</template>
<script>
import { mapState } from "vuex";
import { Projects } from "/imports/api/projects/projects.js";
import { saveAs } from "file-saver";

const items = [
  "tasks",
  "users",
  "meetings",
  "bpmn",
  "canvas",
  "weather"
];

export default {
  props: {
    projectId: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      info: null,
      enabledItems: items.reduce((obj, item) => {
        obj[item] = true;
        return obj;
      }, {})
    }
  },
  computed: {
    ...mapState(["currentUser"]),
    ...mapState("project", ["currentProject"]),
    availableItems() {
      if (!this.currentProject) return [];
      const baseItems = ["tasks", "users"];
      return items.filter((item) => {
        if (baseItems.includes(item)) return true;
        return this.hasFeature(this.currentProject, item);
      })
    },
    itemsToExport() {
      return Object.keys(this.enabledItems).filter((item) => {
        return this.availableItems.includes(item) && this.enabledItems[item] === true;
      });
    }
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
      this.refresh();
      const project = Projects.findOne();
      if (project) {
        this.$store.dispatch("project/setCurrentProject", project);
      }
      return project;
    }
  },
  methods: {
    exportProject() {
      Meteor.call("projects.export",
        {
          projectId: this.projectId,
          items: this.itemsToExport
        },
        (error, result) => {
          // saveAs(blob, `export.zip`);
        }
      )
    },
    refresh() {
      Meteor.call("projects.info",
        { projectId: this.projectId },
        (error, result) => {
          if (error) {
            this.$notifyError(error);
            return;
          }
          this.info = result;
        });
    },
    hasFeature(project, feature) {
      return Array.isArray(project?.features)
        && project.features.includes(feature);
    },
  }
}
</script>
<style lang="scss">
  .project-export {
    background-color: #e5e5e5;
  }

  .wrapper {
    max-width: 800px;
    margin: 0 auto;
    padding-left: 12px;
    padding-right: 12px;
    padding-bottom: 12px;
    margin-top: 24px;
    margin-bottom: 24px;
    background-color: white;
    border-radius: 4px;
  }
</style>