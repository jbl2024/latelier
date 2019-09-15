<template>
  <div class="project-databases">
    <new-database ref="newDatabase" :projectId="projectId"></new-database>
    <edit-database ref="editDatabase" :database="selectedDatabase"></edit-database>

    <div v-if="!$subReady.databases">
      <v-progress-linear indeterminate></v-progress-linear>
    </div>
    <template v-if="$subReady.databases && databases">
      <empty-state
        class="empty"
        v-if="databases.length == 0"
        illustration="data"
        :description="$t('No database yet')"
      >
        <v-btn class="info" @click="newDatabase">{{ $t('Add database') }}</v-btn>
      </empty-state>


      <v-list two-line subheader v-show="databases.length != 0" class="elevation-1">
        <v-subheader>{{ $t('Databases') }}
          <v-btn fab dark small color="pink" @click="newDatabase">
            <v-icon>mdi-plus</v-icon>
          </v-btn>
        </v-subheader>

      <template v-for="item in databases">
        <v-list-item :key="item._id" @click="openDatabase(item)">
          <v-list-item-avatar>
            <v-icon>mdi-database</v-icon>
          </v-list-item-avatar>
          <v-list-item-content class="pointer">
            <v-list-item-title>{{ item.name }}</v-list-item-title>
            <v-list-item-sub-title v-html="linkifyHtml(item.description)"></v-list-item-sub-title>
          </v-list-item-content>
          <v-list-item-action class="show-desktop">
            <v-btn icon flat color="grey darken-1" @click.stop="editDatabase(item)">
              <v-icon>mdi-settings</v-icon>
            </v-btn>
          </v-list-item-action>
          <v-list-item-action class="show-desktop">
            <v-btn icon flat color="grey darken-1" @click.stop="deleteDatabase(item)">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </v-list-item-action>
        </v-list-item>
      </template>

      </v-list>


    </template>
  </div>
</template>

<script>
import { Projects } from "/imports/api/projects/projects.js";
import { Databases } from "/imports/api/databases/databases.js";
import { Backgrounds } from '/imports/api/backgrounds/backgrounds.js'
import TextRenderingMixin from "/imports/ui/mixins/TextRenderingMixin.js";

export default {
  mixins: [TextRenderingMixin],
  mounted() {
    this.$store.dispatch("setCurrentProjectId", this.projectId);
  },
  beforeDestroy() {
    this.$store.dispatch("setCurrentProjectId", 0);
  },
  props: {
    projectId: {
      type: String,
      default: "0"
    }
  },
  i18n: {
    messages: {
      en: {
        "No database yet": "No database yet",
        "Add database": "Add database",
        "Delete database?": "Delete database?"
      },
      fr: {
        "No database yet": "Aucune base de données",
        "Add database": "Ajouter une base de données",
        "Delete database?": "Supprimer la base de données ?"
      }
    }
  },
  data() {
    return {
      selectedDatabase: null
    };
  },
  meteor: {
    // Subscriptions
    $subscribe: {
      databases: function() {
        return [this.projectId];
      }
    },
    project() {
      return Projects.findOne();
    },
    databases() {
      return Databases.find({}, { sort: { name: 1 } });
    },
    user () {
      return Meteor.user();
    }

  },
  methods: {
    newDatabase() {
      this.$refs.newDatabase.open();
    },
    editDatabase(database) {
      this.selectedDatabase = database;
      this.$refs.editDatabase.open();
    },
    deleteDatabase(database) {
      this.$confirm(this.$t("Delete database?"), {
        title: this.$t("Confirm"),
        cancelText: this.$t("Cancel"),
        confirmText: this.$t("Delete")
      }).then(res => {
        if (res) {
          Meteor.call("databases.remove", database._id);
        }
      });
    },
    openDatabase(database) {
      this.$router.push({ name: "project-database", params: {
          projectId: this.projectId,
          databaseId: database._id
        } 
      });
    }
  }
};
</script>

<style scoped>
.empty {
  margin-top: 24px;
}

.row {
  cursor: pointer;
}

</style>