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
                title="But"
                headline=""
                :item.sync="canvas.data.goal"
                @save="save()"
              >
                <template slot="headline">
                  Quelle est l'intention à l'origine du projet ? (cause et
                  besoin)<br>
                  Pourquoi ce projet est-il porteur de sens et important ? et
                  pour qui ? <br>
                  Comment ce projet va-t-il changer l'avenir ? et pour qui ?
                </template>
              </canvas-item>
            </v-col>

            <v-col cols="12">
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
            </v-col>
            <v-col cols="12">
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
            </v-col>
            <v-col cols="12">
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
            </v-col>

            <v-col cols="12">
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
            </v-col>

            <v-col cols="12">
              <canvas-item
                title="Risques & opportunités"
                :item.sync="canvas.data.risks"
                @save="save()"
              >
                <template slot="headline">
                  Quels sont les évenements futurs et incertains qui
                  menaceraient ou favoriseraient le projet ?<br>
                  Ils vont probablement se concrétiser,ou si vous pouvez les
                  influencer, considérez-les comme des CONDITIONS
                </template>
              </canvas-item>
            </v-col>

            <v-col cols="12">
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
            </v-col>

            <v-col cols="12">
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
            </v-col>

            <v-col cols="12">
              <canvas-item
                title="Résultats"
                :item.sync="canvas.data.outcome"
                @save="save()"
              >
                <template slot="headline">
                  Qu‘est-ce que le projet est censé livré au CLIENT ? C‘est
                  plutôt :<br>
                  ...un nouveau produit / service ?<br>
                  ...une prise de conscience ? <br>
                  ...de nouvelles connaissances ?
                </template>
              </canvas-item>
            </v-col>

            <v-col cols="12">
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
            </v-col>

            <v-col cols="12" class="bloc">
              <canvas-item
                title="Calendrier"
                :item.sync="canvas.data.planning"
                @save="save()"
              >
                <template slot="headline">
                  Quand le projet démarre-t-il réellement ? <br>
                  De quoi a-t-on besoin pour cela ? (ex : préparatifs,
                  documents, décisions)<br>
                  Quand le projet sera-t-il réellemment terminé ? <br>
                  De quoi a-t-on besoin pour cela ? (ex : documents,
                  décisions)<br>
                  Quelle souplesse a-t-on sur le déroulement au regard des dates
                  de début et de fin du projet ? <br>
                  échéances et JALONS compris ?
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
      project() {
        return [this.projectId];
      },
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
