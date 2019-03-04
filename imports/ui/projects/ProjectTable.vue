<template>
  <div class="project-table elevation-1">
    <div v-if="!table">
      <v-progress-linear indeterminate></v-progress-linear>
    </div>
    <div class="wrapper">
      <div ref="hot" class="hot"></div>
    </div>
  </div>
</template>

<script>
import { Projects } from "/imports/api/projects/projects.js";
import { Tables } from "/imports/api/databases/databases.js";

import Handsontable from "handsontable";
import "handsontable/dist/handsontable.full.css";

export default {
  beforeDestroy() {
    if (this.hot) {
      this.hot.destroy();
      this.hot = null;
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
      table: null,
      hot: null
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
      const columns = [];
      const headers = [];
      this.table.columns.map(column => {
        columns.push({
          data: column._id
        });
        headers.push(column.name);
      });
      if (this.hot) {
        this.hot.destroy();
      }
      this.hot = new Handsontable(this.$refs.hot, {
        data: this.records,
        colHeaders: headers,
        rowHeaders: true,
        columns: columns,
        manualColumnResize: true,
        manualRowResize: true,  
        columnSorting: true,      
        minSpareRows: 1,
        afterChange: (changes, source) => {
          if (!changes) return;
          changes.forEach(([row, prop, oldValue, newValue]) => {
            const data = this.hot.getSourceDataAtRow(row);
            Meteor.call('databases.updateRecord', this.tableId, data);
          });
        }

      });
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

.hot {
  overflow: scroll;
  height: 100%;
  width: 100%;
}
</style>
