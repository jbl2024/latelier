<template>
  <div :class="{selected: selected, cell: true}" @click="selectCell">
    {{ record[field] }}
  </div>
</template>

<script>
export default {
  name: "t-cell",
  props: {
    record: {
      type: Object,
    },
    column: {
      type: Object
    }
  },
  data() {
    return {
      selected: false
    }
  },
  computed: {
    field() {
      if (this.column) return this.column._id; 
    }
  },
  mounted() {
    this.$events.listen("t-select-cell", event => {
      if (event.record._id === this.record._id && event.field === this.column._id ) {
        this.selected = true;
        return;
      }
      if (this.selected) this.selected = false;
    });
  },
  beforeDestroy() {
    this.$events.off("t-select-cell");
  },

  methods: {
    selectCell() {
      this.$events.fire("t-select-cell", {record: this.record, field: this.field});  
    }
  },
};
</script>

<style scoped>

.cell {
  border-bottom: 1px solid #aaa;
  border-right: 1px solid #aaa;
  width: 256px;
  padding: 12px;
}
.cell:hover {
  cursor: pointer;
}

.selected {
  border: 2px solid blue;
}
</style>