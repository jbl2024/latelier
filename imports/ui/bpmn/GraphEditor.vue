<template>
  <div>
    <v-toolbar>
      <v-toolbar-title>Editor</v-toolbar-title>
      <tooltip-button icon="mdi-undo" :tooltip="$t('Undo')" @on="undo()" />
      <tooltip-button icon="mdi-redo" :tooltip="$t('Redo')" @on="redo()" />
    </v-toolbar>
    <div ref="container" class="graph-container" />
    <div ref="outline" class="minimap" />
  </div>
</template>

<script>
/* eslint no-new: 0 */
/* eslint new-cap: 0 */

import "mxgraph/javascript/src/css/common.css";

import mxGraphFactory from "mxgraph";

const {
  mxGraph,
  mxRubberband,
  mxConstants,
  mxUndoManager,
  mxEvent,
  mxEditor,
  mxOutline,
  mxPerimeter,
  mxRectangle,
  mxKeyHandler,
  mxEdgeStyle,
  mxClient,
  mxUtils,
  mxHierarchicalLayout,
} = new mxGraphFactory();

export default {
  data() {
    return {
      graph: null,
      undoManager: null,
      keyHandler: null
    };
  },
  mounted() {
    this.graph = new mxGraph(this.$refs.container);
    const outln = new mxOutline(this.graph, this.$refs.outline);

    this.graph.setPanning(true);
    this.graph.setConnectable(true);

    const style = this.graph.getStylesheet().getDefaultEdgeStyle();
    style[mxConstants.STYLE_EDGE] = mxEdgeStyle.ElbowConnector;
    style[mxConstants.STYLE_CURVED] = "1";

    new mxRubberband(this.graph);
    this.keyHander = new mxKeyHandler(this.graph);

    const undoManager = new mxUndoManager();
    const listener = function (sender, evt) {
      undoManager.undoableEditHappened(evt.getProperty("edit"));
    };
    this.undoManager = undoManager;
    this.graph.getModel().addListener(mxEvent.UNDO, listener);
    this.graph.getView().addListener(mxEvent.UNDO, listener);
    // Gets the default parent for inserting new cells. This
    // is normally the first child of the root (ie. layer 0).
    const parent = this.graph.getDefaultParent();

    // Adds cells to the model in a single step
    this.graph.getModel().beginUpdate();
    try {
      const v1 = this.graph.insertVertex(
        parent,
        null,
        "Hello,",
        20,
        20,
        80,
        30
      );
      const v2 = this.graph.insertVertex(
        parent,
        null,
        "World!",
        200,
        150,
        80,
        30
      );
      const e1 = this.graph.insertEdge(parent, null, "", v1, v2);
    } finally {
      // Updates the display
      this.graph.getModel().endUpdate();
    }
  },
  methods: {
    undo() {
      this.undoManager.undo();
    },
    redo() {
      this.undoManager.redo();
    },
  },
};
</script>

<style lang="scss" scoped>
.graph-container {
  background: white;
  width: 100%;
  height: 100%;
}

.minimap {
  position: absolute;
  overflow: hidden;
  top: 48px;
  right: 0px;
  width: 200px;
  height: 140px;
  background: transparent;
  border-style: solid;
  border-color: black;
}
</style>
