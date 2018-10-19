
<template>
  <div class="organization-resources"> 
    <new-resource ref="newResource" :organizationId="organization._id"></new-resource>  
    <edit-resource ref="editResource"></edit-resource>  

    <md-dialog-confirm
      :md-active.sync="showConfirmDialog"
      md-title="Confirmer la suppression ?"
      md-content="La ressource sera définitivement supprimé"
      md-confirm-text="Supprimer"
      md-cancel-text="Annuler"
      @md-cancel="onCancelDeleteResource"
      @md-confirm="onConfirmDeleteResource" />


    <div v-if="!$subReady.resources">
      <v-progress-linear indeterminate></v-progress-linear>
    </div>
      
    <div v-if="$subReady.resources">

      <empty-state
        v-if="resources.length == 0"
        rounded
        icon="category"
        :description="`Aucune ressource définie`">
        <md-button class="md-primary md-raised" @click="newResource">Ajouter une ressource</md-button>
      </empty-state>

      <md-list class="md-double-line fap-list" v-show="resources.length != 0"> 
        <md-subheader>Ressources
        </md-subheader>

        <div class="md-elevation-1">
          <template v-for="item in resources" >
            <md-list-item :key='item._id'>
              <md-avatar class="md-avatar-icon md-primary">
                <md-icon>category</md-icon>
              </md-avatar>

              <div class="md-list-item-text pointer">
                <span>{{ item.name }}</span>
                <span>{{ item.description }}</span>
              </div>

              <md-button class="md-icon-button show-desktop" @click.stop="editResource(item._id)">
                <md-icon>edit</md-icon>
                <md-tooltip md-delay="300">Supprimer</md-tooltip>
              </md-button>
              <md-button class="md-icon-button show-desktop" @click.stop="deleteResource(item._id)">
                <md-icon>delete</md-icon>
                <md-tooltip md-delay="300">Supprimer</md-tooltip>
              </md-button>
            </md-list-item>
            <md-divider></md-divider>
          </template>
        </div>
      </md-list>

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
import { Organizations } from '/imports/api/organizations/organizations.js'
import { Resources } from '/imports/api/resources/resources.js'

export default {
  name: 'organization-resources',
  props: {
    organization: {
      type: Object,
      default: {}
    }
  },
  data () {
    return {
      showConfirmDialog: false,
    }
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
    },
  },
  meteor: {
    // Subscriptions
    $subscribe: {
      resources: function() {
        return [this.organization._id];
      }
    },
    resources() {
      return Resources.find({}, {sort: {name: 1}});
    },
  }
}
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