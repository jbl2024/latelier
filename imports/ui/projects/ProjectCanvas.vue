<template>
  <div class="project-canvas">
    <div v-if="!isReady">
      <v-progress-linear indeterminate />
    </div>
    <div v-else class="wrapper">
      <v-toolbar dense class="flex0">
        <span class="title">{{ $t("Canvas") }}</span>
        <tooltip-button
          bottom
          icon="mdi-file-export"
          :tooltip="$t('Export')"
          @on="exportODT()"
        />
      </v-toolbar>
      <div class="flex1">
        <v-container fluid>
          <v-row>
            <v-col cols="12">
              <canvas-item
                :title="$t('canvas.goal.title')"
                headline=""
                :item.sync="canvas.data.goal"
                @save="save()"
              >
                <template slot="headline">
                  <div v-html="$t('canvas.goal.subtitle')" />
                </template>
              </canvas-item>
            </v-col>

            <v-col cols="12">
              <canvas-item
                :title="$t('canvas.budget.title')"
                headline="Quelles sont les finances disponibles ?"
                :item.sync="canvas.data.budget"
                @save="save()"
              >
                <template slot="headline">
                  <div v-html="$t('canvas.budget.subtitle')" />
                </template>
              </canvas-item>
            </v-col>
            <v-col cols="12">
              <canvas-item
                :title="$t('canvas.team.title')"
                :item.sync="canvas.data.team"
                @save="save()"
              >
                <template slot="headline">
                  <div v-html="$t('canvas.team.subtitle')" />
                </template>
              </canvas-item>
            </v-col>
            <v-col cols="12">
              <canvas-item
                :title="$t('canvas.requirements.title')"
                :item.sync="canvas.data.requirements"
                @save="save()"
              >
                <template slot="headline">
                  <div v-html="$t('canvas.requirements.subtitle')" />
                </template>
              </canvas-item>
            </v-col>

            <v-col cols="12">
              <canvas-item
                :title="$t('canvas.resources.title')"
                :item.sync="canvas.data.resources"
                @save="save()"
              >
                <template slot="headline">
                  <div v-html="$t('canvas.resources.subtitle')" />
                </template>
              </canvas-item>
            </v-col>

            <v-col cols="12">
              <canvas-item
                :title="$t('canvas.risks.title')"
                :item.sync="canvas.data.risks"
                @save="save()"
              >
                <template slot="headline">
                  <div v-html="$t('canvas.risks.subtitle')" />
                </template>
              </canvas-item>
            </v-col>

            <v-col cols="12">
              <canvas-item
                :title="$t('canvas.milestones.title')"
                :item.sync="canvas.data.milestones"
                @save="save()"
              >
                <template slot="headline">
                  <div v-html="$t('canvas.milestones.subtitle')" />
                </template>
              </canvas-item>
            </v-col>

            <v-col cols="12">
              <canvas-item
                :title="$t('canvas.quality.title')"
                :item.sync="canvas.data.quality"
                @save="save()"
              >
                <template slot="headline">
                  <div v-html="$t('canvas.quality.subtitle')" />
                </template>
              </canvas-item>
            </v-col>

            <v-col cols="12">
              <canvas-item
                :title="$t('canvas.outcome.title')"
                :item.sync="canvas.data.outcome"
                @save="save()"
              >
                <template slot="headline">
                  <div v-html="$t('canvas.outcome.subtitle')" />
                </template>
              </canvas-item>
            </v-col>

            <v-col cols="12">
              <canvas-item
                :title="$t('canvas.customers.title')"
                :item.sync="canvas.data.customers"
                @save="save()"
              >
                <template slot="headline">
                  <div v-html="$t('canvas.customers.subtitle')" />
                </template>
              </canvas-item>
            </v-col>

            <v-col cols="12" class="bloc">
              <canvas-item
                :title="$t('canvas.planning.title')"
                :item.sync="canvas.data.planning"
                @save="save()"
              >
                <template slot="headline">
                  <div v-html="$t('canvas.planning.subtitle')" />
                </template>
              </canvas-item>
            </v-col>
          </v-row>
        </v-container>
      </div>
    </div>
  </div>
</template>

<script>
import { Canvas } from "/imports/api/canvas/canvas.js";
import { saveAs } from "file-saver";
import { Projects } from "/imports/api/projects/projects.js";
import { mapState } from "vuex";

export default {
  props: {
    projectId: {
      type: String,
      default: null
    }
  },
  computed: {
    isReady() {
      return (
        this.$subReady.canvas
        && this.canvas
        && this.canvas.data
        && this.currentProject
      );
    },
    ...mapState("project", ["currentProject"])
  },
  mounted() {
    this.$store.dispatch("project/setCurrentProjectId", this.projectId);
  },
  beforeDestroy() {
    this.$store.dispatch("project/setCurrentProjectId", null);
  },
  meteor: {
    // Subscriptions
    $subscribe: {
      canvas: function () {
        return [this.projectId];
      }
    },
    canvas() {
      return Canvas.findOne();
    },
    project() {
      const project = Projects.findOne();
      if (project) {
        this.$store.dispatch("project/setCurrentProject", project);
      }
      return project;
    }
  },
  methods: {
    save() {
      Meteor.call("canvas.update", this.projectId, this.canvas.data);
    },

    exportODT() {
      Meteor.call(
        "canvas.exportODT",
        { projectId: this.projectId },
        (error, result) => {
          if (error) {
            this.$notifyError(error);
            return;
          }
          const blob = new Blob([result.data], {
            type: "application/vnd.oasis.opendocument.text"
          });
          saveAs(blob, "canvas.odt");
        }
      );
    }
  }
};
</script>

<style scoped>
.wrapper {
  display: flex;
  flex-direction: column;
  position: absolute;
  height: 100%;
  width: 100%;
}

.flex0 {
  flex: 0;
  height: 100%;
}

.flex1 {
  flex: 1; /* takes the remaining height of the "container" div */
  overflow: auto; /* to scroll just the "main" div */
}
</style>
