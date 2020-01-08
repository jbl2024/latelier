<template>
  <div class="project-mindmaps">
    <new-mindmap
      ref="newMindmap"
      :project-id="projectId"
    />
    <edit-mindmap ref="editMindmap" />
    <div v-if="!$subReady.mindmaps">
      <v-progress-linear indeterminate />
    </div>
    <div v-if="$subReady.mindmaps">
      <empty-state
        v-show="mindmaps.length == 0"
        class="empty"
        rounded
        illustration="empty"
        :label="$t('No diagram')"
        :description="$t('You can add a new diagram')"
      >
        <v-btn class="primary" @click="newMindmap()">
          {{ $t("Add diagram") }}
        </v-btn>
      </empty-state>

      <v-list v-show="mindmaps.length > 0" two-line subheader>
        <v-subheader>
          {{ $t("Process diagrams") }}
          <v-btn icon dark small color="primary" @click="newMindmap()">
            <v-icon>mdi-plus</v-icon>
          </v-btn>
        </v-subheader>
        <v-list-item
          v-for="mindmap in mindmaps"
          :key="mindmap._id"
          @click="openMindmap(mindmap)"
        >
          <v-list-item-avatar>
            <v-icon>mdi-chart-donut</v-icon>
          </v-list-item-avatar>

          <v-list-item-content class="pointer">
            <v-list-item-title>{{ mindmap.name }}</v-list-item-title>
            <v-list-item-subtitle>
              {{ htmlToText(mindmap.description) }}
            </v-list-item-subtitle>
          </v-list-item-content>

          <v-list-item-action>
            <v-tooltip top>
              <template v-slot:activator="{ on }">
                <v-btn
                  icon
                  text
                  color="grey darken-1"
                  v-on="on"
                  @click.stop="editMindmap(mindmap)"
                >
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
              </template>
              <span>{{ $t("Edit") }}</span>
            </v-tooltip>
          </v-list-item-action>
          <v-list-item-action>
            <v-tooltip top>
              <template v-slot:activator="{ on }">
                <v-btn
                  icon
                  text
                  color="grey darken-1"
                  v-on="on"
                  @click.stop="cloneMindmap(mindmap)"
                >
                  <v-icon>mdi-content-copy</v-icon>
                </v-btn>
              </template>
              <span>{{ $t("Clone") }}</span>
            </v-tooltip>
          </v-list-item-action>
          <v-list-item-action>
            <v-tooltip top>
              <template v-slot:activator="{ on }">
                <v-btn
                  icon
                  text
                  color="grey darken-1"
                  v-on="on"
                  @click.stop="deleteMindmap(mindmap)"
                >
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </template>
              <span>{{ $t("Delete") }}</span>
            </v-tooltip>
          </v-list-item-action>
        </v-list-item>
      </v-list>
    </div>
  </div>
</template>

<script>
import { Projects } from "/imports/api/projects/projects";
import { Mindmaps } from "/imports/api/mindmaps/mindmaps";
import EditMindmap from "/imports/ui/mindmaps/EditMindmap";
import NewMindmap from "/imports/ui/mindmaps/NewMindmap";

import TextRenderingMixin from "/imports/ui/mixins/TextRenderingMixin.js";
import * as htmlToText from "html-to-text";

export default {
  components: {
    EditMindmap,
    NewMindmap
  },
  mixins: [TextRenderingMixin],
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
      mindmaps: function() {
        return [this.projectId];
      }
    },
    mindmaps() {
      return Mindmaps.find(
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
    newMindmap() {
      this.$refs.newMindmap.open();
    },

    openMindmap(mindmap) {
      this.$router.push({
        name: "project-mindmap",
        params: {
          projectId: this.projectId,
          mindmapId: mindmap._id
        }
      });
    },

    deleteMindmap(processDiagram) {
      this.$confirm(this.$t("Delete diagram?"), {
        title: processDiagram.name,
        cancelText: this.$t("Cancel"),
        confirmText: this.$t("Delete")
      }).then((res) => {
        if (res) {
          Meteor.call(
            "projectMindmap.remove",
            { processDiagramId: processDiagram._id },
            (error) => {
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

    editMindmap(processDiagram) {
      this.$refs.editMindmap.open(processDiagram);
    },

    cloneMindmap(processDiagram) {
      this.$confirm(this.$t("Clone diagram?"), {
        title: processDiagram.name,
        cancelText: this.$t("Cancel"),
        confirmText: this.$t("Clone")
      }).then((res) => {
        if (res) {
          Meteor.call(
            "projectMindmap.clone",
            { processDiagramId: processDiagram._id },
            (error) => {
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
