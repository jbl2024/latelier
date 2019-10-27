<template>
  <div class="project-process-diagram">
    <div v-if="!$subReady.processDiagram">
      <v-progress-linear indeterminate />
    </div>
    <div v-if="$subReady.processDiagram" class="wrapper">
      <v-toolbar dense class="toolbar">
        <v-btn icon @click="gotoBpmn()">
          <v-icon>mdi-chart-donut</v-icon>
        </v-btn>
        <span class="title">{{ processDiagram.name }}</span>
        <v-spacer />
        <div>
          <v-tooltip top>
            <template v-slot:activator="{ on }">
              <v-btn icon @click.stop="exportSVG()" v-on="on">
                <v-icon>mdi-image</v-icon>
              </v-btn>
            </template>
            <span>{{ $t("Export image") }}</span>
          </v-tooltip>
        </div>

        <template v-if="mode === 'view'">
          <div>
            <v-tooltip top>
              <template v-slot:activator="{ on }">
                <v-btn icon @click.stop="edit()" v-on="on">
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
              </template>
              <span>{{ $t("Edit") }}</span>
            </v-tooltip>
          </div>
        </template>
        <template v-if="mode === 'edit'">
          <div>
            <v-tooltip top>
              <template v-slot:activator="{ on }">
                <v-btn icon @click.stop="undo()" v-on="on">
                  <v-icon>mdi-undo</v-icon>
                </v-btn>
              </template>
              <span>{{ $t("Undo") }}</span>
            </v-tooltip>
          </div>
          <div>
            <v-tooltip top>
              <template v-slot:activator="{ on }">
                <v-btn icon @click.stop="redo()" v-on="on">
                  <v-icon>mdi-redo</v-icon>
                </v-btn>
              </template>
              <span>{{ $t("Redo") }}</span>
            </v-tooltip>
          </div>
          <div>
            <v-tooltip top>
              <template v-slot:activator="{ on }">
                <v-btn icon @click.stop="view()" v-on="on">
                  <v-icon>mdi-check</v-icon>
                </v-btn>
              </template>
              <span>{{ $t("Close") }}</span>
            </v-tooltip>
          </div>
        </template>
      </v-toolbar>
      <bpmn-viewer
        v-if="mode === 'view' && processDiagram.xml"
        ref="viewer"
        :process-diagram="processDiagram"
        class="bpmn"
        @dblclick.native="edit()"
      />
      <empty-state
        v-show="mode === 'view' && !processDiagram.xml"
        class="empty"
        illustration="empty"
        :label="$t('Empty diagram')"
      >
        <v-btn class="primary" @click="edit()">
          {{ $t("Start edition") }}
        </v-btn>
      </empty-state>

      <bpmn-modeler
        v-if="mode === 'edit'"
        ref="modeler"
        :process-diagram="processDiagram"
        class="bpmn"
      />
    </div>
  </div>
</template>

<script>
import { Projects } from "/imports/api/projects/projects.js";
import { ProcessDiagrams } from "/imports/api/bpmn/processDiagrams";
import TextRenderingMixin from "/imports/ui/mixins/TextRenderingMixin.js";
import { saveAs } from "file-saver";

export default {
  mixins: [TextRenderingMixin],
  i18n: {
    messages: {
      en: {
        "Empty diagram": "Empty diagram",
        "Start edition": "Start edition",
        Undo: "Undo",
        Redo: "Redo",
        Edit: "Edit",
        Close: "Close",
        "Export image": "Export image"
      },
      fr: {
        "Empty diagram": "Diagramme vide",
        "Start edition": "Démarrer l'édition",
        Undo: "Annuler",
        Redo: "Refaire",
        Edit: "Editer",
        Close: "Fermer",
        "Export image": "Exporter l'image"
      }
    }
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
  mounted() {
    this.$store.dispatch("setCurrentProjectId", this.projectId);
  },
  beforeDestroy() {
    this.$store.dispatch("setCurrentProjectId", 0);
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
        const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
        saveAs(blob, `${this.processDiagram.name}.svg`);
      };

      if (this.mode === "edit") {
        this.$refs.modeler.saveSVG(cb);
      } else {
        this.$refs.viewer.saveSVG(cb);
      }
    },

    gotoBpmn() {
      this.$router.push({
        name: "project-bpmn",
        params: { projectId: this.projectId }
      });
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
