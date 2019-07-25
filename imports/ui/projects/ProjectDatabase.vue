<template>
  <div class="project-database elevation-1">
    <div v-if="!database">
      <v-progress-linear indeterminate></v-progress-linear>
    </div>
    <div class="header" v-if="database">
      <v-subheader>
        <router-link
          class="link"
          :to="{ name: 'project-databases', params: { projectId: projectId }}"
        >{{ $t('Databases') }}</router-link>
        &nbsp; > {{ database.name}}
      </v-subheader>
    </div>

    <v-tabs v-model="active" >
      <v-tab v-for="table in tables" :key="table._id" ripple>{{ table.name }}</v-tab>
      <v-tab-item v-for="table in tables" :key="table._id">
        <div class="tab-wrapper">
          <project-table :tableId="table._id"></project-table>
        </div>
      </v-tab-item>
    </v-tabs>
  </div>
</template>

<script>
import { Projects } from "/imports/api/projects/projects.js";
import { Databases } from "/imports/api/databases/databases.js";
import { Tables } from "/imports/api/databases/databases.js";

import ProjectTable from "/imports/ui/projects/ProjectTable.vue";

export default {
  components: {
    ProjectTable
  },
  mounted() {
    this.$store.dispatch("setCurrentProjectId", this.projectId);
  },
  beforeDestroy() {
    this.$store.dispatch("setCurrentProjectId", 0);
    if (this.hot) {
      this.hot.destroy();
      this.hot = null;
    }
  },
  props: {
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
      database: null,
      tables: null,
      active: null
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
      Meteor.call("databases.findOne", databaseId, (error, result) => {
        if (error) {
          this.$store.dispatch("notifyError", error);
          return;
        }
        this.database = result;
        if (this.database) {
          this.loadTables(this.database);
        }
      });
    },
    loadTables(database) {
      Meteor.call("databases.loadTables", database._id, (error, result) => {
        if (error) {
          this.$store.dispatch("notifyError", error);
          return;
        }
        this.tables = result.data;
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
  min-height: 0;
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

.link {
  text-decoration: none;
}

.tab-wrapper {
  height: 400px;

}

</style>

