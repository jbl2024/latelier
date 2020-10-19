<template>
  <div>
wo    <v-toolbar outlined dense>
      <tooltip-button
        icon="mdi-undo"
        :tooltip="$t('Undo')"
        bottom
        @on="undo()"
      />
      <tooltip-button icon="mdi-plus" :tooltip="$t('Add')" bottom @on="add()" />
      <tooltip-button
        icon="mdi-redo"
        :tooltip="$t('Redo')"
        bottom
        @on="redo()"
      />
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
  mxGraphSelectionModel,
  mxHierarchicalLayout,
  mxCompactTreeLayout,
  mxFastOrganicLayout,
  mxParallelEdgeLayout
} = new mxGraphFactory();

export default {
  data() {
    return {
      graph: null,
      undoManager: null,
      keyHandler: null,
      selectedCell: null,
      layout: null
    };
  },
  mounted() {
    this.graph = new mxGraph(this.$refs.container);
    new mxOutline(this.graph, this.$refs.outline);

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
    this.graph.setAllowDanglingEdges(false);
    this.graph.setDisconnectOnMove(false);

    this.layout = new mxParallelEdgeLayout(this.graph);

    new mxGraphSelectionModel(this.graph);
    this.graph
      .getSelectionModel()
      .addListener(mxEvent.CHANGE, (sender, evt) => {
        const cells = evt.getProperty("removed") || [];
        if (cells.length > 0) {
          const cell = cells[0];
          if (cell.isEdge()) {
            this.selectedCell = null;
          } else {
            console.log(cell.getEdgeCount());
            this.selectedCell = cell;
          }
        }
      });
    // Gets the default parent for inserting new cells. This
    // is normally the first child of the root (ie. layer 0).
    const parent = this.graph.getDefaultParent();

    // Adds cells to the model in a single step
    this.graph.getModel().beginUpdate();
    try {
      const v1 = this.graph.insertVertex(
        parent,
        null,
        "Root",
        420,
        100,
        80,
        30
      );
      // const v2 = this.graph.insertVertex(
      //   parent,
      //   null,
      //   "World!",
      //   300,
      //   150,
      //   80,
      //   30
      // );
      // const e1 = this.graph.insertEdge(parent, null, "", v1, v2);

      for (let i = 0; i < 5; i++) {
        const edge = this.graph.insertVertex(
          parent,
          null,
          `r-edge-${i}`,
          600,
          20 + i * 40,
          80,
          30
        );
        this.graph.insertEdge(parent, null, "", v1, edge);
      }

      for (let i = 0; i < 5; i++) {
        const edge = this.graph.insertVertex(
          parent,
          null,
          `l-edge-${i}`,
          200,
          20 + i * 40,
          80,
          30
        );
        this.graph.insertEdge(parent, null, "", v1, edge);
      }

      // for (let i = 0; i < 5; i++) {
      //   const edge = this.graph.insertVertex(
      //     parent,
      //     null,
      //     `edge-${i}`,
      //     300,
      //     0 + i * 40,
      //     80,
      //     30
      //   );
      //   this.graph.insertEdge(parent, null, "", v1, edge);
      // }
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
    add() {
      if (!this.selectedCell) {
        return;
      }
      const parent = this.graph.getDefaultParent();
      const edge = this.graph.insertVertex(
        parent,
        null,
        "New edge",
        200,
        20,
        80,
        30
      );
      this.graph.insertEdge(parent, null, "", this.selectedCell, edge);
      this.layout.execute(parent);
      this.graph.getModel().endUpdate();

    }
  }
};
</script>

<style lang="scss" scoped>
.graph-container {
  background: white;
  width: 100%;
  height: 100%;
  border: 1px solid #444;
}

.minimap {
  position: absolute;
  overflow: hidden;
  top: 96px;
  right: 0px;
  width: 200px;
  height: 140px;
  background: transparent;
  border-style: solid;
  border-color: black;
}
</style>
