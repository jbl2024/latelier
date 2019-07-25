<template>
  <div class="project-table elevation-1">
    <div v-if="!table">
      <v-progress-linear indeterminate></v-progress-linear>
    </div>
    <div class="wrapper">
      <div ref="spreadsheet" class="spreadsheet"></div>
    </div>
  </div>
</template>

<script>
import { Projects } from "/imports/api/projects/projects.js";
import { Tables } from "/imports/api/databases/databases.js";

import jexcel from "jexcel/dist/jexcel";
import "jexcel/dist/jexcel.min.css";

export default {
  beforeDestroy() {
    // if (this.spreadsheet) {
    //   jexcel.destroy(this.$refs.spreadsheet, true);
    //   this.spreadsheet = null;
    // }
  },
  props: {
    tableId: {
      type: String,
      default: "0"
    }
  },
  i18n: {
    messages: {
      en: {},
      fr: {}
    }
  },
  watch: {
    tableId: {
      immediate: true,
      handler(id) {
        if (id && id !== "0") {
          this.loadTable(id);
        }
      }
    }
  },
  data() {
    return {
      records: null,
      columns: [],
      table: null,
      spreadsheet: null
    };
  },
  methods: {
    loadTable(tableId) {
      Meteor.call('databases.findTable', tableId, (error, result) => {
        if (error) {
          this.$store.dispatch("notifyError", error);
          return;
        }
        this.table = result;
        if (this.table) {
          this.loadRecords(this.table);
        }
      })
    },
    loadRecords(table) {
      Meteor.call("databases.loadRecords", table._id, (error, result) => {
        if (error) {
          this.$store.dispatch("notifyError", error);
          return;
        }
        this.records = result.data;
        this.initializeTable();
      });
    },
    newColumn() {
    },
    initializeTable() {
      this.columns = [{
        title: "_id",
        width: 300,
        type: "hidden"
      }];
      const data = [];
      this.table.columns.map(column => {
        this.columns.push({title: column.name, _id: column._id});
      });
      this.records.map(record => {
        const item = [record._id];
        this.columns.map(column => {
          if (!column._id) return;
          item.push(record[column._id])
        });
        data.push(item)
      })
      const options = {
        columns: this.columns,
        data: data,
        onchange: this.onChange
      }
      this.spreadsheet = jexcel(this.$refs.spreadsheet, options);
    },
    onChange(instance, cell, x, y, value) {
      console.log(this.columns[x]);
      // this.records[this.columns[x]._id] = value;
      // Meteor.call('databases.updateRecord', this.tableId, data);
    }
  }
};
</script>

<style scoped>
.project-table {
  background-color: White;
  display: flex;
  min-height:0;
  height: 100%;
  flex-direction: column;
  position: relative;
}
.wrapper {
  flex:1;
  overflow-y: scroll;
  position: relative;
  display: flex;
  min-height: 0;
}
.spreadsheet {
  overflow: scroll;
  height: 100%;
  width: 100%;
}
</style>