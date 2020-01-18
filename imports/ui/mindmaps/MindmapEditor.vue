<template>
  <div ref="container" v-resize="onResizeCanvas" class="canvas-container">
    <canvas ref="canvas" class="fabric" />
    <v-navigation-drawer
      v-model="showDrawer"
      class="elevation-16 panel"
      :width="$vuetify.breakpoint.xsOnly ? '100%' : '256px'"
      absolute
      stateless
      right
      fixed
    >
      coucou
    </v-navigation-drawer>
  </div>
</template>

<script>
import { fabric } from "fabric";
import { MindmapNode } from "./widgets/MindmapNode";

export default {
  props: {
    mindmap: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      canvas: null,
      showDrawer: true
    };
  },
  mounted() {
    this.$store.dispatch("setCurrentProjectId", this.projectId);
    this.$nextTick(() => {
      this.initCanvas();
      this.onResizeCanvas();
    });
  },
  beforeDestroy() {
    this.destroyCanvas();
  },
  methods: {
    initCanvas() {
      const el = this.$refs.canvas;
      if (!el) return;
      this.canvas = new fabric.Canvas(el);

      const red = new fabric.Rect({
        top: 100,
        left: 0,
        width: 80,
        height: 50,
        fill: "red"
      });
      const blue = new fabric.Rect({
        top: 0,
        left: 100,
        width: 50,
        height: 70,
        fill: "blue"
      });
      const green = new fabric.Rect({
        top: 100,
        left: 100,
        width: 60,
        height: 60,
        fill: "green"
      });

      // create grid
      const grid = 50;
      for (let i = 0; i < 600 / grid; i++) {
        this.canvas.add(
          new fabric.Line([i * grid, 0, i * grid, 600], {
            stroke: "#ccc",
            selectable: false
          })
        );
        this.canvas.add(
          new fabric.Line([0, i * grid, 600, i * grid], {
            stroke: "#ccc",
            selectable: false
          })
        );
      }

      this.canvas.add(red, blue, green);

      const circle = new fabric.Circle({
        left: 200,
        top: 200,
        strokeWidth: 1,
        radius: 240,
        fill: "#fff",
        stroke: "#666",
        strokeDashArray: [10, 4]
      });
      this.canvas.add(circle);

      // const text = new fabric.IText("hello world", {
      //   left: 100,
      //   top: 100,
      //   fontFamily: "Roboto"
      // });
      // this.canvas.add(text);
      // text.enterEditing();

      const mindmapNode = new MindmapNode(this.canvas, "hello, world", {
        left: 100,
        top: 100,
        fontFamily: "Roboto",
        rx: 10,
        ry: 10,
        backgroundColor: "#CFD8DC"
      });
    },

    destroyCanvas() {
      if (this.canvas) {
        this.canvas.dispose();
        this.canvas = null;
      }
    },

    onResizeCanvas() {
      if (!this.canvas) return;

      const { container } = this.$refs;
      const width = container.offsetWidth;
      const height = container.offsetHeight;
      this.canvas.setWidth(width);
      this.canvas.setHeight(height);
      this.canvas.calcOffset();
    }
  }
};
</script>

<style scoped>
.canvas-container {
  overflow: scroll;
}
</style>
