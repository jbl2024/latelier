<template>
  <div class="row">
    <template v-for="column in columns">
      <t-cell :row="row" :column="column" :key="column._id" v-if="row" class="cell"></t-cell>
    </template>
  </div>
</template>

<script>
export default {
  name: "t-row",
  props: {
    row: {
      type: Object,
    },
    columns: {
      type: Array
    }
  },
};
</script>

<style scoped>
.row {
  display: flex;
  flex-direction: row;
}

.cell {
  border-bottom: 1px solid #aaa;
  border-right: 1px solid #aaa;
  width: 256px;
  padding: 12px;
}

</style>