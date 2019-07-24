<template>
  <div class="project-table elevation-1">
    <div v-if="!table">
      <v-progress-linear indeterminate></v-progress-linear>
    </div>
    <div class="wrapper">
      <slim-grid class="spreadsheet" :height="300" enable-add-row :data="records" pk="_id" :editable="true" :column-options="columns" v-if="records"></slim-grid>
    </div>
  </div>
</template>

<script>
import { Projects } from "/imports/api/projects/projects.js";
import { Tables } from "/imports/api/databases/databases.js";

import { Editors } from 'slickgrid-es6';
import SlimGrid from 'vue-slimgrid';
import "vue-slimgrid/dist/slimgrid.css"

export default {
  components: { SlimGrid },  
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
      columns: {}
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

    initializeTable() {
      this.columns = {
        tableId: {
          // hidden: true,
          editor: Editors.Text
        }
      };
      this.table.columns.map(column => {
        this.columns[column._id] = {
          name: column.name,
          editor: Editors.Text
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

.spreadsheet {
  overflow: scroll;
  /* height: 100%;
  width: 100%; */
}
</style>
