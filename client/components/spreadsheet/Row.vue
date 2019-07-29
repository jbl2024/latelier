<template>
  <div class="row">
    <template v-for="column in columns">
      <t-cell :record="record" :column="column" :key="column._id" v-if="record" class="cell"></t-cell>
    </template>
  </div>
</template>

<script>
export default {
  name: "t-row",
  props: {
    record: {
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
</style>