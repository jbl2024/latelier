<template>
  <div class="bpmn-modeler">
    <v-toolbar dense class="toolbar"></v-toolbar>
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
      saveDebounce: null
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
        if (this.processDiagram.xml) {
          this.modeler.importXML(this.processDiagram.xml);
        } else {
          this.modeler.createDiagram();
        }
      });
    },

    save() {
      console.log("save");
      this.modeler.saveXML({ format: false }, (err, xml) => {
        if (err) {
          this.$store.dispatch("notifyError", error);
          return;
        }
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