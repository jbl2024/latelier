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
        <tooltip-button
          icon="mdi-file-export"
          :tooltip="$t('Export XML')"
          @on="exportXML()"
        />
        <tooltip-button
          icon="mdi-image"
          :tooltip="$t('Export image')"
          @on="exportSVG()"
        />
        <template v-if="mode === 'view'">
          <tooltip-button
            icon="mdi-pencil"
            :tooltip="$t('Edit')"
            @on="edit()"
          />
        </template>
        <template v-if="mode === 'edit'">
          <tooltip-button
            icon="mdi-undo"
            :tooltip="$t('Undo')"
            @on="undo()"
          />
          <tooltip-button
            icon="mdi-redo"
            :tooltip="$t('Redo')"
            @on="redo()"
          />
          <tooltip-button
            icon="mdi-check"
            :tooltip="$t('Close')"
            @on="view()"
          />
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
import BpmnViewer from "/imports/ui/bpmn/BpmnViewer.vue";
import BpmnModeler from "/imports/ui/bpmn/BpmnModeler.vue";
import { saveAs } from "file-saver";

export default {
  components: {
    BpmnViewer: BpmnViewer,
    BpmnModeler: BpmnModeler
  },
  mixins: [TextRenderingMixin],
  i18n: {
    messages: {
      en: {
        "Empty diagram": "Empty diagram",
        "Start edition": "Start edition",
        Undo: "Undo",
        Redo: "Redo",
        Edit: "Edit",
        Close: "Close"
      },
      fr: {
        "Empty diagram": "Diagramme vide",
        "Start edition": "Démarrer l'édition",
        Undo: "Annuler",
        Redo: "Refaire",
        Edit: "Editer",
        Close: "Fermer"
      }
    }
  },
  props: {
    projectId: {
      type: String,
      default: null
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
    this.$store.dispatch("setCurrentProjectId", null);
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

    exportXML() {
      const { xml } = this.processDiagram;
      const blob = new Blob([xml], { type: "application/xml;charset=utf-8" });
      saveAs(blob, `${this.processDiagram.name}.xml`);
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
