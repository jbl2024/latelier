<template>
  <div class="select-label">
    <v-dialog v-model="showDialog" max-width="420" :fullscreen="$vuetify.breakpoint.xsOnly">
      <new-label ref="newLabel" :projectId="projectId"></new-label>  
      <v-card>
        <v-card-title class="headline">{{ $t('Add label') }}</v-card-title>
        <v-divider></v-divider>
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
            <v-list-tile @click="$refs.newLabel.open()">
              <v-list-tile-avatar >
                <v-icon>label</v-icon>
              </v-list-tile-avatar>
              <v-list-tile-content class="cursor">
                <v-list-tile-title>Créer...</v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>

          </v-list>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn flat @click="showDialog = false">{{ this.$t('Cancel') }}</v-btn>
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
    labelId: String,
    projectId: String
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
    labels: {
      params () {
        return {
          projectId: this.projectId
        };
      },
      update ({projectId}) {
        return Labels.find({projectId: projectId}, { sort: { name: 1 } });
      }
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
  overflow-y: scroll;
  max-height: 400px;
}

.color {
  width: 100%;
  height: 32px;
  margin-bottom: 24px;
  cursor: pointer;
}
</style>