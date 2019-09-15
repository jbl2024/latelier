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
    if (this.spreadsheet) {
      jexcel.destroy(this.$refs.spreadsheet, false);
      this.spreadsheet = null;
    }
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
      spreadsheet: null,
      data: []
    };
  },
  methods: {
    loadTable(tableId) {
      Meteor.call("databases.findTable", tableId, (error, result) => {
        if (error) {
          this.$store.dispatch("notifyError", error);
          return;
        }
        this.table = result;
        if (this.table) {
          this.loadRecords(this.table);
        }
      });
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
    newColumn() {},
    initializeTable() {
      this.columns = [
        {
          title: "_id",
          width: 300,
          type: "hidden"
        }
      ];
      this.data = [];
      this.table.columns.map(column => {
        this.columns.push({ 
          title: column.name, 
          _id: column._id,
          width: 300,
        });
      });
      this.records.map(record => {
        const item = [record._id];
        this.columns.map(column => {
          if (!column._id) return;
          item.push(record[column._id]);
        });
        this.data.push(item);
      });
      const options = {
        columns: this.columns,
        data: this.data,
        onchange: this.onChange,
        oninsertrow: this.onNewRow
      };
      this.spreadsheet = jexcel(this.$refs.spreadsheet, options);
    },

    onChange(instance, cell, x, y, value) {
      console.log(cell);
      const row = instance.jexcel.getRowData(y);
      const recordId = row[0];
      const columnId = this.columns[x]._id;

      const record = this.records.find(r => {
        return r._id === recordId;
      });
      if (!record) {
        return;
      }
      record[columnId] = value;
      Meteor.call("databases.updateRecord", this.tableId, record);
    },

    onNewRow(instance, rowNumber, numOfRows, rowRecords, insertBefore) {
      const record = {
        tableId: this.tableId
      };
      this.columns.map(column => {
        record[column._id] = "";
      });

      Meteor.call(
        "databases.updateRecord",
        this.tableId,
        record,
        (error, result) => {
          if (error) {
            this.$store.dispatch("notifyError", error);
            return;
          }
          this.data[rowNumber + 1][0] = result._id;
          this.records.push(result);
        }
      );
    }
  }
};
</script>

<style scoped>
.project-table {
  background-color: White;
  display: flex;
  min-height: 0;
  height: 100%;
  flex-direction: column;
  position: relative;
}
.wrapper {
  flex: 1;
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