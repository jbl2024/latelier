<template>
  <div class="cell">
    {{ row[column._id] }}
  </div>
</template>

<script>
export default {
  name: "t-cell",
  props: {
    row: {
      type: Object,
    },
    column: {
      type: Object
    }
  },
};
</script>

<style scoped>
</style>