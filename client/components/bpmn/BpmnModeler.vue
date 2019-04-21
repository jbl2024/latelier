<template>
  <div class="bpmn-modeler">
    <v-toolbar dense class="toolbar">
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
    </v-toolbar>
    <div id="canvas" ref="canvas"></div>
  </div>
</template>

<script>
import "bpmn-js/dist/assets/diagram-js.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn-codes.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css";
import Modeler from "bpmn-js/dist/bpmn-modeler.development";
import debounce from "lodash/debounce";

export default {
  props: {
    processDiagram: Object
  },
  mounted() {
    this.saveDebounce = debounce(this.save, 2000);
  },
  data() {
    return {
      modeler: null,
      saveDebounce: null,
      xmlCache: null
    };
  },
  watch: {
    processDiagram: {
      immediate: true,
      handler(processDiagram) {
        this.refresh();
      }
    }
  },
  methods: {
    refresh() {
      this.$nextTick(() => {
        if (!this.modeler) {
          this.modeler = new Modeler({ container: this.$refs.canvas });
          this.modeler.on("element.changed", event => {
            this.saveDebounce();
          });
        }
        if (this.processDiagram.xml && this.processDiagram.xml !== this.xmlCache)  {
          console.log("loading")
          this.modeler.importXML(this.processDiagram.xml);
          this.xmlCache = this.processDiagram.xml;
        } else if (!this.xmlCache) {
          this.modeler.createDiagram();
        }
      });
    },

    save() {
      this.modeler.saveXML({ format: false }, (err, xml) => {
        if (err) {
          this.$store.dispatch("notifyError", error);
          return;
        }
        this.xmlCache = xml;
        Meteor.call(
          "processDiagrams.saveXML",
          { processDiagramId: this.processDiagram._id, xml: xml },
          (error, result) => {
            if (err) {
              this.$store.dispatch("notifyError", error);
              return;
            }
          }
        );
      });
    },

    undo() {
      this.modeler.get('commandStack').undo();
    },

    redo() {
      this.modeler.get('commandStack').redo();
    }
  }
};
</script>

<style scoped>
.bpmn-modeler {
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

#canvas {
  flex: 1;
}
</style>