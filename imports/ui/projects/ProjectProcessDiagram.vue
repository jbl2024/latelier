<template>
  <div class="project-process-diagram">
    <div v-if="!$subReady.processDiagram">
      <v-progress-linear indeterminate></v-progress-linear>
    </div>
    <div v-if="$subReady.processDiagram" class="wrapper">
      <v-toolbar dense class="toolbar">
        <template v-if="mode === 'view'">
          <div>
            <v-tooltip top slot="activator">
              <v-btn icon @click.stop="edit()" slot="activator">
                <v-icon>edit</v-icon>
              </v-btn>
              <span>{{ $t('Edit') }}</span>
            </v-tooltip>
          </div>
        </template>
        <template v-if="mode === 'edit'">
          <div>
            <v-tooltip top slot="activator">
              <v-btn icon @click.stop="view()" slot="activator">
                <v-icon>close</v-icon>
              </v-btn>
              <span>{{ $t('View') }}</span>
            </v-tooltip>
          </div>
          <div>
            <v-tooltip top slot="activator">
              <v-btn icon @click.stop="undo()" slot="activator">
                <v-icon>undo</v-icon>
              </v-btn>
              <span>{{ $t('Undo') }}</span>
            </v-tooltip>
          </div>
          <div>
            <v-tooltip top slot="activator">
              <v-btn icon @click.stop="redo()" slot="activator">
                <v-icon>redo</v-icon>
              </v-btn>
              <span>{{ $t('Redo') }}</span>
            </v-tooltip>
          </div>
        </template>
      </v-toolbar>
      <bpmn-viewer
        :process-diagram="processDiagram"
        class="bpmn"
        ref="viewer"
        v-if="mode === 'view'"
      ></bpmn-viewer>
      <bpmn-modeler
        :process-diagram="processDiagram"
        class="bpmn"
        ref="modeler"
        v-if="mode === 'edit'"
      ></bpmn-modeler>
    </div>
  </div>
</template>

<script>
import { Projects } from "/imports/api/projects/projects.js";
import { Lists } from "/imports/api/lists/lists.js";
import { Tasks } from "/imports/api/tasks/tasks.js";
import { ProcessDiagrams } from "/imports/api/bpmn/processDiagrams";
import TextRenderingMixin from "/imports/ui/mixins/TextRenderingMixin.js";

export default {
  mixins: [TextRenderingMixin],
  mounted() {
    this.$store.dispatch("setCurrentProjectId", this.projectId);
  },
  beforeDestroy() {
    this.$store.dispatch("setCurrentProjectId", 0);
  },
  props: {
    projectId: {
      type: String,
      default: "0"
    },
    processDiagramId: {
      type: String,
      default: "0"
    }
  },
  data() {
    return {
      modeler: null,
      mode: "view"
    };
  },
  meteor: {
    $subscribe: {
      processDiagram: function() {
        return [this.processDiagramId];
      }
    },
    processDiagram() {
      return ProcessDiagrams.findOne();
    },
    project() {
      return Projects.findOne();
    }
  },
  methods: {
    edit() {
      this.mode = "edit";
    },
    view() {
      this.mode = "view";
    },
    undo() {
      this.$refs.modeler.undo();
    },

    redo() {
      this.$refs.modeler.redo();
    }
  }
};
</script>

<style scoped>
#canvas {
  height: 90vh;
}
.empty {
  margin-top: 24px;
}

.wrapper {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  right: 0;
  display: flex;
  flex-direction: column;
}

.toolbar {
  flex: 0;
}

.bpmn {
  flex: 1;
}
</style>