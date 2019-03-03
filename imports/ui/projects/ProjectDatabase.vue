<template>
  <div class="project-database elevation-1">
    <div v-if="!database">
      <v-progress-linear indeterminate></v-progress-linear>
    </div>
    <div class="header" v-if="database">
        <v-subheader>
          <router-link class="link" :to="{ name: 'project-databases', params: { organizationId: organizationId, projectId: projectId }}">
            {{ $t('Databases') }}
          </router-link>&nbsp; > {{ database.name}}
          <v-btn fab dark small color="pink" @click="newColumn">
            <v-icon>add</v-icon>
          </v-btn>
        </v-subheader>
    </div>

    <div class="wrapper">
      <div ref="hot" class="hot"></div>
    </div>
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
    if (this.hot) {
      this.hot.destroy();
      this.hot = null;
    }
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
  watch: {
    databaseId: {
      immediate: true,
      handler(id) {
        if (id && id !== "0") {
          this.loadDatabase(id);
        }
      }
    }
  },
  data() {
    return {
      records: null,
      database: null,
      hot: null
    };
  },
  meteor: {
    // Subscriptions
    $subscribe: {
      project: function() {
        return [this.projectId];
      }
    },
    project() {
      return Projects.findOne();
    },
    user() {
      return Meteor.user();
    }
  },
  methods: {
    loadDatabase(databaseId) {
      Meteor.call('databases.findOne', databaseId, (error, result) => {
        if (error) {
          this.$store.dispatch("notifyError", error);
          return;
        }
        this.database = result;
        if (this.database) {
          this.loadRecords(this.database);
        }
      })
    },
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

    newColumn() {

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
  /* padding: 12px; */
  display: flex;
  min-height:0;
  height: 100%;
  flex-direction: column;
  position: relative;
}


h1 {
  font-size: 16px;
  margin-bottom: 24px;
}

.header {
  margin-bottom: 8px;
}

.wrapper {
  flex:1;
  overflow-y: scroll;
  position: relative;
  display: flex;
  min-height: 0;
}

.link {
  text-decoration: none;
}

.hot {
  overflow: scroll;
  height: 100%;
  width: 100%;
  margin-left: 12px;
}
</style>
