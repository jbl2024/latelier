<template>
  <div v-if="project && canManageProject(project)" class="project-export">
    <div class="wrapper">
      <v-subheader>
        {{ $t("project.export.itemsToExport") }}
      </v-subheader>
      <v-list dense>
        <v-list-item v-for="(isSelected, item) in selectedItems" :key="item">
          <v-list-item-action>
            <v-checkbox
              v-model="selectedItems[item]"
              color="accent"
              :disabled="!availableItems.includes(item)"
            />
          </v-list-item-action>
          <v-list-item-title>
            {{ $t(`project.export.items.${item}`) }}
            <span v-if="getItemCount(item)">
              {{ `(${getItemCount(item)})` }}
            </span>
          </v-list-item-title>
        </v-list-item>
      </v-list>
      <v-row justify="center">
        <v-col cols="6">
          <v-btn color="success" block @click.stop="exportProject">
            {{ $t("project.export.export") }}
          </v-btn>
        </v-col>
      </v-row>
    </div>

    <generic-dialog
      v-model="loading"
      :title="$t('project.export.exportLoading')"
      max-width="520"
      simple
    >
      <template v-slot:content>
        <v-progress-linear v-if="loading" class="project-export__progress-bar" indeterminate />
      </template>
    </generic-dialog>
  </div>
</template>
<script>
import { mapState } from "vuex";
import { Projects } from "/imports/api/projects/projects.js";
import { importExportDefaultItems } from "/imports/api/projects/importExport/";
import { saveAs } from "file-saver";
import { sanitizeForFs } from "/imports/ui/utils/sanitize";
import { Permissions } from "/imports/api/permissions/permissions";
import moment from "moment";

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
      loading: false,
      infoMapping: Object.freeze({
        tasks: "taskCount",
        meetings: "meetingCount",
        users: "userCount",
        bpmn: "diagramCount",
        attachments: "attachmentCount"
      }),
      selectedItems: importExportDefaultItems.reduce((obj, item) => {
        obj[item] = true;
        return obj;
      }, {})
    };
  },
  computed: {
    ...mapState(["currentUser"]),
    ...mapState("project", ["currentProject"]),
    // Available items to export on current project
    availableItems() {
      if (!this.currentProject) return [];
      const baseItems = ["tasks", "users", "attachments"];
      return importExportDefaultItems.filter((item) => {
        if (baseItems.includes(item)) return true;
        return this.hasFeature(this.currentProject, item);
      });
    },
    // Selected items to export
    selectedItemsList() {
      return Object.keys(this.selectedItems)
        .filter((item) => this.availableItems
          .includes(item) && this.selectedItems[item] === true);
    }
  },
  watch: {
    availableItems() {
      this.selectedItems = Object.keys(this.selectedItems).reduce((selectedItems, key) => {
        selectedItems[key] = this.availableItems.includes(key);
        return selectedItems;
      }, {});
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
      this.getProjectsInfo();
      const project = Projects.findOne();
      if (project) {
        this.$store.dispatch("project/setCurrentProject", project);
      }
      return project;
    }
  },
  methods: {
    canManageProject(project) {
      return (
        Permissions.isAdmin(Meteor.userId(), project._id)
        || Permissions.isAdmin(Meteor.userId())
      );
    },
    getItemCount(item) {
      if (!this.info || !this.infoMapping[item]) return null;
      return this.info[this.infoMapping[item]];
    },
    exportProject() {
      this.loading = true;
      Meteor.call("projects.export",
        {
          projectId: this.projectId,
          items: this.selectedItemsList
        },
        (error, result) => {
          if (error || !result?.data || result.data.constructor !== Uint8Array) {
            this.loading = false;
            this.$notifyError(this.$t("projects.export.invalidExport"));
            return;
          }
          const blob = new Blob([result.data]);
          const timestamp = moment().format("YYYY-MM-DD");
          saveAs(blob, `${timestamp} - ${sanitizeForFs(this.project.name)}.zip`);
          this.loading = false;
          this.$notifyError(this.$t("projects.export.invalidExport"));
        });
    },
    getProjectsInfo() {
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
    }
  }
};
</script>
<style lang="scss" scoped>
  .project-export {
    background-color: #e5e5e5;
  }

  .project-export__progress-bar {
    margin-top: 20px;
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
