<template>
  <div class="select-label">
    <v-dialog v-model="showDialog" max-width="420" :fullscreen="$vuetify.breakpoint.xsOnly">
      <v-card>
        <v-card-title class="headline">Sélectionner un label</v-card-title>
        <v-card-text>
          <v-list class="content">
            <template v-for="label in labels">
              <v-list-tile :key='label._id' @click="selectLabel(label)">
                <v-list-tile-avatar>
                  <v-icon :style="getColor(label)">label</v-icon>
                </v-list-tile-avatar>
                <v-list-tile-content class="pointer">
                  <v-list-tile-title>{{ label.name }}</v-list-tile-title>
                </v-list-tile-content>
              </v-list-tile>
            </template>
          </v-list>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn flat @click="showDialog = false">Annuler</v-btn>
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
      showDialog: false,
      showSelectColor: false,
      label: {},
      name: ""
    };
  },
  meteor: {
    labels() {
      return Labels.find({}, { sort: { name: 1 } });
    }
  },
  methods: {
    open() {
      this.showDialog = true;
    },

    selectLabel(label) {
      this.showDialog = false;
      this.$emit("select", label);
    },

    getColor(label) {
      return "color: " + label.color;
    }
  }
};
</script>

<style scoped>
.content {
  margin-left: 24px;
  margin-right: 24px;
  margin-bottom: 24px;
  overflow-y: scroll;
}

.color {
  width: 100%;
  height: 32px;
  margin-bottom: 24px;
  cursor: pointer;
}
</style>