<template>
  <div class="project-database elevation-1">
    <div v-if="!$subReady.database">
      <v-progress-linear indeterminate></v-progress-linear>
    </div>
    <template v-if="$subReady.database">
      <h1>{{ database.name}}</h1>
    </template>
    <div ref="hot"></div>
  </div>
</template>

<script>
import { Projects } from "/imports/api/projects/projects.js";
import { Databases } from "/imports/api/databases/databases.js";

import Handsontable from "handsontable";
import "handsontable/dist/handsontable.full.css";

export default {
  mounted() {
    this.$store.dispatch("setCurrentProjectId", this.projectId);
    this.$store.dispatch("setCurrentOrganizationId", this.organizationId);
  },
  beforeDestroy() {
    this.$store.dispatch("setCurrentProjectId", 0);
    this.$store.dispatch("setCurrentOrganizationId", 0);
  },
  props: {
    organizationId: {
      type: String,
      default: "0"
    },
    projectId: {
      type: String,
      default: "0"
    },
    databaseId: {
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
  data() {
    return {
      records: null,
      databaseLoaded: false
    };
  },
  meteor: {
    // Subscriptions
    $subscribe: {
      database: function() {
        return [this.databaseId];
      }
    },
    project() {
      return Projects.findOne();
    },
    database() {
      const database = Databases.findOne();
      if (database && !this.databaseLoaded) {
        this.loadRecords(database);
        this.databaseLoaded = true;
      }
      return database;
    },
    user() {
      return Meteor.user();
    }
  },
  methods: {
    loadRecords(database) {
      Meteor.call("databases.loadRecords", database._id, (error, result) => {
        if (error) {
          this.$store.dispatch("notifyError", error);
          return;
        }
        this.records = result.data;
        this.initializeTable();
      });
    },

    initializeTable() {
      const columns = [];
      const headers = [];
      this.database.columns.map(column => {
        columns.push({
          data: column._id
        });
        headers.push(column.name);
      });
      const hot = new Handsontable(this.$refs.hot, {
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
            const data = hot.getSourceDataAtRow(row);
            Meteor.call('databases.updateRecord', this.databaseId, data);
          });
        }

      });
    }
  }
};
</script>

<style scoped>
.project-database {
  background-color: White;
  margin: 24px;
  padding: 12px;
}

h1 {
  font-size: 16px;
  margin-bottom: 24px;
}
</style>
