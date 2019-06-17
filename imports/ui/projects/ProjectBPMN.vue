<template>
  <div class="project-bpmn">
    <new-process-diagram ref="newProcessDiagram" :projectId="projectId"></new-process-diagram>
    <edit-process-diagram ref="editProcessDiagram"></edit-process-diagram>
    <div v-if="!$subReady.processDiagrams">
      <v-progress-linear indeterminate></v-progress-linear>
    </div>
    <div v-if="$subReady.processDiagrams">
      <empty-state
        class="empty"
        v-show="processDiagrams.length == 0"
        rounded
        illustration="empty"
        :label="$t('No diagram')"
        :description="$t('You can add a new diagram')"
      >
        <v-btn class="primary" @click="newDiagram()">{{ $t('Add diagram') }}</v-btn>
      </empty-state>

      <v-list two-line subheader v-show="processDiagrams.length > 0">
        <v-subheader>
          {{ $t('Process diagrams')}}
          <v-btn fab dark small color="pink" @click="newDiagram()">
            <v-icon>add</v-icon>
          </v-btn>
        </v-subheader>
        <v-list-tile
          v-for="processDiagram in processDiagrams"
          :key="processDiagram._id"
          @click="openProcessDiagram(processDiagram)"
        >
          <v-list-tile-avatar>
            <v-icon>donut_large</v-icon>
          </v-list-tile-avatar>

          <v-list-tile-content class="pointer">
            <v-list-tile-title>{{ processDiagram.name }}</v-list-tile-title>
            <v-list-tile-sub-title>
              {{ htmlToText(processDiagram.description)}}
            </v-list-tile-sub-title>
          </v-list-tile-content>

          <v-list-tile-action>
            <v-tooltip top slot="activator">
              <v-btn
                slot="activator"
                icon
                flat
                color="grey darken-1"
                @click.stop="editProcessDiagram(processDiagram)"
              >
                <v-icon>edit</v-icon>
              </v-btn>
              <span>{{ $t('Edit') }}</span>
            </v-tooltip>
          </v-list-tile-action>
          <v-list-tile-action>
            <v-tooltip top slot="activator">
              <v-btn
                slot="activator"
                icon
                flat
                color="grey darken-1"
                @click.stop="cloneProcessDiagram(processDiagram)"
              >
                <v-icon>file_copy</v-icon>
              </v-btn>
              <span>{{ $t('Clone') }}</span>
            </v-tooltip>
          </v-list-tile-action>
          <v-list-tile-action>
            <v-tooltip top slot="activator">
              <v-btn
                slot="activator"
                icon
                flat
                color="grey darken-1"
                @click.stop="deleteProcessDiagram(processDiagram)"
              >
                <v-icon>delete</v-icon>
              </v-btn>
              <span>{{ $t('Delete') }}</span>
            </v-tooltip>
          </v-list-tile-action>
        </v-list-tile>
      </v-list>
    </div>
  </div>
</template>

<script>
import { Projects } from "/imports/api/projects/projects.js";
import { Lists } from "/imports/api/lists/lists.js";
import { Tasks } from "/imports/api/tasks/tasks.js";
import { ProcessDiagrams } from "/imports/api/bpmn/processDiagrams";
import TextRenderingMixin from "/imports/ui/mixins/TextRenderingMixin.js";
import * as htmlToText from 'html-to-text';


export default {
  mixins: [TextRenderingMixin],
  i18n: {
    messages: {
      en: {
        "Process diagrams": "Process diagrams",
        "Delete diagram?": "Delete diagram?",
        "Diagram deleted": "Diagram deleted",
        "No diagram": "No diagram",
        "You can add a new diagram": "You can add a new diagram",
        "Add diagram": "Add diagram",
        "Clone diagram?": "Clone diagram?",
        "Diagram cloned": "Diagram cloned",
      },
      fr: {
        "Process diagrams": "Diagrammes de processus",
        "Delete diagram?": "Supprimer le diagramme ?",
        "Diagram deleted": "Diagramme supprimé",
        "No diagram": "Aucun diagramme",
        "You can add a new diagram": "Vous pouvez ajouter un diagramme",
        "Add diagram": "Ajouter un diagramme",
        "Clone diagram?": "Dupliquer le diagramme ?",
        "Diagram cloned": "Diagramme dupliqué",

      }
    }
  },
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
  data() {
    return {
      modeler: null,
    };
  },
  meteor: {
    // Subscriptions
    $subscribe: {
      processDiagrams: function() {
        return [this.projectId];
      }
    },
    processDiagrams() {
      return ProcessDiagrams.find(
        {},
        {
          sort: { name: 1 }
        }
      );
    },
    project() {
      return Projects.findOne();
    }
  },
  methods: {
    newDiagram() {
      this.$refs.newProcessDiagram.open();
    },

    openProcessDiagram(processDiagram) {
      this.$router.push({
        name: "project-bpmn-process-diagram",
        params: {
          projectId: this.projectId,
          processDiagramId: processDiagram._id
        }
      });
    },

    deleteProcessDiagram(processDiagram) {
      this.$confirm(this.$t("Delete diagram?"), {
        title: processDiagram.name,
        cancelText: this.$t("Cancel"),
        confirmText: this.$t("Delete")
      }).then(res => {
        if (res) {
          Meteor.call(
            "processDiagrams.remove",
            { processDiagramId: processDiagram._id },
            (error, result) => {
              if (error) {
                this.$store.dispatch("notifyError", error);
                return;
              }
              this.$store.dispatch("notify", this.$t("Diagram deleted"));
            }
          );
        }
      });
    },

    editProcessDiagram(processDiagram) {
      this.$refs.editProcessDiagram.open(processDiagram);
    },

    cloneProcessDiagram(processDiagram) {
      this.$confirm(this.$t("Clone diagram?"), {
        title: processDiagram.name,
        cancelText: this.$t("Cancel"),
        confirmText: this.$t("Clone")
      }).then(res => {
        if (res) {
          Meteor.call(
            "processDiagrams.clone",
            { processDiagramId: processDiagram._id },
            (error, result) => {
              if (error) {
                this.$store.dispatch("notifyError", error);
                return;
              }
              this.$store.dispatch("notify", this.$t("Diagram cloned"));
            }
          );
        }
      });
    },

    htmlToText(html) {
      return htmlToText.fromString(html);
    }
  }
};
</script>

<style scoped>
.empty {
  margin-top: 24px;
}
</style>