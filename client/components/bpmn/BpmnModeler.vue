<template>
  <div id="canvas" ref="canvas"></div>
</template>

<script>
import "bpmn-js/dist/assets/diagram-js.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn-codes.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css";
import Modeler from "bpmn-js/dist/bpmn-modeler.production.min";
import "diagram-js-minimap/assets/diagram-js-minimap.css";
import minimapModule from 'diagram-js-minimap';

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
          this.modeler = new Modeler({
            container: this.$refs.canvas,
            keyboard: { bindTo: document },
            additionalModules: [minimapModule]
          });
          this.modeler.on("element.changed", event => {
            this.saveDebounce();
          });
        }
        if (
          this.processDiagram.xml &&
          this.processDiagram.xml !== this.xmlCache
        ) {
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

    saveSVG(cb) {
      this.modeler.saveSVG(cb);
    },

    undo() {
      this.modeler.get("commandStack").undo();
    },

    redo() {
      this.modeler.get("commandStack").redo();
    }
  }
};
</script>

<style scoped>
</style>