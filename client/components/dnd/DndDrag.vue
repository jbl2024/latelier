<template>
  <div ref="interact" class="draggable">
    <slot></slot>
  </div>
</template>

<script>
import interact from "interactjs";

export default {
  name: "dnd-drag",
  mounted() {
    const that = this;
    interact(this.$refs.interact).draggable({
      inertia: true,
      onstart (event) {
        console.log('foo')
        that.$emit("dragstart");
      },
      onend (event) {
        that.$emit("dragend");
      },
      onmove(event) {
        console.log(event.pageX, event.pageY);
        // var target = event.target,
        //   // keep the dragged position in the data-x/data-y attributes
        //   x = (parseFloat(target.getAttribute("data-x")) || 0) + event.dx,
        //   y = (parseFloat(target.getAttribute("data-y")) || 0) + event.dy;

        // // translate the element
        // target.style.webkitTransform = target.style.transform =
        //   "translate(" + x + "px, " + y + "px)";

        // // update the posiion attributes
        // target.setAttribute("data-x", x);
        // target.setAttribute("data-y", y);
      }
    });
  }
};
</script>

<style  scoped>
.draggable {
    touch-action: none
}
</style>