<template>
  <div class="column">
    {{ column.name }}
  </div>
</template>

<script>
export default {
  name: "t-column",
  props: {
    column: {
      type: Object,
    },
  },
};
</script>

<style scoped>
</style>