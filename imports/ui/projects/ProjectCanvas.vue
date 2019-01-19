<template>
  <div class="project-canvas">
    <div v-if="!$subReady.project">
      <v-progress-linear indeterminate></v-progress-linear>
    </div>
    <template v-if="$subReady.project">
      <v-container fluid grid-list-md>
        <v-layout row wrap>
          <v-flex xs12 d-flex>
            <v-card>
              <v-card-title primary-title>
                <div>
                  <div class="headline">But</div>
                  <span>Quelle est l'intention à l'origine du projet ?</span>
                </div>
              </v-card-title>
              <v-card-text>...</v-card-text>
            </v-card>
          </v-flex>

          <v-flex d-flex xs4>
            <v-layout row wrap class="bloc">
              <v-flex xs4>
                <v-card>
                  <v-card-title primary-title>
                    <div>
                      <div class="headline">Budget</div>
                      <span>Quelle sont les finances disponibles ?</span>
                    </div>
                  </v-card-title>
                  <v-card-text>...</v-card-text>
                </v-card>
              </v-flex>
              <v-flex xs4>EQUIPE</v-flex>
              <v-flex xs4>CONDITIONS</v-flex>
              <v-flex xs8>RESSOURCES</v-flex>
              <v-flex xs4>RISQUES & OPPORTUNITES</v-flex>
            </v-layout>
          </v-flex>

          <v-flex d-flex xs4>JALONS</v-flex>

          <v-flex d-flex xs4>
            <v-layout row wrap class="bloc">
              <v-flex xs12>QUALITE</v-flex>
              <v-flex xs6>RESULTATS</v-flex>
              <v-flex xs6>CLIENTS</v-flex>
            </v-layout>
          </v-flex>
          <v-flex xs12 class="bloc" d-flex>CALENDRIER</v-flex>
        </v-layout>
      </v-container>
    </template>
  </div>
</template>

<script>
import { Projects } from "/imports/api/projects/projects.js";

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
  data() {
    return {};
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
    }
  },
  methods: {}
};
</script>

<style scoped>
.bloc {
  border: 2px solid black;
  background-color: #eee;
  min-height: 200px;
}
.bloc-red {
  border: 2px solid red;
}
</style>