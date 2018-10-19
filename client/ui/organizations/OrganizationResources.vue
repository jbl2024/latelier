
<template>
  <div class="organization-resources">
    <new-resource ref="newResource" :organizationId="organization._id"></new-resource>
    <edit-resource ref="editResource"></edit-resource>

    <md-dialog-confirm :md-active.sync="showConfirmDialog" md-title="Confirmer la suppression ?" md-content="La ressource sera définitivement supprimé" md-confirm-text="Supprimer" md-cancel-text="Annuler" @md-cancel="onCancelDeleteResource" @md-confirm="onConfirmDeleteResource" />

    <div v-if="!$subReady.resources">
      <v-progress-linear indeterminate></v-progress-linear>
    </div>

    <div v-if="$subReady.resources">

      <empty-state v-if="resources.length == 0" rounded icon="category" :description="`Aucune ressource définie`">
        <v-btn class="info" @click="newResource">Ajouter une ressource</v-btn>
      </empty-state>

      <div class="elevation-1">
        <v-list two-line v-show="resources.length != 0">
          <v-subheader>Ressources
            <v-btn flat icon @click="newResource">
              <v-icon>add</v-icon>
            </v-btn>
          </v-subheader>

          <template v-for="(item, index) in resources">
            <v-list-tile :key='item._id' avatar>
              <v-list-tile-avatar>
                <v-icon>category</v-icon>
              </v-list-tile-avatar>

              <v-list-tile-content>
                <v-list-tile-title>{{ item.name }}</v-list-tile-title>
                <v-list-tile-sub-title>{{ item.description }}</v-list-tile-sub-title>
              </v-list-tile-content>

              <v-list-tile-action>
                <v-btn icon ripple @click.stop="editResource(item._id)">
                  <v-icon>edit</v-icon>
                </v-btn>
              </v-list-tile-action>
              <v-list-tile-action>
                <v-btn icon ripple @click.stop="deleteResource(item._id)">
                  <v-icon>delete</v-icon>
                </v-btn>
              </v-list-tile-action>

            </v-list-tile>
            <v-divider inset v-if="index != resources.length - 1"></v-divider>
          </template>
        </v-list>
      </div>

      <div class="absolute-right">
        <md-button class="md-fab" @click="newResource">
          <md-icon>add</md-icon>
          <md-tooltip md-delay="300">Ajouter une ressource</md-tooltip>
        </md-button>
      </div>

    </div>
  </div>
</template>

<script>
import { Organizations } from "/imports/api/organizations/organizations.js";
import { Resources } from "/imports/api/resources/resources.js";

export default {
  name: "organization-resources",
  props: {
    organization: {
      type: Object,
      default: {}
    }
  },
  data() {
    return {
      showConfirmDialog: false
    };
  },
  methods: {
    newResource() {
      this.$refs.newResource.open();
    },
    editResource(resourceId) {
      this.$refs.editResource.open(resourceId);
    },
    deleteResource(resourceId) {
      this.resourceId = resourceId;
      this.showConfirmDialog = true;
    },

    onConfirmDeleteResource() {
      this.showConfirmDialog = false;
      Meteor.call("resources.remove", this.resourceId);
    },

    onCancelDeleteResource() {
      this.showConfirmDialog = false;
    }
  },
  meteor: {
    // Subscriptions
    $subscribe: {
      resources: function() {
        return [this.organization._id];
      }
    },
    resources() {
      return Resources.find({}, { sort: { name: 1 } });
    }
  }
};
</script>

<style scoped>
@media (min-width: 601px) {
  .fap-list {
    margin-right: 92px;
    margin-left: 48px;
  }
}

@media (max-width: 600px) {
  .fap-list {
    margin-right: auto;
    margin-left: auto;
  }
}
</style>