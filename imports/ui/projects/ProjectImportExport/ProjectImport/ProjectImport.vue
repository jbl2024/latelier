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
          <v-progress-linear
            v-model="importProgress"
            color="amber"
            height="25"
          >
            <template v-slot:default="{ value }">
              <strong>
                {{ Math.ceil(value) }}%
              </strong>
            </template>
          </v-progress-linear>
        </div>
        <div v-else-if="isLoading">
          {{ $t("Loading") }}
        </div>
        <div v-else-if="project" class="project-wrapper">
          <project-import-wizard
            :project="project"
            :import-options.sync="importOptions"
          />
        </div>
      </template>
      <template v-slot:actions>
        <v-btn 
          text 
          @click="confirmImport({dryRun: true})"
        >
          {{ $t("project.import.simulateImport") }}
        </v-btn>
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
import ProjectImportWizard from "/imports/ui/projects/ProjectImportExport/ProjectImport/ProjectImportWizard";

export default {
  components: {
    ProjectImportWizard
  },
  props: {
    project: {
      type: Object
    },
    importPath: {
      type: String
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
          organizationId: null
        },
        items: []
      },
      isLoading: false,
      isImporting: false,
      importProgress: 0,
      valid: true
    };
  },
  computed: {
    currentTitle() {
      return this.$t("project.import.importProject");
    },
    showDialog: {
      get() {
        return this.isShown;
      },
      set(isShown) {
        this.$emit("update:is-shown", isShown);
      },
    }
  },
  methods: {
    open() {
      this.showDialog = true;
    },
    close() {
      this.showDialog = false;
    },
    confirmImport(options = {}) {
      this.isImporting = true;
      Meteor.call("projects.import", {
        locale: this.$i18n.locale,
        importPath: this.importPath,
        options: this.importOptions
      }, (err, result) => {
        if (err) {
          this.$notifyError(err);
        }
        this.$notify(this.$t("project.import.importSuccess"));
        this.isImporting = false;
        this.showDialog = false;
      })
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
    justify-content: center;
    align-items: center;
    min-height: 200px;
    height: 200px;
  }
</style>
