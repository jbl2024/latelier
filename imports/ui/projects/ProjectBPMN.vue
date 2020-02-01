<template>
  <div class="project-bpmn">
    <new-process-diagram ref="newProcessDiagram" :project-id="projectId" />
    <edit-process-diagram ref="editProcessDiagram" />
    <div v-if="!$subReady.processDiagrams">
      <v-progress-linear indeterminate />
    </div>
    <div v-if="$subReady.processDiagrams">
      <empty-state
        v-show="processDiagrams.length == 0"
        class="empty"
        rounded
        illustration="empty"
        :label="$t('No diagram')"
        :description="$t('You can add a new diagram')"
      >
        <v-btn class="primary" @click="newDiagram()">
          {{ $t("Add diagram") }}
        </v-btn>
      </empty-state>

      <v-list v-show="processDiagrams.length > 0" two-line subheader class="list">
        <v-subheader>
          {{ $t("Process diagrams") }}
          <v-btn icon dark small color="primary" @click="newDiagram()">
            <v-icon>mdi-plus</v-icon>
          </v-btn>
        </v-subheader>
        <v-list-item
          v-for="processDiagram in processDiagrams"
          :key="processDiagram._id"
          @click="openProcessDiagram(processDiagram)"
        >
          <v-list-item-avatar>
            <v-icon color="teal">
              mdi-chart-donut
            </v-icon>
          </v-list-item-avatar>

          <v-list-item-content class="pointer">
            <v-list-item-title>{{ processDiagram.name }}</v-list-item-title>
            <v-list-item-subtitle>
              {{ htmlToText(processDiagram.description) }}
            </v-list-item-subtitle>
          </v-list-item-content>

          <v-list-item-action>
            <v-menu bottom left class="menu">
              <template v-slot:activator="{ on }">
                <v-btn
                  icon
                  text
                  color="grey darken-1"
                  v-on="on"
                  @click.native.stop
                >
                  <v-icon>mdi-dots-vertical</v-icon>
                </v-btn>
              </template>
              <v-list dense>
                <v-list-item @click="editProcessDiagram(processDiagram)">
                  <v-list-item-icon>
                    <v-icon>mdi-pencil</v-icon>
                  </v-list-item-icon>
                  <v-list-item-title>
                    {{ $t("Edit") }}
                  </v-list-item-title>
                </v-list-item>
                <v-list-item @click="cloneProcessDiagram(processDiagram)">
                  <v-list-item-icon>
                    <v-icon>mdi-content-copy</v-icon>
                  </v-list-item-icon>
                  <v-list-item-title>
                    {{ $t("Clone") }}
                  </v-list-item-title>
                </v-list-item>
                <v-list-item @click="deleteProcessDiagram(processDiagram)">
                  <v-list-item-icon>
                    <v-icon>mdi-delete</v-icon>
                  </v-list-item-icon>
                  <v-list-item-title>
                    {{ $t("Delete") }}
                  </v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </v-list-item-action>
        </v-list-item>
      </v-list>
    </div>
  </div>
</template>

<script>
import { Projects } from "/imports/api/projects/projects.js";
import { ProcessDiagrams } from "/imports/api/bpmn/processDiagrams";
import EditProcessDiagram from "/imports/ui/bpmn/EditProcessDiagram.vue";
import NewProcessDiagram from "/imports/ui/bpmn/NewProcessDiagram.vue";

import TextRenderingMixin from "/imports/ui/mixins/TextRenderingMixin.js";
import * as htmlToText from "html-to-text";

export default {
  components: {
    EditProcessDiagram,
    NewProcessDiagram
  },
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
        "Diagram cloned": "Diagram cloned"
      },
      fr: {
        "Process diagrams": "Diagrammes de processus",
        "Delete diagram?": "Supprimer le diagramme ?",
        "Diagram deleted": "Diagramme supprimé",
        "No diagram": "Aucun diagramme",
        "You can add a new diagram": "Vous pouvez ajouter un diagramme",
        "Add diagram": "Ajouter un diagramme",
        "Clone diagram?": "Dupliquer le diagramme ?",
        "Diagram cloned": "Diagramme dupliqué"
      }
    }
  },
  props: {
    projectId: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      modeler: null
    };
  },
  mounted() {
    this.$store.dispatch("setCurrentProjectId", this.projectId);
  },
  beforeDestroy() {
    this.$store.dispatch("setCurrentProjectId", null);
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
      }).then((res) => {
        if (res) {
          Meteor.call(
            "processDiagrams.remove",
            { processDiagramId: processDiagram._id },
            (error) => {
              if (error) {
                this.$notifyError(error);
                return;
              }
              this.$notify(this.$t("Diagram deleted"));
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
      }).then((res) => {
        if (res) {
          Meteor.call(
            "processDiagrams.clone",
            { processDiagramId: processDiagram._id },
            (error) => {
              if (error) {
                this.$notifyError(error);
                return;
              }
              this.$notify(this.$t("Diagram cloned"));
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

.list {
  max-width: 800px;
  margin: 0 auto;
  margin-top: 24px;
}
</style>
