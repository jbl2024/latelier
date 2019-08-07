<template>
  <div :class="{selected: selected, cell: true}" @click="selectCell">
    <template v-if="!selected">{{ record[field] }}</template>
    <template v-if="selected">
      <input type="text" v-model="record[field]" ref="input" @keyup.enter="onEnter()">
    </template>
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
        this.$nextTick(() => {
          if (this.$refs.input) this.$refs.input.focus();
        })
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
    },

    onEnter() {
      this.$events.fire("t-select-next-record", {record: this.record, field: this.field});
    }
  },
};
</script>

<style scoped>

.cell {
  border: 1px solid white;
  border-bottom: 1px solid #aaa;
  border-right: 1px solid #aaa;
  width: 256px;
  padding: 12px;
}
.cell:hover {
  cursor: pointer;
}

.selected {
  border: 1px solid blue;
}
</style>