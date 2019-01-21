<template>
  <div class="project-canvas">
    <div v-if="!canvas">
      <v-progress-linear indeterminate></v-progress-linear>
    </div>
    <template v-if="canvas && canvas.data">
      <v-container fluid grid-list-md>
        <v-layout row wrap>
          <v-flex xs12 d-flex>
            <canvas-item title="But" headline="Quelle est l'intention à l'origine du projet ?" :item.sync="goal"></canvas-item>
          </v-flex>

          <v-flex xs4 d-flex>
            <canvas-item title="Budget" headline="Quelles sont les finances disponibles ?"></canvas-item>
          </v-flex>
          <v-flex xs4 d-flex>
            <canvas-item title="Equipe"></canvas-item>
          </v-flex>
          <v-flex xs4 d-flex>
            <canvas-item title="Conditions"></canvas-item>
          </v-flex>

          <v-flex xs4 d-flex>
            <canvas-item title="Ressources"></canvas-item>
          </v-flex>

          <v-flex xs4 d-flex>
            <canvas-item title="Risques & opportunités"></canvas-item>
          </v-flex>

          <v-flex xs4 d-flex>
            <canvas-item title="Jalons"></canvas-item>
          </v-flex>

          <v-flex xs4 d-flex>
            <canvas-item title="Qualité"></canvas-item>
          </v-flex>

          <v-flex xs4 d-flex>
            <canvas-item title="Résultats"></canvas-item>
          </v-flex>

          <v-flex xs4 d-flex>
            <canvas-item title="Clients"></canvas-item>
          </v-flex>

          <v-flex xs12 class="bloc" d-flex>
            <canvas-item title="Calendrier"></canvas-item>
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
       if (!this.$subReady.canvas) {
         return;
       }
       this.goal = this.canvas.data.goal || "";
    },
    goal(goal) {
      Meteor.call('canvas.update', this.projectId, {goal: goal});
    }
  },
  data() {
    return {
      canvas: {},
      goal: "",
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