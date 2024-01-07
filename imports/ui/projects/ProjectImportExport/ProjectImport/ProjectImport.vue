<template>
  <div class="project-import">
    <generic-dialog
      v-model="showDialog"
      :css-classes="['project-import']"
      max-width="820"
      :title="currentTitle"
    >
      <template v-slot:content>
        <div v-if="isImporting" class="project-import__import-progress">
          <v-progress-linear indeterminate />
          <div class="mt-2">
            {{ $t("project.import.importLoading") }}
          </div>
        </div>
        <div v-else-if="isLoading">
          <v-progress-linear indeterminate />
        </div>
        <div v-else-if="project" class="project-wrapper">
          <project-import-wizard
            :project="project"
            :metadatas="projectMetadatas"
            :organization-id="organizationId"
            :import-options.sync="importOptions"
          />
        </div>
      </template>
      <template v-slot:actions>
        <v-btn
          :disabled="!valid"
          color="success"
          dark
          @click="confirmImport"
        >
          {{ $t("project.import.import") }}
        </v-btn>
      </template>
    </generic-dialog>
  </div>
</template>

<script>
import { ProjectAccessRights } from "/imports/api/projects/projects.js";
import ProjectImportWizard from "/imports/ui/projects/ProjectImportExport/ProjectImport/ProjectImportWizard";
import JSZip from "jszip";
import { unserializeProjectImportZip } from "/imports/api/projects/importExport";

export default {
  components: {
    ProjectImportWizard
  },
  props: {
    projectFile: {
      type: File,
      default: null
    },
    organizationId: {
      type: String,
      default: null
    },
    isShown: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      importOptions: {
        project: {
          name: "",
          organizationId: null,
          allowOrganization: true
        },
        items: []
      },
      project: null,
      projectMetadatas: null,
      isLoading: false,
      isImporting: false,
      importProgress: 0,
      valid: true
    };
  },
  computed: {
    currentTitle() {
      if (this.importOptions?.project?.name) {
        return `${this.$t("project.import.importProject")} : ${this.importOptions.project.name}`;
      }
      return this.$t("project.import.importProject");
    },
    showDialog: {
      get() {
        return this.isShown;
      },
      set(isShown) {
        this.$emit("update:is-shown", isShown);
      }
    }
  },
  watch: {
    projectFile: {
      immediate: true,
      async handler(file) {
        if (!file) return;
        this.isLoading = true;
        try {
          const zip = await JSZip.loadAsync(file);
          const zippedProjects = await unserializeProjectImportZip(zip);
          if (Array.isArray(zippedProjects) && zippedProjects[0]) {
            const metadatas = await zippedProjects[0].getContent("metadatas");
            const project = await zippedProjects[0].getContent("project");
            this.projectMetadatas = metadatas;
            this.project = project;
            this.showDialog = true;
            this.isLoading = false;
          }
        } catch (error) {
          this.$notifyError(error);
          this.isLoading = false;
          this.showDialog = false;
        }
      }
    }
  },
  methods: {
    open() {
      this.showDialog = true;
    },
    close() {
      this.showDialog = false;
    },
    confirmImport() {
      this.isImporting = true;

      const reader = new FileReader();

      // Wrap the FileReader process in a Promise
      const readFile = (file) => new Promise((resolve, reject) => {
        reader.onload = () => resolve(new Uint8Array(reader.result));
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
      });

      readFile(this.projectFile).then(async (fileBuffer) => {
        try {
          const projectId = await Meteor.callAsync("projects.import", {
            fileBuffer,
            locale: this.$i18n.locale,
            projectName: this.importOptions.project.name,
            organizationId: this.importOptions.project.organizationId,
            accessRights: this.importOptions.project.allowOrganization
              ? ProjectAccessRights.ORGANIZATION
              : ProjectAccessRights.PRIVATE,
            items: this.importOptions.items
          });

          this.isImporting = false;
          this.showDialog = false;

          this.$notify(this.$t("project.import.importSuccess"));
          if (projectId) {
            this.$router.push({ name: "project", params: { projectId } });
          }
        } catch (err) {
          this.isImporting = false;
          this.showDialog = false;

          error = err.error === "project-import"
            ? {
              error: err.error,
              reason: this.$t(`project.import.errors.${err.reason}`)
            } : err;

          this.$notifyError(error);
        }
      }).catch((error) => {
        this.isImporting = false;
        this.showDialog = false;
        this.$notifyError(error);
      });
    }

  }
};
</script>

<style lang="scss" scoped>
  .project-import .v-card__text {
    padding: 0;
  }
  .project-import__import-progress {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: 200px;
    height: 200px;
  }
</style>
