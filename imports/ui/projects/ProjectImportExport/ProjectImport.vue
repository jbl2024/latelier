<template>
  <div class="project-import">
    <generic-dialog
      v-model="showDialog"
      max-width="820"
      :title="currentTitle"
    >
      <template v-slot:content>
        <div v-if="isLoading">
          {{ $t("Loading") }}
        </div>
        <div v-else-if="firstZippedProject" class="project-wrapper">
          <project-import-wizard
            :zipped-project="firstZippedProject"
          />
        </div>
      </template>
    </generic-dialog>
  </div>
</template>

<script>
import JSZip from "jszip";
import ProjectImportWizard from "/imports/ui/projects/ProjectImportExport/ProjectImportWizard";
import { parseProjectImportZip } from "/imports/api/projects/importExport";

export default {
  components: {
    ProjectImportWizard
  },
  props: {
    file: {
      type: [Object, File]
    },
    isShown: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      zippedProjects: null,
      isLoading: false
    };
  },
  computed: {
    currentTitle() {
      return this.$t("project.import.importProject");
    },
    firstZippedProject() {
      if (!Array.isArray(this.zippedProjects) || !this.zippedProjects.length) return null;
      return this.zippedProjects[0];
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
  },
  watch: {
    file: {
      immediate: true,
      async handler(file) {
        this.isLoading = true;
        const zip = await JSZip.loadAsync(file);
        this.zippedProjects = await parseProjectImportZip(zip);
        this.isLoading = false;
      }
    }
  }
};
</script>

<style scoped>
.project-wrapper {
  -webkit-overflow-scrolling: touch;
}

@media (min-width: 601px) {
  .project-wrapper {
    height: calc(100vh - 200px);
    min-height: 360px;
    max-height: 530px;
    overflow-y: scroll;
  }
}

@media (max-width: 600px) {
  .project-wrapper {
    overflow-y: scroll;
  }
}

.project {
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  -webkit-overflow-scrolling: touch;
}

.stepper {
  box-shadow: none;
}

.feature-card {
  border: 4px solid transparent;
  transition: border 0.5s;
  min-height: 158px;
}

.feature-card:hover {
  border: 4px solid #2675c5;
}

.feature-card.selected {
  border: 4px solid #2675c5;
}
</style>
