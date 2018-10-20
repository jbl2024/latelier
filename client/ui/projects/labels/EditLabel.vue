<template>
  <div class="edit-label">
    <v-dialog v-model="showDialog" max-width="420" :fullscreen="$vuetify.breakpoint.xsOnly">
      <select-color @select="onSelectColor" :active.sync="showSelectColor"></select-color>
      <v-card>
        <v-card-title class="headline">Editer le label</v-card-title>
        <v-card-text>
          <v-form v-model="valid">
            <v-text-field v-model="label.name" v-focus :rules="nameRules" label="Nom" required v-on:keyup.enter="updateNameAndColor()"></v-text-field>
            <v-btn color="primary" @click="showSelectColor = true" class="btn-color">
              Choisir une couleur
            </v-btn>
            <div class="color" ref="color" :style="getColor(label)" @click="showSelectColor = true"></div>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn flat @click="showDialog = false">Annuler</v-btn>
          <v-btn color="error" @click="remove">Supprimer</v-btn>
          <v-btn color="primary" @click="updateNameAndColor" :disabled="!valid">Modifier</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { Meteor } from "meteor/meteor";
import { Labels } from "/imports/api/labels/labels.js";

export default {
  props: {
    labelId: String
  },
  data() {
    return {
      valid: false,
      showDialog: false,
      showSelectColor: false,
      label: {},
      name: "",
      nameRules: [
        v => !!v || "Le nom est obligatoire",
        v => (v && v.length > 1) || "Le nom est trop court"
      ]
    };
  },
  meteor: {
    label: {
      params() {
        return {
          id: this.labelId
        };
      },
      deep: false,
      update({ id }) {
        return Labels.findOne({ _id: id }) || {};
      }
    }
  },
  methods: {
    open() {
      this.showDialog = true;
    },

    updateNameAndColor() {
      Meteor.call(
        "labels.updateNameAndColor",
        this.label._id,
        this.label.name,
        this.label.color,
        (error, result) => {
          if (error) {
            console.log(error);
            return;
          }
          this.showDialog = false;
        }
      );
    },

    remove() {
      if (confirm("Voulez-vous supprimer définitivement ce label ?")) {
        Meteor.call("labels.remove", this.label._id, (error, result) => {
          if (error) {
            console.log(error);
            return;
          }
          this.showDialog = false;
        });
      }
    },

    getColor(label) {
      return "background-color: " + label.color;
    },

    onSelectColor(color) {
      var hex = color.hex || "white";
      this.$refs.color.style.backgroundColor = hex;
      this.label.color = hex;
    }
  }
};
</script>

<style scoped>
.content {
  margin-left: 24px;
  margin-right: 24px;
}

.color {
  width: 100%;
  height: 32px;
  margin-bottom: 24px;
  cursor: pointer;
}

.btn-color {
  margin-left: 0;
  width: 100%;
}

</style>