<template>
  <div class="new-project">
    <v-dialog v-model="showDialog" max-width="420" :fullscreen="$vuetify.breakpoint.xsOnly">
      <v-card>
        <v-card-title class="headline">Nouveau projet</v-card-title>
        <v-card-text>
          <v-form v-model="valid" v-on:submit.prevent>
            <v-text-field v-model="name" :rules="nameRules" label="Nom" v-on:keyup.enter="create()" required></v-text-field>
            <v-radio-group v-model="projectType">
              <v-radio label="Vide" value="none"></v-radio>
              <v-radio label="Kanban" value="kanban"></v-radio>
              <v-radio label="Personnes" value="people"></v-radio>
            </v-radio-group>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn flat @click="showDialog = false">Annuler</v-btn>
          <v-btn color="info" @click="create" :disabled="!valid">Créer</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { Meteor } from "meteor/meteor";
import { Projects } from "/imports/api/projects/projects.js";

export default {
  props: {
    organizationId: {
      type: String,
      defaultValue: "0"
    }
  },
  data() {
    return {
      showDialog: false,
      projectType: "none",
      valid: false,
      name: "",
      nameRules: [
        v => !!v || "Le nom est obligatoire",
        v => v.length > 1 || "Le nom est trop court"
      ]
    };
  },
  methods: {
    open() {
      this.showDialog = true;
    },
    create() {
      Meteor.call(
        "projects.create",
        this.organizationId,
        this.name,
        this.projectType,
        this.$store.state.selectedGroup._id,
        (error, result) => {
          if (error) {
            console.log(error);
            return;
          }
          this.$router.push({
            name: "project-settings",
            params: { organizationId: this.organizationId, projectId: result }
          });
        }
      );
      this.showDialog = false;
    }
  }
};
</script>

<style scoped>
.content {
  margin-left: 24px;
  margin-right: 24px;
}
</style>