
<template>
  <div class="organization-resources">
    <new-resource ref="newResource" :organizationId="organization._id"></new-resource>
    <edit-resource ref="editResource"></edit-resource>
    <confirm-dialog
      :active.sync="showConfirmDialog"
      title="Confirmer la suppression ?"
      content="La ressource sera définitivement supprimé"
      confirm-text="Supprimer"
      cancel-text="Annuler"
      @cancel="onCancelDeleteResource"
      @confirm="onConfirmDeleteResource"
    />
    <div v-if="!$subReady.resources">
      <v-progress-linear indeterminate></v-progress-linear>
    </div>
    <div v-if="$subReady.resources">
      <empty-state
        v-if="resources.length == 0"
        rounded
        icon="category"
        :description="`Aucune ressource définie`"
      >
        <v-btn class="info" @click="newResource">Ajouter une ressource</v-btn>
      </empty-state>
      <div class="elevation-1">
        <v-list two-line v-show="resources.length != 0">
          <v-subheader>Ressources
            <v-btn flat icon @click="newResource">
              <v-icon>add</v-icon>
            </v-btn>
          </v-subheader>
          <template v-for="item in resources">
            <v-list-tile :key="item._id" avatar @click.stop="editResource(item._id)">
              <v-list-tile-avatar>
                <v-icon>category</v-icon>
              </v-list-tile-avatar>
              <v-list-tile-content>
                <v-list-tile-title>{{ item.name }}</v-list-tile-title>
                <v-list-tile-sub-title>{{ item.description }}</v-list-tile-sub-title>
              </v-list-tile-content>
              <v-list-tile-action>
                <v-btn icon flat color="grey darken-1" @click.stop="editResource(item._id)">
                  <v-icon>edit</v-icon>
                </v-btn>
              </v-list-tile-action>
              <v-list-tile-action>
                <v-btn icon flat color="grey darken-1" @click.stop="deleteResource(item._id)">
                  <v-icon>delete</v-icon>
                </v-btn>
              </v-list-tile-action>
            </v-list-tile>
          </template>
        </v-list>
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