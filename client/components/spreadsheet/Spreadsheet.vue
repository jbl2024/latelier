<template>
  <div class="spreadsheet">
    <div class="t-header">
      <t-column v-for="column in columns" :key="column._id" :column="column" class="column"></t-column>
    </div>
    <div class="content">
      <t-row  v-for="row in data" :key="row._id" :row="row" :columns="columns"></t-row>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    columns: {
      type: Array,
      default: []
    },
    data: {
      type: Array,
      default: []
    }
  }
};
</script>

<style scoped>
.spreadsheet {
}

.t-header {
  display: flex;
  flex-direction: row;
  
}
.column {
  padding: 12px;
  width: 256px;
  text-align: left;
  background-color: #f3f3f3;
  border-top: 1px solid #aaa;
  border-bottom: 1px solid #aaa;
  border-right: 1px solid #aaa;
}

.row {
  height: 42px;
}

</style>