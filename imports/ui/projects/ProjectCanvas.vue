<template>
  <div class="project-canvas">
    <div v-if="!canvas">
      <v-progress-linear indeterminate></v-progress-linear>
    </div>
    <template v-if="canvas && canvas.data">
      <v-container fluid grid-list-md>
        <v-layout row wrap>
          <v-flex xs12 d-flex>
            <canvas-item title="But" headline="Quelle est l'intention à l'origine du projet ?" :item.sync="data.goal"></canvas-item>
          </v-flex>

          <v-flex xs4 d-flex>
            <canvas-item title="Budget" headline="Quelles sont les finances disponibles ?" :item.sync="data.budget"></canvas-item>
          </v-flex>
          <v-flex xs4 d-flex>
            <canvas-item title="Equipe" :item.sync="data.team"></canvas-item>
          </v-flex>
          <v-flex xs4 d-flex>
            <canvas-item title="Conditions" :item.sync="data.requirements"></canvas-item>
          </v-flex>

          <v-flex xs4 d-flex>
            <canvas-item title="Ressources" :item.sync="data.resources"></canvas-item>
          </v-flex>

          <v-flex xs4 d-flex>
            <canvas-item title="Risques & opportunités" :item.sync="data.risks"></canvas-item>
          </v-flex>

          <v-flex xs4 d-flex>
            <canvas-item title="Jalons" :item.sync="data.milestones"></canvas-item>
          </v-flex>

          <v-flex xs4 d-flex>
            <canvas-item title="Qualité" :item.sync="data.quality"></canvas-item>
          </v-flex>

          <v-flex xs4 d-flex>
            <canvas-item title="Résultats" :item.sync="data.outcome"></canvas-item>
          </v-flex>

          <v-flex xs4 d-flex>
            <canvas-item title="Clients" :item.sync="data.customers"></canvas-item>
          </v-flex>

          <v-flex xs12 class="bloc" d-flex>
            <canvas-item title="Calendrier" :item.sync="data.planning"></canvas-item>
          </v-flex>
        </v-layout>
      </v-container>
    </template>
  </div>
</template>

<script>
import { Projects } from "/imports/api/projects/projects.js";
import { Canvas } from "/imports/api/canvas/canvas.js";

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
    }
  },
  watch: {
    'canvas'() {
       if (!this.$subReady.canvas || !this.canvas) {
         return;
       }
       this.data = this.canvas.data;
    },
    data: {
      deep: true,
      handler(data) {
        Meteor.call('canvas.update', this.projectId, data);
      }
    },
  },
  data() {
    return {
      canvas: {},
      data: {},
    };
  },
  meteor: {
    // Subscriptions
    $subscribe: {
      'canvas': function() {
        return [this.projectId] 
      },
    },
    canvas() {
      return Canvas.findOne();
    }
  },  
  methods: {}
};
</script>

<style scoped>
</style>