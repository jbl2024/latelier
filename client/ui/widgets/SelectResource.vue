<template>
  <div class="select-resource">

    <v-dialog v-model="showDialog" max-width="420" :fullscreen="$vuetify.breakpoint.xsOnly">
      <v-card>
        <v-card-title class="headline">Sélectionner une ressource</v-card-title>
        <v-card-text>
          <v-list two-line class="content">
            <template v-for="resource in resources">
              <v-list-tile :key='resource._id' @click="selectResource(resource)">
                <v-list-tile-avatar>
                  <v-icon>category</v-icon>
                </v-list-tile-avatar>
                <v-list-tile-content class="pointer">
                  <v-list-tile-title>{{ resource.name }}</v-list-tile-title>
                  <v-list-tile-sub-title>{{ resource.description }}</v-list-tile-sub-title>
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
import { Resources } from "/imports/api/resources/resources.js";

export default {
  props: {
    resourceId: String
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
    resources() {
      return Resources.find({}, { sort: { name: 1 } });
    }
  },
  methods: {
    open() {
      this.showDialog = true;
    },

    selectResource(resource) {
      this.showDialog = false;
      this.$emit("select", resource);
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