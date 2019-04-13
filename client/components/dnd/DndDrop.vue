<template>
  <div ref="interact" class="draggable">
    <slot></slot>
  </div>
</template>

<script>
import interact from "interactjs";

export default {
  name: "dnd-drop",
  mounted() {
    interact(this.$refs.interact).dropzone({
      // only accept elements matching this CSS selector
      // Require a 75% element overlap for a drop to be possible
      accept: ".draggable",
      overlap: 0.75,

      // listen for drop related events:

      ondropactivate: function(event) {
        console.log("ondropactivate");
      },
      ondragenter: function(event) {
        console.log("ondragenter");
      },
      ondragleave: function(event) {
        console.log("ondragleave");
      },
      ondrop: function(event) {
        console.log("ondrop");
      },
      ondropdeactivate: function(event) {
        console.log("ondropdeactivate");
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