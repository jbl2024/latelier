<template>
  <div class="project-process-diagram">
    <div v-if="!$subReady.processDiagram">
      <v-progress-linear indeterminate></v-progress-linear>
    </div>
    <div v-if="$subReady.processDiagram" class="wrapper">
      <v-toolbar dense class="toolbar">
        <v-btn
          icon
          @click="gotoBpmn()"
        >
          <v-icon>donut_large</v-icon>
        </v-btn>
        <span class="title">{{ processDiagram.name }}</span>
        <v-spacer></v-spacer>
        <div>
          <v-tooltip top slot="activator">
            <v-btn icon @click.stop="exportSVG()" slot="activator">
              <v-icon>photo</v-icon>
            </v-btn>
            <span>{{ $t('Export image') }}</span>
          </v-tooltip>
        </div>

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
          <div>
            <v-tooltip top slot="activator">
              <v-btn icon @click.stop="view()" slot="activator">
                <v-icon>check</v-icon>
              </v-btn>
              <span>{{ $t('Close') }}</span>
            </v-tooltip>
          </div>
        </template>
      </v-toolbar>
      <bpmn-viewer
        :process-diagram="processDiagram"
        class="bpmn"
        ref="viewer"
        v-on:dblclick.native="edit()"
        v-if="mode === 'view' && processDiagram.xml"
      ></bpmn-viewer>
      <empty-state
        class="empty"
        v-show="mode === 'view' && !processDiagram.xml"
        illustration="empty"
        :label="$t('Empty diagram')"
      >
        <v-btn class="primary" @click="edit()">{{ $t('Start edition') }}</v-btn>
      </empty-state>

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
import { saveAs } from 'file-saver';

export default {
  mixins: [TextRenderingMixin],
  i18n: {
    messages: {
      en: {
        "Empty diagram": "Empty diagram",
        "Start edition": "Start edition",
        "Undo": "Undo",
        "Redo": "Redo",
        "Edit": "Edit",
        "Close": "Close",
        "Export image": "Export image",
      },
      fr: {
        "Empty diagram": "Diagramme vide",
        "Start edition": "Démarrer l'édition",
        "Undo": "Annuler",
        "Redo": "Refaire",
        "Edit": "Editer",
        "Close": "Fermer",
        "Export image": "Exporter l'image",
      }
    }
  },
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
    },

    exportSVG() {
      const cb = (err, svg) => {
        const blob = new Blob([svg], {type: "image/svg+xml;charset=utf-8"})
        saveAs(blob, this.processDiagram.name + ".svg");
      };

      if (this.mode === 'edit') {
        this.$refs.modeler.saveSVG(cb);
      } else {
        this.$refs.viewer.saveSVG(cb);
      }
    },

    gotoBpmn() {
      this.$router.push({ name: 'project-bpmn', params: {projectId: this.projectId} });
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