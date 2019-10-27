<template>
  <div class="project-canvas">
    <div v-if="!canvas">
      <v-progress-linear indeterminate />
    </div>
    <template v-if="$subReady.canvas && canvas && canvas.data">
      <v-container fluid grid-list-md>
        <v-layout row wrap>
          <v-flex xs12>
            <canvas-item
              flex-grow-1
              title="But"
              headline=""
              :item.sync="canvas.data.goal"
              @save="save()"
            >
              <template slot="headline">
                Quelle est l'intention à l'origine du projet ? (cause et
                besoin)<br>
                Pourquoi ce projet est-il porteur de sens et important ? et pour
                qui ? <br>
                Comment ce projet va-t-il changer l'avenir ? et pour qui ?
              </template>
            </canvas-item>
          </v-flex>

          <v-flex xs12 sm4>
            <canvas-item
              title="Budget"
              headline="Quelles sont les finances disponibles ?"
              :item.sync="canvas.data.budget"
              @save="save()"
            >
              <template slot="headline">
                Quelles sont les finances nécessaires ? disponibles ? <br>
                ...pour L‘ÉQUIPE (interne / externe)<br>
                ...pour les RESSOURCES
              </template>
            </canvas-item>
          </v-flex>
          <v-flex xs12 sm4>
            <canvas-item
              title="Equipe"
              :item.sync="canvas.data.team"
              @save="save()"
            >
              <template slot="headline">
                Qui est / devrait en faire partie ?<br>
                ...du noyau de l‘équipe<br>
                ...de l‘équipe étendue<br>
                ...en tant que partenaires externes<br>
                ...en tant que chef de projet / manager
              </template>
            </canvas-item>
          </v-flex>
          <v-flex xs12 sm4>
            <canvas-item
              title="Conditions"
              :item.sync="canvas.data.requirements"
              @save="save()"
            >
              <template slot="headline">
                Forces, faits, événements et personnes connues qui influencent
                le projet ?<br>
                ...Qui ou quoi soutient le projet ?<br>
                ...Qui ou quoi gênent le projet ?
              </template>
            </canvas-item>
          </v-flex>

          <v-flex xs12 sm4>
            <canvas-item
              title="Ressources"
              :item.sync="canvas.data.resources"
              @save="save()"
            >
              <template slot="headline">
                Quelles sont les ressources nécessaires ? <br>
                ...un espace projet<br>
                ...des salles de réunions (sur site, à l‘extérieur)<br>
                ...des outils (logiciels inclus) et des matériels
              </template>
            </canvas-item>
          </v-flex>

          <v-flex xs12 sm4>
            <canvas-item
              title="Risques & opportunités"
              :item.sync="canvas.data.risks"
              @save="save()"
            >
              <template slot="headline">
                Quels sont les évenements futurs et incertains qui menaceraient
                ou favoriseraient le projet ?<br>
                Ils vont probablement se concrétiser,ou si vous pouvez les
                influencer, considérez-les comme des CONDITIONS
              </template>
            </canvas-item>
          </v-flex>

          <v-flex xs12 sm4>
            <canvas-item
              title="Jalons"
              :item.sync="canvas.data.milestones"
              @save="save()"
            >
              <template slot="headline">
                Quelles sont les étapes clés de progression ?<br>
                Les échéances pour :<br>
                ...les résultats intermédiaires<br>
                ...les décisions cruciales<br>
                ...les résultats visibles et mesurables
              </template>
            </canvas-item>
          </v-flex>

          <v-flex xs12 sm4>
            <canvas-item
              title="Qualité"
              :item.sync="canvas.data.quality"
              @save="save()"
            >
              <template slot="headline">
                Qu‘est ce qui rend le CLIENT vraiment heureux au regard :<br>
                ...du RÉSULTAT du projet ?<br>
                ...des JALONS pour atteindre le résultat ?<br>
                ...de la manière d‘être informé / impliqué pendant le projet ?
              </template>
            </canvas-item>
          </v-flex>

          <v-flex xs12 sm4>
            <canvas-item
              title="Résultats"
              :item.sync="canvas.data.outcome"
              @save="save()"
            >
              <template slot="headline">
                Qu‘est-ce que le projet est censé livré au CLIENT ? C‘est plutôt
                :<br>
                ...un nouveau produit / service ?<br>
                ...une prise de conscience ? <br>
                ...de nouvelles connaissances ?
              </template>
            </canvas-item>
          </v-flex>

          <v-flex xs12 sm4>
            <canvas-item
              title="Clients"
              :item.sync="canvas.data.customers"
              @save="save()"
            >
              <template slot="headline">
                Qui est vraiment le client ? Des personnes qui :<br>
                ...payent pour le projet (SPONSOR) <br>
                ...démarrent & arrêtent le projet (PROPRIÉTAIRE)<br>
                ...sont impactées par les résultats (DESTINATAIRES)<br>
                S‘il y a plusieurs clients : Y a-t-il des conflits déclarés ?
              </template>
            </canvas-item>
          </v-flex>

          <v-flex xs12 class="bloc">
            <canvas-item
              title="Calendrier"
              :item.sync="canvas.data.planning"
              @save="save()"
            >
              <template slot="headline">
                Quand le projet démarre-t-il réellement ? <br>
                De quoi a-t-on besoin pour cela ? (ex : préparatifs, documents,
                décisions)<br>
                Quand le projet sera-t-il réellemment terminé ? <br>
                De quoi a-t-on besoin pour cela ? (ex : documents, décisions)<br>
                Quelle souplesse a-t-on sur le déroulement au regard des dates
                de début et de fin du projet ? <br>
                échéances et JALONS compris ?
              </template>
            </canvas-item>
          </v-flex>
        </v-layout>
      </v-container>
    </template>
  </div>
</template>

<script>
import { Canvas } from "/imports/api/canvas/canvas.js";

export default {
  props: {
    projectId: {
      type: String,
      default: "0"
    }
  },
  mounted() {
    this.$store.dispatch("setCurrentProjectId", this.projectId);
  },
  beforeDestroy() {
    this.$store.dispatch("setCurrentProjectId", 0);
  },
  meteor: {
    // Subscriptions
    $subscribe: {
      canvas: function() {
        return [this.projectId];
      }
    },
    canvas() {
      return Canvas.findOne();
    }
  },
  methods: {
    save() {
      Meteor.call("canvas.update", this.projectId, this.canvas.data);
    }
  }
};
</script>

<style scoped></style>
